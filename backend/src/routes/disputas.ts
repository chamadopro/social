import { Router } from 'express';
import { DisputaController } from '../controllers/DisputaController';
import { authenticate, requireModeradorOrAdmin, requireClienteOrPrestador } from '../middleware/auth';

const router = Router();
const disputaController = new DisputaController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas de disputas
router.get('/', 
  requireClienteOrPrestador, // Permite cliente/prestador ver suas próprias disputas
  disputaController.getDisputas
);

router.get('/:id', 
  disputaController.getDisputaById
);

router.post('/', 
  requireClienteOrPrestador,
  disputaController.createDisputa
);

router.put('/:id', 
  requireModeradorOrAdmin,
  disputaController.updateDisputa
);

router.post('/:id/resolver', 
  requireModeradorOrAdmin,
  disputaController.resolveDisputa
);

export default router;

