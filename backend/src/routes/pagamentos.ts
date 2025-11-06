import { Router } from 'express';
import { PagamentoController } from '../controllers/PagamentoController';
import { authenticate, requireClienteOrPrestador } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { pagamentoSchemas } from '../middleware/validation';
import { paymentRateLimiter } from '../middleware/rateLimiter';

const router = Router();
const pagamentoController = new PagamentoController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Rate limiting para pagamentos
router.use(paymentRateLimiter);

// Rotas de pagamentos
router.get('/', 
  pagamentoController.getAllPagamentos
);

router.get('/:id', 
  pagamentoController.getPagamentoById
);

router.post('/', 
  validate(pagamentoSchemas.create),
  pagamentoController.createPagamento
);

router.post('/:id/processar', 
  pagamentoController.processarPagamento
);

router.post('/:id/estornar', 
  pagamentoController.estornarPagamento
);

router.get('/relatorio/receitas', 
  pagamentoController.getRelatorioReceitas
);

router.get('/relatorio/despesas', 
  pagamentoController.getRelatorioDespesas
);

router.post('/webhook', 
  pagamentoController.handleWebhook
);

export default router;