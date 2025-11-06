import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  // CustomError, 
  notFoundError, 
  forbidden, 
  badRequest,
  conflict 
} from '../middleware/errorHandler';
import { auditLog } from '../utils/logger';

export class UserController {
  // Obter todos os usuários (apenas moderadores e admins)
  public async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, tipo, ativo, verificado, search } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = {};
      
      if (tipo) where.tipo = tipo;
      if (ativo !== undefined) where.ativo = ativo === 'true';
      if (verificado !== undefined) where.verificado = verificado === 'true';
      if (search) {
        where.OR = [
          { nome: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        config.prisma.usuario.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            tipo: true,
            nome: true,
            email: true,
            telefone: true,
            ativo: true,
            verificado: true,
            reputacao: true,
            pontos_penalidade: true,
            data_cadastro: true,
            data_atualizacao: true,
          },
          orderBy: { data_cadastro: 'desc' }
        }),
        config.prisma.usuario.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users,
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

  // Obter usuário por ID
  public async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;

      // Verificar se pode acessar o usuário
      if (id !== currentUserId && !['MODERADOR', 'ADMIN'].includes(req.user!.tipo)) {
        throw forbidden('Acesso negado');
      }

      const user = await config.prisma.usuario.findUnique({
        where: { id: id! },
        select: {
          id: true,
          tipo: true,
          nome: true,
          email: true,
          telefone: true,
          cpf_cnpj: true,
          data_nascimento: true,
          endereco: true,
          foto_perfil: true,
          ativo: true,
          verificado: true,
          reputacao: true,
          pontos_penalidade: true,
          data_cadastro: true,
          data_atualizacao: true,
        }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar usuário
  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;
      const updateData = req.body;

      // Verificar se pode atualizar o usuário
      if (id !== currentUserId && !['ADMIN'].includes(req.user!.tipo)) {
        throw forbidden('Acesso negado');
      }

      // Remover campos que não podem ser atualizados
      delete updateData.id;
      delete updateData.tipo;
      delete updateData.senha;
      delete updateData.ativo;
      delete updateData.verificado;
      delete updateData.pontos_penalidade;
      delete updateData.data_cadastro;

      // Se estiver atualizando email, verificar se já existe
      if (updateData.email) {
        const existingUser = await config.prisma.usuario.findFirst({
          where: { email: updateData.email },
          select: { id: true }
        });
        
        if (existingUser && existingUser.id !== id) {
          throw conflict('Email já cadastrado');
        }
      }

      // Se estiver atualizando CPF/CNPJ, verificar se já existe
      if (updateData.cpf_cnpj) {
        const existingUser = await config.prisma.usuario.findUnique({
          where: { cpf_cnpj: updateData.cpf_cnpj }
        });
        
        if (existingUser && existingUser.id !== id) {
          throw conflict('CPF/CNPJ já cadastrado');
        }
      }

      const user = await config.prisma.usuario.update({
        where: { id: id! },
        data: updateData,
        select: {
          id: true,
          tipo: true,
          nome: true,
          email: true,
          telefone: true,
          cpf_cnpj: true,
          data_nascimento: true,
          endereco: true,
          foto_perfil: true,
          ativo: true,
          verificado: true,
          reputacao: true,
          pontos_penalidade: true,
          data_cadastro: true,
          data_atualizacao: true,
        }
      });

      // Log de auditoria
      auditLog('USER_UPDATE', {
        userId: currentUserId,
        targetUserId: id,
        changes: updateData,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Deletar usuário (apenas admins)
  public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;

      // Não permitir deletar a própria conta
      if (id === currentUserId) {
        throw badRequest('Não é possível deletar sua própria conta');
      }

      // Verificar se usuário existe
      const user = await config.prisma.usuario.findUnique({
        where: { id: id! }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      // Soft delete - apenas desativar
      await config.prisma.usuario.update({
        where: { id: id! },
        data: { ativo: false }
      });

      // Log de auditoria
      auditLog('USER_DELETE', {
        userId: currentUserId,
        targetUserId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Ativar usuário
  public async activateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;

      const user = await config.prisma.usuario.update({
        where: { id: id! },
        data: { ativo: true },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
        }
      });

      // Log de auditoria
      auditLog('USER_ACTIVATE', {
        userId: currentUserId,
        targetUserId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário ativado com sucesso',
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Desativar usuário
  public async deactivateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;

      const user = await config.prisma.usuario.update({
        where: { id: id! },
        data: { ativo: false },
        select: {
          id: true,
          nome: true,
          email: true,
          ativo: true,
        }
      });

      // Log de auditoria
      auditLog('USER_DEACTIVATE', {
        userId: currentUserId,
        targetUserId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso',
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Verificar usuário
  public async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user!.id;

      const user = await config.prisma.usuario.update({
        where: { id: id! },
        data: { verificado: true },
        select: {
          id: true,
          nome: true,
          email: true,
          verificado: true,
        }
      });

      // Log de auditoria
      auditLog('USER_VERIFY', {
        userId: currentUserId,
        targetUserId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário verificado com sucesso',
        data: { user }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter posts do usuário
  public async getUserPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, tipo, status } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = { usuario_id: id };
      if (tipo) where.tipo = tipo;
      if (status) where.status = status;

      const [posts, total] = await Promise.all([
        config.prisma.post.findMany({
          where,
          skip,
          take,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
              }
            },
            _count: {
              select: {
                orcamentos: true,
                curtidas: true,
                comentarios: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.post.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          posts,
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

  // Obter orçamentos do usuário
  public async getUserOrcamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        OR: [
          { prestador_id: id },
          { cliente_id: id }
        ]
      };
      if (status) where.status = status;

      const [orcamentos, total] = await Promise.all([
        config.prisma.orcamento.findMany({
          where,
          skip,
          take,
          include: {
            post: {
              select: {
                id: true,
                titulo: true,
                categoria: true,
                localizacao: true,
              }
            },
            prestador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
              }
            },
            cliente: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.orcamento.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          orcamentos,
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

  // Obter contratos do usuário
  public async getUserContratos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        OR: [
          { prestador_id: id },
          { cliente_id: id }
        ]
      };
      if (status) where.status = status;

      const [contratos, total] = await Promise.all([
        config.prisma.contrato.findMany({
          where,
          skip,
          take,
          include: {
            orcamento: {
              select: {
                id: true,
                descricao: true,
                prazo_execucao: true,
              }
            },
            prestador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
              }
            },
            cliente: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
              }
            },
            pagamento: {
              select: {
                id: true,
                status: true,
                metodo: true,
                data_pagamento: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.contrato.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          contratos,
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

  // Obter avaliações do usuário
  public async getUserAvaliacoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where = {
        OR: [
          { avaliador_id: id! },
          { avaliado_id: id! }
        ]
      };

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
              }
            },
            avaliado: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
              }
            },
            contrato: {
              select: {
                id: true,
                valor: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.avaliacao.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          avaliacoes,
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

  // Obter reputação do usuário
  public async getUserReputacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await config.prisma.usuario.findUnique({
        where: { id: id! },
        select: {
          id: true,
          nome: true,
          reputacao: true,
          pontos_penalidade: true,
        }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      // Calcular estatísticas de reputação
      const stats = await config.prisma.avaliacao.aggregate({
        where: { avaliado_id: id! },
        _avg: { nota: true },
        _count: { nota: true },
        _sum: { nota: true }
      });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nome: user.nome,
            reputacao: user.reputacao,
            pontos_penalidade: user.pontos_penalidade,
          },
          stats: {
            media: stats._avg?.nota || 0,
            total: stats._count?.nota || 0,
            soma: stats._sum?.nota || 0,
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Adicionar penalidade
  public async addPenalty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { pontos, motivo } = req.body;
      const currentUserId = req.user!.id;

      const user = await config.prisma.usuario.findUnique({
        where: { id: id! }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      const newPontos = user.pontos_penalidade + pontos;

      await config.prisma.usuario.update({
        where: { id: id! },
        data: { pontos_penalidade: newPontos }
      });

      // Log de auditoria
      auditLog('PENALTY_ADDED', {
        userId: currentUserId,
        targetUserId: id,
        pontos,
        motivo,
        totalPontos: newPontos,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Penalidade adicionada com sucesso',
        data: {
          pontosAdicionados: pontos,
          totalPontos: newPontos,
          motivo
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Remover penalidade
  public async removePenalty(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { pontos, motivo } = req.body;
      const currentUserId = req.user!.id;

      const user = await config.prisma.usuario.findUnique({
        where: { id: id! }
      });

      if (!user) {
        throw notFoundError('Usuário não encontrado');
      }

      const newPontos = Math.max(0, user.pontos_penalidade - pontos);

      await config.prisma.usuario.update({
        where: { id: id! },
        data: { pontos_penalidade: newPontos }
      });

      // Log de auditoria
      auditLog('PENALTY_REMOVED', {
        userId: currentUserId,
        targetUserId: id,
        pontos,
        motivo,
        totalPontos: newPontos,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Penalidade removida com sucesso',
        data: {
          pontosRemovidos: pontos,
          totalPontos: newPontos,
          motivo
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Verificar se email já existe (público - para validação em tempo real)
  public async checkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;
      
      if (!email) {
        res.json({ success: true, exists: false });
        return;
      }

      const user = await config.prisma.usuario.findFirst({
        where: { email: email as string },
        select: { id: true }
      });

      res.json({ success: true, exists: !!user });
    } catch (error) {
      next(error);
    }
  }

  // Verificar se CPF/CNPJ já existe (público - para validação em tempo real)
  public async checkDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { document } = req.query;
      
      if (!document) {
        res.json({ success: true, exists: false });
        return;
      }

      const user = await config.prisma.usuario.findUnique({
        where: { cpf_cnpj: document as string },
        select: { id: true }
      });

      res.json({ success: true, exists: !!user });
    } catch (error) {
      next(error);
    }
  }
}

