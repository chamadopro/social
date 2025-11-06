import { Router } from 'express';
import { SolicitacaoController } from '../controllers/SolicitacaoController';
import { authenticate, requireClienteOrPrestador } from '../middleware/auth';

const router = Router();
const solicitacaoController = new SolicitacaoController();

// Middleware de autenticação
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Criar solicitação de serviço (lead quente)
router.post('/', 
  solicitacaoController.createSolicitacao.bind(solicitacaoController)
);

export default router;

