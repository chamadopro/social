import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/NotificationService';
import { auditLog } from '../utils/logger';

export class NotificationController {
  // Listar notificações do usuário autenticado
  public async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);
      const offset = (page - 1) * limit;

      const notifications = await notificationService.getUserNotifications(userId, limit, offset);
      const unreadCount = await notificationService.getUnreadCount(userId);

      res.json({ success: true, data: { notifications, unreadCount, page, limit } });
    } catch (error) {
      next(error);
    }
  }

  public async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const unreadCount = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { unreadCount } });
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);

      auditLog('NOTIFICATION_READ', { userId: req.user!.id, notificationId: id, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true, message: 'Notificação marcada como lida' });
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      await notificationService.markAllAsRead(userId);

      auditLog('NOTIFICATION_MARK_ALL_READ', { userId, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
      next(error);
    }
  }

  public async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      
      await notificationService.deleteNotification(id);

      auditLog('NOTIFICATION_DELETE', { userId, notificationId: id, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true, message: 'Notificação removida' });
    } catch (error) {
      next(error);
    }
  }

  // Admin: criar uma notificação para um usuário
  public async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, type, title, message, data } = req.body;
      const notification = await notificationService.createNotification(userId, type, title, message, data);

      auditLog('NOTIFICATION_CREATE', { adminId: req.user!.id, targetUserId: userId, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  // Admin: enviar em massa
  public async broadcastNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, type, title, message, data } = req.body;
      const result = await notificationService.broadcastNotification(userIds, type, title, message, data);

      auditLog('NOTIFICATION_BROADCAST', { adminId: req.user!.id, targetUserCount: userIds?.length || 0, ip: req.ip, userAgent: req.get('User-Agent') });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  // Admin: limpeza de antigas
  public async cleanupOldNotifications(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationService.cleanupOldNotifications();
      res.json({ success: true, message: 'Notificações antigas removidas' });
    } catch (error) {
      next(error);
    }
  }

  // Admin: estatísticas simples
  public async getNotificationStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const connectedUsers = notificationService.getConnectedUsers();
      res.json({ success: true, data: { connectedUsers: connectedUsers.length, connectedUserIds: connectedUsers } });
    } catch (error) {
      next(error);
    }
  }
}
