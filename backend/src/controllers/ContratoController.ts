import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  // CustomError, 
  notFoundError, 
  forbidden, 
  badRequest
  // conflict 
} from '../middleware/errorHandler';
import { auditLog } from '../utils/logger';
import { notificationService } from '../services/NotificationService';

export class ContratoController {
  // Obter todos os contratos do usuário
  public async getAllContratos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        tipo = 'all' // 'cliente', 'prestador', 'all'
      } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);
      const usuarioId = req.user!.id;

      // Construir filtros
      let where: any = {};
      
      if (tipo === 'cliente') {
        where.cliente_id = usuarioId;
      } else if (tipo === 'prestador') {
        where.prestador_id = usuarioId;
      } else {
        where.OR = [
          { cliente_id: usuarioId },
          { prestador_id: usuarioId }
        ];
      }
      
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
                fotos: true,
              }
            },
            prestador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
                telefone: true,
              }
            },
            cliente: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
                telefone: true,
              }
            },
            pagamento: {
              select: {
                id: true,
                status: true,
                metodo: true,
                valor: true,
                data_pagamento: true,
                data_liberacao: true,
              }
            },
            _count: {
              select: {
                mensagens: true,
                avaliacoes: true,
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

  // Obter contrato por ID
  public async getContratoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        include: {
          orcamento: {
            select: {
              id: true,
              descricao: true,
              prazo_execucao: true,
              fotos: true,
              garantia: true,
              desconto: true,
            }
          },
          prestador: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              reputacao: true,
              telefone: true,
              endereco: true,
            }
          },
          cliente: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              reputacao: true,
              telefone: true,
              endereco: true,
            }
          },
          pagamento: {
            select: {
              id: true,
              status: true,
              metodo: true,
              valor: true,
              taxa_plataforma: true,
              data_pagamento: true,
              data_liberacao: true,
            }
          },
          mensagens: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  foto_perfil: true,
                }
              }
            },
            orderBy: { data_criacao: 'asc' }
          },
          avaliacoes: {
            include: {
              avaliador: {
                select: {
                  id: true,
                  nome: true,
                  foto_perfil: true,
                }
              }
            }
          },
          disputa: {
            select: {
              id: true,
              tipo: true,
              status: true,
              descricao: true,
              data_criacao: true,
            }
          }
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // Verificar se o usuário tem acesso ao contrato
      if (contrato.cliente_id !== usuarioId && contrato.prestador_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      res.json({
        success: true,
        data: { contrato }
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar contrato
  public async updateContrato(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const usuarioId = req.user!.id;

      // Verificar se o contrato existe e se o usuário tem acesso
      const existingContrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { cliente_id: true, prestador_id: true, status: true }
      });

      if (!existingContrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (existingContrato.cliente_id !== usuarioId && existingContrato.prestador_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      // Remover campos que não podem ser atualizados
      delete updateData.id;
      delete updateData.orcamento_id;
      delete updateData.cliente_id;
      delete updateData.prestador_id;
      delete updateData.data_criacao;

      const contrato = await config.prisma.contrato.update({
        where: { id },
        data: updateData,
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
          }
        }
      });

      // Log de auditoria
      auditLog('CONTRATO_UPDATE', {
        userId: usuarioId,
        contratoId: id,
        changes: updateData,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Contrato atualizado com sucesso',
        data: { contrato }
      });

    } catch (error) {
      next(error);
    }
  }

  // Iniciar serviço
  public async iniciarServico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { fotos_antes } = req.body; // Array de URLs das fotos
      const usuarioId = req.user!.id;

      // Verificar se o contrato existe e se o usuário é cliente ou prestador
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { 
          prestador_id: true,
          cliente_id: true,
          status: true,
          data_inicio: true,
          pagamento: {
            select: { status: true }
          }
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // Verificar se o usuário é cliente ou prestador do contrato
      const isCliente = contrato.cliente_id === usuarioId;
      const isPrestador = contrato.prestador_id === usuarioId;

      if (!isCliente && !isPrestador) {
        throw forbidden('Acesso negado. Você não é cliente nem prestador deste contrato.');
      }

      // Verificar se já foi iniciado
      if (contrato.data_inicio) {
        throw badRequest('Serviço já foi iniciado');
      }

      if (contrato.status !== 'ATIVO') {
        throw badRequest('Apenas contratos ativos podem ser iniciados');
      }

      if (contrato.pagamento?.status !== 'PAGO') {
        throw badRequest('Pagamento deve ser confirmado antes de iniciar o serviço');
      }

      // Validar fotos (se fornecidas)
      const fotosAntesArray = Array.isArray(fotos_antes) ? fotos_antes : (fotos_antes ? [fotos_antes] : []);
      
      // Determinar quem iniciou
      const quemIniciou = isCliente ? 'CLIENTE' : 'PRESTADOR';

      // Atualizar status do contrato com fotos
      await config.prisma.contrato.update({
        where: { id },
        data: { 
          status: 'EM_EXECUCAO',
          data_inicio: new Date(),
          quem_iniciou: quemIniciou,
          fotos_antes: fotosAntesArray
        }
      });

      // Enviar notificação para a outra parte
      const outroUsuarioId = isCliente ? contrato.prestador_id : contrato.cliente_id;
      await notificationService.createNotification(
        outroUsuarioId,
        'SERVICO_CONCLUIDO',
        'Serviço Iniciado',
        `O serviço foi iniciado por ${isCliente ? 'o cliente' : 'o prestador'}.`
      );

      // Log de auditoria
      auditLog('SERVICE_START', {
        userId: usuarioId,
        contratoId: id,
        quemIniciou: quemIniciou,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Serviço iniciado com sucesso',
        data: {
          data_inicio: new Date(),
          quem_iniciou: quemIniciou
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Concluir serviço
  public async concluirServico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o contrato existe e se o usuário é cliente ou prestador
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { 
          prestador_id: true,
          cliente_id: true, 
          status: true,
          data_inicio: true,
          data_fim: true,
          valor: true,
          pagamento: {
            select: {
              id: true,
              status: true
            }
          }
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // Verificar se o usuário é cliente ou prestador do contrato
      const isCliente = contrato.cliente_id === usuarioId;
      const isPrestador = contrato.prestador_id === usuarioId;

      if (!isCliente && !isPrestador) {
        throw forbidden('Acesso negado. Você não é cliente nem prestador deste contrato.');
      }

      // Verificar se já foi finalizado
      if (contrato.data_fim) {
        throw badRequest('Serviço já foi finalizado');
      }

      // Verificar se foi iniciado
      if (!contrato.data_inicio) {
        throw badRequest('Serviço precisa ser iniciado antes de ser finalizado');
      }

      if (contrato.status !== 'EM_EXECUCAO') {
        throw badRequest('Apenas serviços em execução podem ser finalizados');
      }

      const { fotos_depois } = req.body; // Array de URLs das fotos do estado final

      // Determinar quem finalizou
      const quemFinalizou = isCliente ? 'CLIENTE' : 'PRESTADOR';
      const dataFim = new Date();

      // Validar fotos (se fornecidas)
      const fotosDepoisArray = Array.isArray(fotos_depois) ? fotos_depois : (fotos_depois ? [fotos_depois] : []);

      // Obter configuração de tempo de liberação (padrão: 24 horas)
      const configLiberacao = await config.prisma.configuracoesSistema.findUnique({
        where: { chave: 'TEMPO_LIBERACAO_PRESTADOR' }
      });
      const tempoLiberacaoHoras = configLiberacao ? parseInt(configLiberacao.valor) : 24;

      // Calcular data de liberação prevista (se prestador finalizou)
      let dataLiberacaoPrevista: Date | null = null;
      let aguardandoLiberacao = false;

      if (quemFinalizou === 'PRESTADOR') {
        // Prestador finalizou: agendar liberação após período configurado
        dataLiberacaoPrevista = new Date(dataFim);
        dataLiberacaoPrevista.setHours(dataLiberacaoPrevista.getHours() + tempoLiberacaoHoras);
        aguardandoLiberacao = true;
      } else {
        // Cliente finalizou: liberação imediata
        dataLiberacaoPrevista = dataFim;
        aguardandoLiberacao = false;
      }

      // Atualizar contrato e pagamento em transação
      await config.prisma.$transaction(async (prisma) => {
        // Atualizar status do contrato com fotos
        await prisma.contrato.update({
          where: { id },
          data: { 
            status: 'CONCLUIDO',
            data_fim: dataFim,
            quem_finalizou: quemFinalizou,
            aguardando_liberacao: aguardandoLiberacao,
            data_liberacao_prevista: dataLiberacaoPrevista,
            fotos_depois: fotosDepoisArray
          }
        });

        // Atualizar pagamento
        if (contrato.pagamento) {
          const statusPagamento = quemFinalizou === 'CLIENTE' ? 'LIBERADO' : 'AGUARDANDO_LIBERACAO';
          
          await prisma.pagamento.update({
            where: { id: contrato.pagamento.id },
            data: {
              status: statusPagamento,
              data_liberacao: quemFinalizou === 'CLIENTE' ? dataFim : dataLiberacaoPrevista,
              liberado_por: quemFinalizou === 'CLIENTE' ? 'CLIENTE' : null,
              motivo_liberacao: quemFinalizou === 'CLIENTE' 
                ? 'Liberação imediata por confirmação do cliente' 
                : `Liberação agendada após ${tempoLiberacaoHoras}h (finalizado por prestador)`
            }
          });
        }
      });

      // Enviar notificações
      const outroUsuarioId = isCliente ? contrato.prestador_id : contrato.cliente_id;
      
      if (quemFinalizou === 'CLIENTE') {
        // Cliente finalizou: notificar prestador que pagamento foi liberado
        await notificationService.createNotification(
          outroUsuarioId,
          'PAGAMENTO_CONFIRMADO',
          'Pagamento Liberado',
          `O cliente finalizou o serviço. Pagamento liberado imediatamente.`
        );
      } else {
        // Prestador finalizou: notificar cliente e informar período de espera
        await notificationService.createNotification(
          outroUsuarioId,
          'SERVICO_CONCLUIDO',
          'Serviço Finalizado',
          `O prestador finalizou o serviço. Pagamento será liberado automaticamente em ${tempoLiberacaoHoras}h. Você pode confirmar antes para liberar imediatamente.`
        );
      }

      // Log de auditoria
      auditLog('SERVICE_COMPLETE', {
        userId: usuarioId,
        contratoId: id,
        quemFinalizou: quemFinalizou,
        liberacaoImediata: quemFinalizou === 'CLIENTE',
        tempoLiberacao: quemFinalizou === 'PRESTADOR' ? tempoLiberacaoHoras : 0,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const mensagem = quemFinalizou === 'CLIENTE'
        ? 'Serviço finalizado com sucesso. Pagamento liberado imediatamente.'
        : `Serviço finalizado com sucesso. Pagamento será liberado automaticamente em ${tempoLiberacaoHoras}h.`;

      res.json({
        success: true,
        message: mensagem,
        data: {
          data_fim: dataFim,
          quem_finalizou: quemFinalizou,
          liberacao_imediata: quemFinalizou === 'CLIENTE',
          data_liberacao_prevista: dataLiberacaoPrevista,
          tempo_liberacao_horas: quemFinalizou === 'PRESTADOR' ? tempoLiberacaoHoras : 0
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Cancelar contrato
  public async cancelarContrato(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o contrato existe e se o usuário tem acesso
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { cliente_id: true, prestador_id: true, status: true }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (contrato.cliente_id !== usuarioId && contrato.prestador_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      if (['CANCELADO', 'CONCLUIDO'].includes(contrato.status)) {
        throw badRequest('Contrato não pode ser cancelado');
      }

      // Atualizar status
      await config.prisma.contrato.update({
        where: { id },
        data: { status: 'CANCELADO' }
      });

      // Log de auditoria
      auditLog('CONTRATO_CANCEL', {
        userId: usuarioId,
        contratoId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Contrato cancelado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Confirmar entrega
  public async confirmarEntrega(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const clienteId = req.user!.id;

      // Verificar se o contrato existe e se o usuário é o cliente
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { 
          cliente_id: true, 
          status: true,
          prestador_id: true,
          valor: true
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (contrato.cliente_id !== clienteId) {
        throw forbidden('Acesso negado');
      }

      if (contrato.status !== 'CONCLUIDO') {
        throw badRequest('Apenas contratos concluídos podem ter entrega confirmada');
      }

      // Usar transação para garantir consistência
      await config.prisma.$transaction(async (prisma) => {
        // Atualizar status do contrato
        await prisma.contrato.update({
          where: { id },
          data: { status: 'CONCLUIDO' }
        });

        // Atualizar status do pagamento para liberar
        await prisma.pagamento.updateMany({
          where: { contrato_id: id },
          data: { 
            status: 'LIBERADO',
            data_liberacao: new Date()
          }
        });
      });

      // Log de auditoria
      auditLog('DELIVERY_CONFIRM', {
        userId: clienteId,
        contratoId: id,
        prestadorId: contrato.prestador_id,
        valor: contrato.valor,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Entrega confirmada com sucesso. Pagamento liberado para o prestador.'
      });

    } catch (error) {
      next(error);
    }
  }

  // Upload de evidência inicial
  public async uploadEvidenciaInicial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prestadorId = req.user!.id;
      const { fotos } = req.body;

      // Verificar se o contrato existe e se o usuário é o prestador
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { prestador_id: true, status: true }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (contrato.prestador_id !== prestadorId) {
        throw forbidden('Acesso negado');
      }

      if (contrato.status !== 'ATIVO') {
        throw badRequest('Apenas contratos ativos podem receber evidências');
      }

      // Aqui você salvaria as fotos no storage (AWS S3, etc.)
      // Por enquanto, vamos apenas simular o salvamento

      // Log de auditoria
      auditLog('EVIDENCE_INITIAL_UPLOAD', {
        userId: prestadorId,
        contratoId: id,
        fotos: fotos?.length || 0,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Evidência inicial enviada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Upload de evidência de progresso
  public async uploadEvidenciaProgresso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prestadorId = req.user!.id;
      const { fotos } = req.body;

      // Verificar se o contrato existe e se o usuário é o prestador
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { prestador_id: true, status: true }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (contrato.prestador_id !== prestadorId) {
        throw forbidden('Acesso negado');
      }

      if (contrato.status !== 'ATIVO') {
        throw badRequest('Apenas contratos ativos podem receber evidências');
      }

      // Aqui você salvaria as fotos no storage
      // Por enquanto, vamos apenas simular o salvamento

      // Log de auditoria
      auditLog('EVIDENCE_PROGRESS_UPLOAD', {
        userId: prestadorId,
        contratoId: id,
        fotos: fotos?.length || 0,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Evidência de progresso enviada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Upload de evidência final
  public async uploadEvidenciaFinal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prestadorId = req.user!.id;
      const { fotos } = req.body;

      // Verificar se o contrato existe e se o usuário é o prestador
      const contrato = await config.prisma.contrato.findUnique({
        where: { id },
        select: { prestador_id: true, status: true }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      if (contrato.prestador_id !== prestadorId) {
        throw forbidden('Acesso negado');
      }

      if (contrato.status !== 'ATIVO') {
        throw badRequest('Apenas contratos ativos podem receber evidências');
      }

      // Aqui você salvaria as fotos no storage
      // Por enquanto, vamos apenas simular o salvamento

      // Log de auditoria
      auditLog('EVIDENCE_FINAL_UPLOAD', {
        userId: prestadorId,
        contratoId: id,
        fotos: fotos?.length || 0,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Evidência final enviada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter andamentos dos serviços
  public async getAndamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo, status, page = 1, limit = 20 } = req.query;
      const usuarioId = req.user!.id;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Construir filtros baseado no tipo (PRESTADOR ou CLIENTE)
      const where: any = {};

      if (tipo === 'PRESTADOR') {
        where.prestador_id = usuarioId;
      } else if (tipo === 'CLIENTE') {
        where.cliente_id = usuarioId;
      } else {
        // Se não especificado, busca contratos onde o usuário é cliente OU prestador
        where.OR = [
          { prestador_id: usuarioId },
          { cliente_id: usuarioId }
        ];
      }

      // Filtro por status se fornecido
      if (status) {
        where.status = status;
      } else {
        // Por padrão, mostra apenas contratos ativos ou em execução
        where.status = {
          in: ['ATIVO', 'EM_EXECUCAO', 'CONCLUIDO']
        };
      }

      const [contratos, total] = await Promise.all([
        config.prisma.contrato.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { data_atualizacao: 'desc' },
          include: {
            orcamento: {
              include: {
                post: {
                  select: {
                    id: true,
                    categoria: true,
                    titulo: true,
                  }
                }
              }
            },
            cliente: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
              }
            },
            prestador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
              }
            },
            pagamento: {
              select: {
                id: true,
                status: true,
                valor: true,
                data_liberacao: true,
                liberado_por: true,
              }
            }
          }
        }),
        config.prisma.contrato.count({ where })
      ]);

      // Formatar resposta
      const andamentos = contratos.map(contrato => ({
        id: contrato.id,
        status: contrato.status,
        valor: contrato.valor,
        data_inicio: contrato.data_inicio,
        data_fim: contrato.data_fim,
        quem_iniciou: contrato.quem_iniciou,
        quem_finalizou: contrato.quem_finalizou,
        aguardando_liberacao: contrato.aguardando_liberacao,
        data_liberacao_prevista: contrato.data_liberacao_prevista,
        cliente: contrato.cliente,
        prestador: contrato.prestador,
        categoria: contrato.orcamento?.post?.categoria,
        titulo: contrato.orcamento?.post?.titulo,
        pagamento: contrato.pagamento,
        data_criacao: contrato.data_criacao,
        data_atualizacao: contrato.data_atualizacao,
      }));

      res.json({
        success: true,
        data: {
          andamentos,
          paginacao: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter contratos concluídos do cliente (para associar em Vitrine Cliente)
  public async getContratosConcluidos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data_inicio, data_fim } = req.query;
      const usuarioId = req.user!.id;

      // Construir filtros - busca contratos onde o usuário é cliente
      // Permite tanto CLIENTE puro quanto PRESTADOR híbrido (que tem contratos como cliente)
      const where: any = {
        cliente_id: usuarioId,
        status: 'CONCLUIDO'
      };

      // Filtro por data se fornecido
      if (data_inicio || data_fim) {
        where.data_atualizacao = {};
        if (data_inicio) {
          where.data_atualizacao.gte = new Date(data_inicio as string);
        }
        if (data_fim) {
          where.data_atualizacao.lte = new Date(data_fim as string);
        }
      }

      const contratos = await config.prisma.contrato.findMany({
        where,
        include: {
          orcamento: {
            include: {
              post: {
                select: {
                  id: true,
                  categoria: true,
                  titulo: true,
                }
              }
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
          _count: {
            select: {
              avaliacoes: true
            }
          }
        },
        orderBy: { data_atualizacao: 'desc' }
      });

      // Formatar resposta
      const contratosFormatados = contratos.map(contrato => ({
        id: contrato.id,
        data_conclusao: contrato.data_atualizacao,
        categoria: contrato.orcamento.post.categoria,
        titulo: contrato.orcamento.post.titulo,
        prestador: {
          id: contrato.prestador.id,
          nome: contrato.prestador.nome,
          foto_perfil: contrato.prestador.foto_perfil,
          reputacao: contrato.prestador.reputacao,
        },
        valor: contrato.valor,
        tem_avaliacao: contrato._count.avaliacoes > 0
      }));

      res.json({
        success: true,
        data: {
          contratos: contratosFormatados
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

