import { Router } from 'express';
import { BuscaController } from '../controllers/BuscaController';
import { optionalAuth } from '../middleware/auth';

const router = Router();
const buscaController = new BuscaController();

// Rotas de busca (autenticação opcional)
router.get('/posts', 
  optionalAuth,
  buscaController.searchPosts
);

router.get('/users', 
  optionalAuth,
  buscaController.searchUsers
);

router.get('/global', 
  optionalAuth,
  buscaController.globalSearch
);

router.get('/sugestoes', 
  buscaController.getSugestoes
);

router.get('/categorias', 
  buscaController.getCategorias
);

export default router;

