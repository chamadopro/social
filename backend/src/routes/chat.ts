import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authenticate, requireClienteOrPrestador } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { mensagemSchemas } from '../middleware/validation';
import { chatRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const chatController = new ChatController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Rate limiting para chat
router.use(chatRateLimiter);

// Rotas de chat
router.get('/conversas', 
  chatController.getConversas
);

router.get('/:outro_usuario_id/mensagens', 
  chatController.getMensagens
);

router.post('/enviar', 
  validate(mensagemSchemas.create),
  chatController.sendMessage
);

router.post('/:outro_usuario_id/marcar-lidas', 
  chatController.markAsRead
);

router.delete('/mensagem/:id', 
  chatController.deleteMessage
);

export default router;