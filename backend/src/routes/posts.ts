import { Router } from 'express';
import { PostController } from '../controllers/PostController';
import { authenticate, requireClienteOrPrestador, optionalAuth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { postSchemas } from '../middleware/validation';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const postController = new PostController();

// Rotas públicas (com autenticação opcional)
router.get('/', 
  optionalAuth,
  postController.getAllPosts
);

router.get('/:id', 
  optionalAuth,
  postController.getPostById
);

router.get('/:id/curtidas', 
  optionalAuth,
  postController.getCurtidas
);

router.get('/:id/orcamentos', 
  authenticate,
  postController.getPostOrcamentos
);

// Rotas que requerem autenticação
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Rotas de CRUD de posts
router.post('/', 
  uploadRateLimiter,
  validate(postSchemas.create),
  postController.createPost
);

router.put('/:id', 
  uploadRateLimiter,
  validate(postSchemas.update),
  postController.updatePost
);

router.delete('/:id', 
  postController.deletePost
);

// Rotas de interação
router.post('/:id/curtir', 
  postController.toggleCurtida
);

router.post('/:id/comentar', 
  postController.comentarPost
);

router.delete('/:id/comentarios/:comentarioId', 
  postController.deletarComentario
);

// Rotas de status
router.put('/:id/finalizar', 
  postController.finalizarPost
);

router.put('/:id/cancelar', 
  postController.cancelarPost
);

router.put('/:id/reativar', 
  postController.reativarPost
);

// Rotas de finalização de trabalho
router.post('/:id/marcar-concluido', 
  postController.marcarTrabalhoConcluido
);

router.post('/:id/confirmar-conclusao', 
  postController.confirmarConclusaoTrabalho
);

export default router;

