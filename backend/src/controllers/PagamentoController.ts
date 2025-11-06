import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  badRequest,
  notFoundError,
  internalServerError
} from '../middleware/errorHandler';
import { auditLog } from '../utils/logger';

export class PagamentoController {
  // Obter todos os pagamentos do usuário
  public async getAllPagamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const usuarioId = req.user!.id;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        contrato: {
          OR: [
            { cliente_id: usuarioId },
            { prestador_id: usuarioId }
          ]
        }
      };

      if (status) {
        where.status = status;
      }

      const [pagamentos, total] = await Promise.all([
        config.prisma.pagamento.findMany({
          where,
          skip,
          take,
          include: {
            contrato: {
              include: {
                cliente: {
                  select: { id: true, nome: true, email: true }
                },
                prestador: {
                  select: { id: true, nome: true, email: true }
                }
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.pagamento.count({ where })
      ]);

      res.json({
        success: true,
        data: pagamentos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar pagamentos'));
    }
  }

  // Obter pagamento por ID
  public async getPagamentoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      const pagamento = await config.prisma.pagamento.findFirst({
        where: {
          id,
          contrato: {
            OR: [
              { cliente_id: usuarioId },
              { prestador_id: usuarioId }
            ]
          }
        },
        include: {
          contrato: {
            include: {
              cliente: {
                select: { id: true, nome: true, email: true }
              },
              prestador: {
                select: { id: true, nome: true, email: true }
              }
            }
          }
        }
      });

      if (!pagamento) {
        throw notFoundError('Pagamento não encontrado');
      }

      res.json({
        success: true,
        data: pagamento
      });

    } catch (error) {
      next(error);
    }
  }

  // Criar pagamento
  public async createPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contrato_id, valor, metodo_pagamento } = req.body;
      const usuarioId = req.user!.id;

      // Verificar se o contrato existe e se o usuário tem acesso
      const contrato = await config.prisma.contrato.findFirst({
        where: {
          id: contrato_id,
          OR: [
            { cliente_id: usuarioId },
            { prestador_id: usuarioId }
          ]
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // Criar pagamento
      const pagamento = await config.prisma.pagamento.create({
        data: {
          id: require('uuid').v4(),
          contrato_id,
          valor: Number(valor),
          metodo: metodo_pagamento,
          status: 'PENDENTE',
          taxa_plataforma: Number(valor) * 0.05 // 5% de taxa
        }
      });

      // Log de auditoria
      auditLog('PAGAMENTO_CREATED', {
        pagamento_id: pagamento.id,
        contrato_id,
        valor,
        usuario_id: usuarioId
      });

      res.status(201).json({
        success: true,
        message: 'Pagamento criado com sucesso',
        data: pagamento
      });

    } catch (error) {
      next(error);
    }
  }

  // Processar pagamento
  public async processarPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      const pagamento = await config.prisma.pagamento.findFirst({
        where: {
          id,
          contrato: {
            OR: [
              { cliente_id: usuarioId },
              { prestador_id: usuarioId }
            ]
          }
        }
      });

      if (!pagamento) {
        throw notFoundError('Pagamento não encontrado');
      }

      if (pagamento.status !== 'PENDENTE') {
        throw badRequest('Pagamento já foi processado');
      }

      // Simular processamento de pagamento
      const updatedPagamento = await config.prisma.pagamento.update({
        where: { id },
        data: {
          status: 'PAGO',
          data_pagamento: new Date()
        }
      });

      // Log de auditoria
      auditLog('PAGAMENTO_PROCESSED', {
        pagamento_id: id,
        usuario_id: usuarioId
      });

      res.json({
        success: true,
        message: 'Pagamento processado com sucesso',
        data: updatedPagamento
      });

    } catch (error) {
      next(error);
    }
  }

  // Estornar pagamento
  public async estornarPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { motivo } = req.body;
      const usuarioId = req.user!.id;

      const pagamento = await config.prisma.pagamento.findFirst({
        where: {
          id,
          contrato: {
            OR: [
              { cliente_id: usuarioId },
              { prestador_id: usuarioId }
            ]
          }
        }
      });

      if (!pagamento) {
        throw notFoundError('Pagamento não encontrado');
      }

      if (pagamento.status === 'REEMBOLSADO') {
        throw badRequest('Pagamento já foi estornado');
      }

      const updatedPagamento = await config.prisma.pagamento.update({
        where: { id },
        data: {
          status: 'REEMBOLSADO',
          data_pagamento: new Date()
        }
      });

      // Log de auditoria
      auditLog('PAGAMENTO_REFUNDED', {
        pagamento_id: id,
        motivo,
        usuario_id: usuarioId
      });

      res.json({
        success: true,
        message: 'Pagamento estornado com sucesso',
        data: updatedPagamento
      });

    } catch (error) {
      next(error);
    }
  }

  // Webhook para processar notificações de pagamento
  public async handleWebhook(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implementar lógica de webhook
      res.json({
        success: true,
        message: 'Webhook processado'
      });
    } catch (error) {
      next(error);
    }
  }

  // Relatório de receitas
  public async getRelatorioReceitas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data_inicio, data_fim } = req.query;
      const usuarioId = req.user!.id;

      const where: any = {
        contrato: { prestador_id: usuarioId },
        status: 'PAGO'
      };

      if (data_inicio && data_fim) {
        where.data_pagamento = {
          gte: new Date(data_inicio as string),
          lte: new Date(data_fim as string)
        };
      }

      const receitas = await config.prisma.pagamento.aggregate({
        where,
        _sum: { valor: true },
        _count: { id: true }
      });

      res.json({
        success: true,
        data: {
          total_receitas: receitas._sum.valor || 0,
          total_pagamentos: receitas._count.id || 0
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao gerar relatório de receitas'));
    }
  }

  // Relatório de despesas
  public async getRelatorioDespesas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { data_inicio, data_fim } = req.query;
      const usuarioId = req.user!.id;

      const where: any = {
        contrato: { cliente_id: usuarioId },
        status: 'PAGO'
      };

      if (data_inicio && data_fim) {
        where.data_pagamento = {
          gte: new Date(data_inicio as string),
          lte: new Date(data_fim as string)
        };
      }

      const despesas = await config.prisma.pagamento.aggregate({
        where,
        _sum: { valor: true },
        _count: { id: true }
      });

      res.json({
        success: true,
        data: {
          total_despesas: despesas._sum.valor || 0,
          total_pagamentos: despesas._count.id || 0
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao gerar relatório de despesas'));
    }
  }
}