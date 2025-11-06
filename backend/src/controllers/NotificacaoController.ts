import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  notFoundError,
  internalServerError
} from '../middleware/errorHandler';

export class NotificacaoController {
  // Obter notificações do usuário
  public async getNotificacoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, lida } = req.query;
      const usuario_id = req.user!.id;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = { usuario_id };
      if (lida !== undefined) {
        where.lida = lida === 'true';
      }

      const [notificacoes, total] = await Promise.all([
        config.prisma.notificacao.findMany({
          where,
          skip,
          take,
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.notificacao.count({ where })
      ]);

      res.json({
        success: true,
        data: notificacoes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar notificações'));
    }
  }

  // Marcar notificação como lida
  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.user!.id;

      const notificacao = await config.prisma.notificacao.findFirst({
        where: {
          id,
          usuario_id
        }
      });

      if (!notificacao) {
        throw notFoundError('Notificação não encontrada');
      }

      await config.prisma.notificacao.update({
        where: { id },
        data: { lida: true }
      });

      res.json({
        success: true,
        message: 'Notificação marcada como lida'
      });

    } catch (error) {
      next(error);
    }
  }

  // Marcar todas as notificações como lidas
  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      await config.prisma.notificacao.updateMany({
        where: {
          usuario_id,
          lida: false
        },
        data: { 
          lida: true
        }
      });

      res.json({
        success: true,
        message: 'Todas as notificações foram marcadas como lidas'
      });

    } catch (error) {
      next(internalServerError('Erro ao marcar notificações como lidas'));
    }
  }

  // Deletar notificação
  public async deleteNotificacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.user!.id;

      const notificacao = await config.prisma.notificacao.findFirst({
        where: {
          id,
          usuario_id
        }
      });

      if (!notificacao) {
        throw notFoundError('Notificação não encontrada');
      }

      await config.prisma.notificacao.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Notificação deletada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Contar notificações não lidas
  public async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      const count = await config.prisma.notificacao.count({
        where: {
          usuario_id,
          lida: false
        }
      });

      res.json({
        success: true,
        data: { count }
      });

    } catch (error) {
      next(internalServerError('Erro ao contar notificações não lidas'));
    }
  }
}
