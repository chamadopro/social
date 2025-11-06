import { Server as SocketIOServer } from 'socket.io';
import { config } from '../config/database';
import { logger } from '../utils/logger';

export interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export enum NotificationType {
  // Posts
  POST_CREATED = 'POST_CREATED',
  POST_UPDATED = 'POST_UPDATED',
  POST_DELETED = 'POST_DELETED',
  POST_LIKED = 'POST_LIKED',
  POST_COMMENTED = 'POST_COMMENTED',
  
  // Orçamentos
  ORCAMENTO_RECEIVED = 'ORCAMENTO_RECEIVED',
  ORCAMENTO_ACCEPTED = 'ORCAMENTO_ACCEPTED',
  ORCAMENTO_REJECTED = 'ORCAMENTO_REJECTED',
  ORCAMENTO_UPDATED = 'ORCAMENTO_UPDATED',
  
  // Contratos
  CONTRATO_CREATED = 'CONTRATO_CREATED',
  CONTRATO_ACCEPTED = 'CONTRATO_ACCEPTED',
  CONTRATO_REJECTED = 'CONTRATO_REJECTED',
  CONTRATO_COMPLETED = 'CONTRATO_COMPLETED',
  CONTRATO_CANCELLED = 'CONTRATO_CANCELLED',
  
  // Pagamentos
  PAGAMENTO_RECEIVED = 'PAGAMENTO_RECEIVED',
  PAGAMENTO_PROCESSED = 'PAGAMENTO_PROCESSED',
  PAGAMENTO_FAILED = 'PAGAMENTO_FAILED',
  
  // Avaliações
  AVALIACAO_RECEIVED = 'AVALIACAO_RECEIVED',
  AVALIACAO_UPDATED = 'AVALIACAO_UPDATED',
  
  // Disputas
  DISPUTA_CREATED = 'DISPUTA_CREATED',
  DISPUTA_RESOLVED = 'DISPUTA_RESOLVED',
  DISPUTA_UPDATED = 'DISPUTA_UPDATED',
  
  // Sistema
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  
  // Mensagens
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  MESSAGE_READ = 'MESSAGE_READ',
  
  // Admin
  ADMIN_ACTION = 'ADMIN_ACTION',
  USER_BANNED = 'USER_BANNED',
  USER_UNBANNED = 'USER_UNBANNED',
  
  // Leads
  LEAD_QUENTE = 'LEAD_QUENTE'
}

export class NotificationService {
  private io: SocketIOServer | null;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

  constructor(io: SocketIOServer | null) {
    this.io = io;
    if (io) {
      this.setupSocketHandlers();
    }
  }

  public attachIO(io: SocketIOServer): void {
    this.io = io;
    this.setupSocketHandlers();
    logger.info('NotificationService: Socket.IO anexado e handlers configurados');
  }

