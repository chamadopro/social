import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { auditLog } from '../utils/logger';

export class AvaliacaoController {
  // Obter avaliações de um usuário
  public async getAvaliacoesByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, tipo } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Verificar se o usuário existe
      const user = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true, nome: true }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      const where: any = { avaliado_id: userId };
      if (tipo) where.tipo = tipo;

      const [avaliacoes, total] = await Promise.all([
        config.prisma.avaliacao.findMany({
          where,
          skip,
          take,
          include: {
            avaliador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                tipo: true
              }
            },
            contrato: {
              select: {
                id: true,
                valor: true,
                status: true
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.avaliacao.count({ where })
      ]);

      // Calcular estatísticas
      const stats = await config.prisma.avaliacao.aggregate({
        where: { avaliado_id: userId },
        _avg: { nota: true },
        _count: { nota: true },
        _sum: { nota: true }
      });

      res.json({
        success: true,
        data: {
          avaliacoes,
          stats: {
            media: stats._avg.nota || 0,
            total: stats._count.nota || 0,
            soma: stats._sum.nota || 0
          },
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter avaliação por ID
  public async getAvaliacaoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const avaliacao = await config.prisma.avaliacao.findUnique({
        where: { id: id! },
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          },
          contrato: {
            select: {
              id: true,
              valor: true,
              status: true
            }
          }
        }
      });

      if (!avaliacao) {
        res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: { avaliacao }
      });

    } catch (error) {
      next(error);
    }
  }

  // Criar avaliação
  public async createAvaliacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        avaliado_id, 
        contrato_id, 
        nota, 
        comentario, 
        // tipo = 'SERVICO',
        aspectos = {}
      } = req.body;
      const avaliadorId = req.user!.id;

      // Verificar se o usuário está tentando se auto-avaliar
      if (avaliadorId === avaliado_id) {
        res.status(400).json({
          success: false,
          message: 'Você não pode se auto-avaliar'
        });
        return;
      }

      // Verificar se o contrato existe e se o usuário tem permissão
      const contrato = await config.prisma.contrato.findUnique({
        where: { id: contrato_id },
        select: { 
          id: true, 
          cliente_id: true, 
          prestador_id: true, 
          status: true 
        }
      });

      if (!contrato) {
        res.status(404).json({
          success: false,
          message: 'Contrato não encontrado'
        });
        return;
      }

      // Verificar se o usuário tem permissão para avaliar
      const canEvaluate = contrato.cliente_id === avaliadorId || contrato.prestador_id === avaliadorId;
      if (!canEvaluate) {
        res.status(403).json({
          success: false,
          message: 'Você não tem permissão para avaliar este contrato'
        });
        return;
      }

      // Verificar se o contrato está finalizado
      if (contrato.status !== 'CONCLUIDO') {
        res.status(400).json({
          success: false,
          message: 'Apenas contratos concluídos podem ser avaliados'
        });
        return;
      }

      // Verificar se já existe uma avaliação para este contrato
      const existingAvaliacao = await config.prisma.avaliacao.findFirst({
        where: {
          contrato_id: contrato_id,
          avaliador_id: avaliadorId
        },
        select: {
          id: true,
          contrato_id: true,
          avaliado_id: true,
          nota: true,
          avaliador_id: true,
          data_criacao: true
        }
      });

      if (existingAvaliacao) {
        res.status(409).json({
          success: false,
          message: 'Você já avaliou este contrato'
        });
        return;
      }

      // Determinar quem está sendo avaliado
      const isEvaluatingClient = contrato.cliente_id === avaliadorId;
      const targetUserId = isEvaluatingClient ? contrato.prestador_id : contrato.cliente_id;

      // Criar avaliação
      const avaliacao = await config.prisma.avaliacao.create({
        data: {
          id: require('uuid').v4(),
          avaliador_id: avaliadorId,
          avaliado_id: targetUserId,
          contrato_id: contrato_id,
          nota: Number(nota),
          comentario: comentario || '',
          // tipo: tipo, // Campo removido temporariamente
          aspectos: aspectos
        },
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          }
        }
      });

      // Atualizar reputação do usuário avaliado
      await this.updateUserReputation(targetUserId);

      // Log de auditoria
      auditLog('AVALIACAO_CREATE', {
        userId: avaliadorId,
        avaliacaoId: avaliacao.id,
        avaliadoId: targetUserId,
        nota: nota,
        contratoId: contrato_id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Avaliação criada com sucesso',
        data: { avaliacao }
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar avaliação
  public async updateAvaliacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const avaliadorId = req.user!.id;

      // Verificar se a avaliação existe e se o usuário é o dono
      const existingAvaliacao = await config.prisma.avaliacao.findUnique({
        where: { id: id! },
        select: { 
          id: true, 
          avaliador_id: true, 
          avaliado_id: true,
          contrato_id: true,
          nota: true,
          data_criacao: true
        }
      });

      if (!existingAvaliacao) {
        res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
        return;
      }

      if (existingAvaliacao.avaliador_id !== avaliadorId) {
        res.status(403).json({
          success: false,
          message: 'Você não tem permissão para editar esta avaliação'
        });
        return;
      }

      // Verificar se a avaliação pode ser editada (apenas nas primeiras 24h)
      const now = new Date();
      const avaliacaoDate = new Date(existingAvaliacao.data_criacao || now);
      const hoursDiff = (now.getTime() - avaliacaoDate.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        res.status(400).json({
          success: false,
          message: 'Avaliações só podem ser editadas nas primeiras 24 horas'
        });
        return;
      }

      // Remover campos que não podem ser atualizados
      delete updateData.id;
      delete updateData.avaliador_id;
      delete updateData.avaliado_id;
      delete updateData.contrato_id;
      delete updateData.data_criacao;

      const avaliacao = await config.prisma.avaliacao.update({
        where: { id: id! },
        data: updateData,
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          },
          avaliado: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              tipo: true
            }
          }
        }
      });

      // Atualizar reputação do usuário avaliado
      await this.updateUserReputation(existingAvaliacao.avaliado_id);

      // Log de auditoria
      auditLog('AVALIACAO_UPDATE', {
        userId: avaliadorId,
        avaliacaoId: id,
        changes: updateData,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Avaliação atualizada com sucesso',
        data: { avaliacao }
      });

    } catch (error) {
      next(error);
    }
  }

  // Deletar avaliação
  public async deleteAvaliacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const avaliadorId = req.user!.id;

      // Verificar se a avaliação existe e se o usuário é o dono
      const existingAvaliacao = await config.prisma.avaliacao.findUnique({
        where: { id: id! },
        select: { 
          id: true, 
          avaliador_id: true, 
          avaliado_id: true 
        }
      });

      if (!existingAvaliacao) {
        res.status(404).json({
          success: false,
          message: 'Avaliação não encontrada'
        });
        return;
      }

      if (existingAvaliacao.avaliador_id !== avaliadorId) {
        res.status(403).json({
          success: false,
          message: 'Você não tem permissão para deletar esta avaliação'
        });
        return;
      }

      // Deletar avaliação
      await config.prisma.avaliacao.delete({
        where: { id: id! }
      });

      // Atualizar reputação do usuário avaliado
      await this.updateUserReputation(existingAvaliacao.avaliado_id);

      // Log de auditoria
      auditLog('AVALIACAO_DELETE', {
        userId: avaliadorId,
        avaliacaoId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Avaliação deletada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter estatísticas de reputação de um usuário
  public async getReputacaoStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;

      // Verificar se o usuário existe
      const user = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: { id: true, nome: true, reputacao: true }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
        return;
      }

      // Obter estatísticas detalhadas
      const stats = await config.prisma.avaliacao.aggregate({
        where: { avaliado_id: userId },
        _avg: { nota: true },
        _count: { nota: true },
        _sum: { nota: true },
        _min: { nota: true },
        _max: { nota: true }
      });

      // Obter distribuição de notas
      const distribuicao = await config.prisma.avaliacao.groupBy({
        by: ['nota'],
        where: { avaliado_id: userId },
        _count: { nota: true }
      });

      // Obter avaliações recentes
      const avaliacoesRecentes = await config.prisma.avaliacao.findMany({
        where: { avaliado_id: userId },
        take: 5,
        include: {
          avaliador: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true
            }
          }
        },
        orderBy: { data_criacao: 'desc' }
      });

      res.json({
        success: true,
        data: {
          usuario: {
            id: user.id,
            nome: user.nome,
            reputacao: user.reputacao
          },
          estatisticas: {
            media: stats._avg.nota || 0,
            total: stats._count.nota || 0,
            soma: stats._sum.nota || 0,
            menor: stats._min.nota || 0,
            maior: stats._max.nota || 0
          },
          distribuicao: distribuicao.map(item => ({
            nota: item.nota,
            quantidade: item._count.nota
          })),
          avaliacoesRecentes
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar reputação de um usuário
  private async updateUserReputation(userId: string): Promise<void> {
    try {
      // Calcular nova reputação baseada nas avaliações
      const stats = await config.prisma.avaliacao.aggregate({
        where: { avaliado_id: userId },
        _avg: { nota: true },
        _count: { nota: true }
      });

      const novaReputacao = stats._avg.nota || 0;
      // const totalAvaliacoes = stats._count.nota || 0;

      // Atualizar reputação no banco
      await config.prisma.usuario.update({
        where: { id: userId },
        data: { 
          reputacao: novaReputacao
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar reputação:', error);
    }
  }

  // Obter ranking de usuários por reputação
  public async getRankingReputacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, tipo } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        reputacao: { gt: 0 }
      };

      if (tipo) where.tipo = tipo;

      const [usuarios, total] = await Promise.all([
        config.prisma.usuario.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            nome: true,
            foto_perfil: true,
            tipo: true,
            reputacao: true,
            data_cadastro: true
          },
          orderBy: [
            { reputacao: 'desc' }
          ]
        }),
        config.prisma.usuario.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          usuarios,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }
}