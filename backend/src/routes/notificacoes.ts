import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const notificationController = new NotificationController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas do usuário
router.get('/', notificationController.getUserNotifications.bind(notificationController));
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));
router.put('/mark-all-read', notificationController.markAllAsRead.bind(notificationController));
router.delete('/:id', notificationController.deleteNotification.bind(notificationController));

// Rotas de administração
router.post('/create', 
  requireAdmin,
  notificationController.createNotification.bind(notificationController)
);
router.post('/broadcast', 
  requireAdmin,
  notificationController.broadcastNotification.bind(notificationController)
);
router.post('/cleanup', 
  requireAdmin,
  notificationController.cleanupOldNotifications.bind(notificationController)
);
router.get('/stats', 
  requireAdmin,
  notificationController.getNotificationStats.bind(notificationController)
);

export default router;