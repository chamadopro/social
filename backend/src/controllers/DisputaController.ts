import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  badRequest,
  notFoundError,
  internalServerError,
  forbidden
} from '../middleware/errorHandler';
import { auditLog, logger } from '../utils/logger';
import { notificationService } from '../services/NotificationService';

export class DisputaController {
  // Criar disputa
  public async createDisputa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contrato_id, tipo, descricao, evidencias } = req.body;
      const usuario_id = req.user!.id;

      // Verificar se o contrato existe e se o usuário tem acesso
      const contrato = await config.prisma.contrato.findFirst({
        where: {
          id: contrato_id,
          OR: [
            { cliente_id: usuario_id },
            { prestador_id: usuario_id }
          ]
        },
        include: {
          pagamento: {
            select: {
              id: true,
              status: true,
              data_pagamento: true
            }
          }
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // ⚠️ VALIDAÇÃO CRÍTICA: Só pode abrir disputa se pagamento foi feito pela plataforma
      if (!contrato.pagamento) {
        throw badRequest('Não é possível abrir disputa. Este serviço não possui pagamento registrado na plataforma. A ChamadoPro não se responsabiliza por serviços fechados fora da plataforma.');
      }

      if (contrato.pagamento.status !== 'PAGO' && contrato.pagamento.status !== 'AGUARDANDO_LIBERACAO') {
        throw badRequest('Não é possível abrir disputa. O pagamento não foi realizado pela plataforma. A ChamadoPro só garante serviços com pagamento feito através da plataforma.');
      }

      // Verificar se o serviço foi iniciado (obrigatório para disputa)
      if (!contrato.data_inicio) {
        throw badRequest('Não é possível abrir disputa. O serviço precisa ter sido iniciado pela plataforma.');
      }

      // Verificar se contrato está em estado válido para disputa
      if (contrato.status === 'CANCELADO') {
        throw badRequest('Não é possível abrir disputa para um contrato cancelado.');
      }

      // Verificar se já existe disputa para este contrato
      const disputaExistente = await config.prisma.disputa.findFirst({
        where: { contrato_id }
      });

      if (disputaExistente) {
        if (disputaExistente.status === 'ABERTA' || disputaExistente.status === 'EM_ANALISE') {
          throw badRequest('Já existe uma disputa em andamento para este contrato.');
        }
        // Permitir criar nova disputa se a anterior foi cancelada ou resolvida (caso especial)
      }

      // Validar tipo de disputa
      const tiposValidos = ['SERVICO_INCOMPLETO', 'QUALIDADE_INFERIOR', 'MATERIAL_DIFERENTE', 'ATRASO_EXCESSIVO', 'COMPORTAMENTO_INADEQUADO'];
      const tipoDisputa = tipo && tiposValidos.includes(tipo) ? tipo : 'QUALIDADE_INFERIOR';

      // Validar descrição
      if (!descricao || descricao.trim().length < 10) {
        throw badRequest('A descrição da disputa deve ter no mínimo 10 caracteres.');
      }

      // Criar disputa
      const disputa = await config.prisma.disputa.create({
        data: {
          id: require('uuid').v4(),
          contrato_id,
          cliente_id: contrato.cliente_id,
          prestador_id: contrato.prestador_id,
          tipo: tipoDisputa as any,
          descricao: descricao.trim(),
          evidencias: Array.isArray(evidencias) ? evidencias : []
        }
      });

      // Atualizar status do contrato para DISPUTADO
      await config.prisma.contrato.update({
        where: { id: contrato_id },
        data: { status: 'DISPUTADO' }
      });

      // Atualizar status do pagamento para DISPUTADO (bloquear liberação)
      // Verificar se já não está em DISPUTADO para evitar atualização desnecessária
      const statusAtualPagamento = contrato.pagamento.status as string;
      if (statusAtualPagamento !== 'DISPUTADO') {
        await config.prisma.pagamento.update({
          where: { id: contrato.pagamento.id },
          data: { status: 'DISPUTADO' as any }
        });
      }

      // Enviar notificação para admins/moderadores sobre nova disputa
      try {
        const admins = await config.prisma.usuario.findMany({
          where: {
            tipo: { in: ['ADMIN', 'MODERADOR'] }
          },
          select: { id: true }
        });

        for (const admin of admins) {
          await notificationService.createNotification(
            admin.id,
            'DISPUTA_ABERTA',
            'Nova Disputa Aberta',
            `Uma nova disputa foi aberta para o contrato ${contrato_id}. Acesse o painel administrativo para análise.`
          );
        }
      } catch (error) {
        logger.warn('Erro ao enviar notificações de disputa para admins:', error);
      }

      // Log de auditoria
      auditLog('DISPUTA_CREATED', {
        disputa_id: disputa.id,
        contrato_id,
        usuario_id
      });

      res.status(201).json({
        success: true,
        message: 'Disputa criada com sucesso',
        data: disputa
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter disputas do usuário
  public async getDisputas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const usuario_id = req.user!.id;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        OR: [
          { cliente_id: usuario_id },
          { prestador_id: usuario_id }
        ]
      };

      if (status) {
        where.status = status;
      }

      const [disputas, total] = await Promise.all([
        config.prisma.disputa.findMany({
          where,
          skip,
          take,
          include: {
            contrato: {
              include: {
                cliente: { select: { id: true, nome: true } },
                prestador: { select: { id: true, nome: true } }
              }
            },
            cliente: { select: { id: true, nome: true } },
            prestador: { select: { id: true, nome: true } },
            moderador: { select: { id: true, nome: true } }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.disputa.count({ where })
      ]);

      res.json({
        success: true,
        data: disputas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar disputas'));
    }
  }

  // Resolver disputa (apenas moderadores/admins)
  public async resolveDisputa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { decisao, favor_cliente } = req.body;
      const moderador_id = req.user!.id;

      const disputa = await config.prisma.disputa.findUnique({
        where: { id },
        include: { contrato: true }
      });

      if (!disputa) {
        throw notFoundError('Disputa não encontrada');
      }

      if (disputa.status !== 'ABERTA') {
        throw badRequest('Disputa já foi resolvida');
      }

      // Resolver disputa
      const disputaResolvida = await config.prisma.disputa.update({
        where: { id },
        data: {
          status: 'RESOLVIDA',
          decisao,
          moderador_id,
          data_resolucao: new Date()
        }
      });

      // Log de auditoria
      auditLog('DISPUTA_RESOLVED', {
        disputa_id: id,
        moderador_id,
        favor_cliente
      });

      res.json({
        success: true,
        message: 'Disputa resolvida com sucesso',
        data: disputaResolvida
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter disputa por ID
  public async getDisputaById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.user!.id;
      const user_type = req.user!.tipo;

      const disputa = await config.prisma.disputa.findUnique({
        where: { id: id! },
        include: {
          cliente: { select: { id: true, nome: true, email: true } },
          prestador: { select: { id: true, nome: true, email: true } },
          moderador: { select: { id: true, nome: true, email: true } },
          contrato: {
            include: {
              cliente: { select: { id: true, nome: true, email: true } },
              prestador: { select: { id: true, nome: true, email: true } },
            }
          }
        }
      });

      if (!disputa) {
        throw notFoundError('Disputa não encontrada');
      }

      // Verificar permissões
      const isAllowed = user_type === 'ADMIN' || user_type === 'MODERADOR' ||
                        disputa.cliente_id === usuario_id ||
                        disputa.prestador_id === usuario_id;

      if (!isAllowed) {
        throw forbidden('Você não tem permissão para visualizar esta disputa');
      }

      res.json({
        success: true,
        data: disputa
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar disputa (apenas moderadores/admins)
  public async updateDisputa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, decisao, evidencias } = req.body;
      const moderador_id = req.user!.id;

      const disputa = await config.prisma.disputa.findUnique({ where: { id: id! } });

      if (!disputa) {
        throw notFoundError('Disputa não encontrada');
      }

      const updatedDisputa = await config.prisma.disputa.update({
        where: { id: id! },
        data: {
          status,
          decisao,
          evidencias: evidencias || disputa.evidencias,
          moderador_id,
          data_resolucao: status === 'RESOLVIDA' ? new Date() : null
        }
      });

      auditLog('DISPUTA_UPDATED', {
        disputa_id: id,
        moderador_id,
        old_status: disputa.status,
        new_status: status
      });

      res.json({
        success: true,
        message: 'Disputa atualizada com sucesso',
        data: updatedDisputa
      });

    } catch (error) {
      next(error);
    }
  }
}
