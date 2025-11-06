import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { badRequest, notFoundError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class MoedaController {
  // Endpoint interno para creditar moedas (chamado por outros controllers)
  public static async creditarMoeda(
    usuarioId: string,
    descricao: string,
    origem: string = 'RECOMENDACAO_PRESTADOR',
    referenciaId?: string
  ): Promise<void> {
    try {
      // Verificar se usuário existe
      const usuario = await config.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { id: true, saldo_moedas: true }
      });

      if (!usuario) {
        throw new Error(`Usuário ${usuarioId} não encontrado`);
      }

      // Criar transação de crédito
      await config.prisma.$transaction(async (prisma) => {
        // Criar registro de transação
        await prisma.transacaoMoeda.create({
          data: {
            id: require('uuid').v4(),
            usuario_id: usuarioId,
            tipo: 'CREDITO',
            valor: 1, // Sempre 1 moeda por recomendação
            descricao,
            origem,
            referencia_id: referenciaId || null
          }
        });

        // Atualizar saldo do usuário
        await prisma.usuario.update({
          where: { id: usuarioId },
          data: {
            saldo_moedas: {
              increment: 1
            }
          }
        });
      });

      logger.info(`Moeda creditada para usuário ${usuarioId}: ${descricao}`);

    } catch (error) {
      logger.error(`Erro ao creditar moeda para usuário ${usuarioId}:`, error);
      throw error;
    }
  }

  // Endpoint público para obter histórico de transações
  public async getTransacoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user!.id;
      const { page = 1, limit = 20, tipo } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = { usuario_id: usuarioId };
      if (tipo) where.tipo = tipo;

      const [transacoes, total] = await Promise.all([
        config.prisma.transacaoMoeda.findMany({
          where,
          skip,
          take,
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.transacaoMoeda.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          transacoes,
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

  // Endpoint público para obter saldo de moedas
  public async getSaldo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user!.id;

      const usuario = await config.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { saldo_moedas: true }
      });

      if (!usuario) {
        throw notFoundError('Usuário não encontrado');
      }

      res.json({
        success: true,
        data: {
          saldo_moedas: usuario.saldo_moedas
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

