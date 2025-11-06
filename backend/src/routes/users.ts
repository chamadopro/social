import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, requireAdmin, requireModeradorOrAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { userSchemas } from '../middleware/validation';

const router = Router();
const userController = new UserController();

// Rotas públicas para validação (SEM autenticação)
router.get('/check-email', userController.checkEmail);
router.get('/check-document', userController.checkDocument);

// Middleware de autenticação para rotas abaixo
router.use(authenticate);

// Rotas de usuários
router.get('/', 
  requireModeradorOrAdmin,
  userController.getAllUsers
);

router.get('/:id', 
  userController.getUserById
);

router.put('/:id', 
  validate(userSchemas.update),
  userController.updateUser
);

router.delete('/:id', 
  requireAdmin,
  userController.deleteUser
);

router.put('/:id/activate', 
  requireModeradorOrAdmin,
  userController.activateUser
);

router.put('/:id/deactivate', 
  requireModeradorOrAdmin,
  userController.deactivateUser
);

router.put('/:id/verify', 
  requireModeradorOrAdmin,
  userController.verifyUser
);

router.get('/:id/posts', 
  userController.getUserPosts
);

router.get('/:id/orcamentos', 
  userController.getUserOrcamentos
);

router.get('/:id/contratos', 
  userController.getUserContratos
);

router.get('/:id/avaliacoes', 
  userController.getUserAvaliacoes
);

router.get('/:id/reputacao', 
  userController.getUserReputacao
);

router.put('/:id/penalidade', 
  requireModeradorOrAdmin,
  validate(userSchemas.addPenalty),
  userController.addPenalty
);

router.put('/:id/remove-penalidade', 
  requireModeradorOrAdmin,
  userController.removePenalty
);

export default router;

