import { Router } from 'express';
import { AvaliacaoController } from '../controllers/AvaliacaoController';
import { authenticate, requireClienteOrPrestador } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { avaliacaoSchemas } from '../middleware/validation';

const router = Router();
const avaliacaoController = new AvaliacaoController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Rotas de avaliações
router.get('/usuario/:userId', avaliacaoController.getAvaliacoesByUser.bind(avaliacaoController));
router.get('/:id', avaliacaoController.getAvaliacaoById.bind(avaliacaoController));
router.post('/', 
  validate(avaliacaoSchemas.create),
  avaliacaoController.createAvaliacao.bind(avaliacaoController)
);
router.put('/:id', 
  validate(avaliacaoSchemas.update),
  avaliacaoController.updateAvaliacao.bind(avaliacaoController)
);
router.delete('/:id', avaliacaoController.deleteAvaliacao.bind(avaliacaoController));

// Rotas de estatísticas e ranking
router.get('/reputacao/:userId', avaliacaoController.getReputacaoStats.bind(avaliacaoController));
router.get('/ranking/reputacao', avaliacaoController.getRankingReputacao.bind(avaliacaoController));

export default router;