import { Router } from 'express';
import { MensagemAutomaticaController } from '../controllers/MensagemAutomaticaController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const controller = new MensagemAutomaticaController();

// Rotas públicas
router.get('/', controller.getAllMensagens.bind(controller));
router.get('/tipo/:tipo', controller.getMensagemByTipo.bind(controller));
router.get('/ativa/:tipo', controller.getMensagemAtiva.bind(controller));

// Rotas protegidas (admin/moderador)
router.post('/', authenticate, requireAdmin, controller.createMensagem.bind(controller));
router.put('/:tipo', authenticate, requireAdmin, controller.updateMensagem.bind(controller));
router.delete('/:tipo', authenticate, requireAdmin, controller.deleteMensagem.bind(controller));

export default router;