  // Enviar notificação para administradores
  public async notifyAdmins(type: NotificationType, title: string, message: string, data?: any): Promise<void> {
    if (!this.io) {
      logger.warn('NotificationService: Socket.IO não disponível para notificar admins');
      return;
    }

    const notification = {
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Enviar para todos os admins conectados
    this.io.to('admins').emit('admin_notification', notification);
    logger.info('Notificação administrativa enviada:', { type, title });
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    // Log apenas em produção ou quando explicitamente habilitado para debug
    const isProduction = process.env['NODE_ENV'] === 'production';
    const shouldLog = isProduction || process.env['DEBUG_SOCKET'] === 'true';

    this.io.on('connection', (socket) => {
      // Extrair userId do query ou auth
      const userId = socket.handshake.query.userId as string || 
                     (socket.handshake.auth as any)?.userId ||
                     (socket.handshake.auth as any)?.token ? 
                       (socket.handshake.auth as any).token : null;
      
      // Registrar evento para registrar usuário após autenticação
      socket.on('register_user', (data: { userId: string }) => {
        if (data.userId) {
          this.connectedUsers.set(data.userId, socket.id);
          if (shouldLog) {
            logger.info(`Usuário ${data.userId} registrado nas notificações (socket: ${socket.id})`);
          }
        }
      });

      // Se userId já veio no handshake, registrar imediatamente
      if (userId) {
        this.connectedUsers.set(userId, socket.id);
        if (shouldLog) {
          logger.info(`Usuário ${userId} conectado às notificações (socket: ${socket.id})`);
        }
      }

      socket.on('disconnect', () => {
        // Remover todos os usuários associados a este socket
        for (const [uid, sid] of this.connectedUsers.entries()) {
          if (sid === socket.id) {
            this.connectedUsers.delete(uid);
            if (shouldLog) {
              logger.info(`Usuário ${uid} desconectado das notificações`);
            }
          }
        }
      });
    });
  }

  async getUserNotifications(userId: string, limit: number, offset: number): Promise<any[]> {
    try {
      const notifications = await config.prisma.notificacao.findMany({
        where: { usuario_id: userId },
        orderBy: { data_criacao: 'desc' },
        take: limit,
        skip: offset
      });

      return notifications;
    } catch (error) {
      logger.error('Erro ao buscar notificações:', error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await config.prisma.notificacao.count({
        where: {
          usuario_id: userId,
          lida: false
        }
      });

      return count;
    } catch (error) {
      logger.error('Erro ao buscar contagem de não lidas:', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      await config.prisma.notificacao.update({
        where: { id },
        data: { lida: true }
      });
    } catch (error) {
      logger.error('Erro ao marcar notificação como lida:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      await config.prisma.notificacao.updateMany({
        where: {
          usuario_id: userId,
          lida: false
        },
        data: { lida: true }
      });
    } catch (error) {
      logger.error('Erro ao marcar todas como lidas:', error);
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<void> {
    try {
      await config.prisma.notificacao.delete({
        where: { id }
      });
    } catch (error) {
      logger.error('Erro ao deletar notificação:', error);
      throw error;
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  async createNotification(
    userId: string,
    tipo: string,
    titulo: string,
    mensagem: string,
    data?: any
  ): Promise<any> {
    try {
      const notification = await config.prisma.notificacao.create({
        data: {
          usuario_id: userId,
          tipo: tipo as any,
          titulo,
          mensagem,
          lida: false,
          ...(data && { dados: data })
        }
      });

      // Enviar notificação em tempo real via WebSocket
      this.sendNotificationToUser(userId, notification);

      logger.info(`Notificação criada: ${notification.id} para usuário ${userId}`);
      return notification;
    } catch (error) {
      logger.error('Erro ao criar notificação:', error);
      throw error;
    }
  }

  async broadcastNotification(
    userIds: string[],
    tipo: string,
    titulo: string,
    mensagem: string,
    data?: any
  ): Promise<any> {
    try {
      const notifications = await config.prisma.notificacao.createMany({
        data: userIds.map(userId => ({
          usuario_id: userId,
          tipo: tipo as any,
          titulo,
          mensagem,
          lida: false,
          ...(data && { dados: data })
        }))
      });

      // Enviar notificações em tempo real via WebSocket
      userIds.forEach(userId => {
        this.sendNotificationToUser(userId, {
          tipo,
          titulo,
          mensagem,
          data
        });
      });

      logger.info(`Notificações em massa criadas: ${notifications.count} para ${userIds.length} usuários`);
      return notifications;
    } catch (error) {
      logger.error('Erro ao criar notificações em massa:', error);
      throw error;
    }
  }

  private sendNotificationToUser(userId: string, notification: any): void {
    if (!this.io) return;

    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      // Emitir notificação no formato esperado pelo frontend
      this.io.to(socketId).emit('notification', {
        id: notification.id,
        usuario_id: notification.usuario_id || userId,
        tipo: notification.tipo || notification.type,
        titulo: notification.titulo || notification.title,
        mensagem: notification.mensagem || notification.message,
        lida: notification.lida || false,
        data_criacao: notification.data_criacao || notification.createdAt || new Date().toISOString(),
        dados: notification.dados || notification.data,
      });
      logger.info(`Notificação enviada em tempo real para usuário ${userId}`);
    } else {
      logger.debug(`Usuário ${userId} não está conectado ao Socket.IO`);
    }
  }

  async cleanupOldNotifications(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await config.prisma.notificacao.deleteMany({
        where: {
          data_criacao: {
            lt: thirtyDaysAgo
          },
          lida: true
        }
      });

      logger.info(`${result.count} notificações antigas foram removidas`);
    } catch (error) {
      logger.error('Erro ao limpar notificações antigas:', error);
      throw error;
    }
  }
}

// Exportar instância para uso temporário (sem WebSocket ainda)
export const notificationService: NotificationService = new NotificationService(null);
