import { Router } from 'express';
import { OrcamentoController } from '../controllers/OrcamentoController';
import { authenticate, requirePrestador } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { orcamentoSchemas } from '../middleware/validation';

const router = Router();
const orcamentoController = new OrcamentoController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas de orçamentos
router.get('/', 
  orcamentoController.getOrcamentos.bind(orcamentoController)
);

router.get('/:id', 
  orcamentoController.getOrcamentoById.bind(orcamentoController)
);

router.post('/', 
  requirePrestador,
  validate(orcamentoSchemas.create),
  orcamentoController.createOrcamento.bind(orcamentoController)
);

router.put('/:id', 
  validate(orcamentoSchemas.update),
  orcamentoController.updateOrcamento.bind(orcamentoController)
);

router.delete('/:id', 
  orcamentoController.deleteOrcamento.bind(orcamentoController)
);

// Rotas de ação
router.post('/:id/responder', 
  validate(orcamentoSchemas.responder),
  orcamentoController.responderOrcamento.bind(orcamentoController)
);

router.post('/:id/aceitar', 
  orcamentoController.aceitarOrcamento.bind(orcamentoController)
);

// Rotas de negociação
router.post('/:id/iniciar-negociacao', 
  orcamentoController.iniciarNegociacao.bind(orcamentoController)
);

router.post('/negociacao', 
  validate(orcamentoSchemas.negociacao),
  orcamentoController.createNegociacao.bind(orcamentoController)
);

router.post('/:id/finalizar-negociacao', 
  validate(orcamentoSchemas.finalizarNegociacao),
  orcamentoController.finalizarNegociacao.bind(orcamentoController)
);

// Rota administrativa
router.post('/verificar-expirados', 
  orcamentoController.verificarOrcamentosExpirados.bind(orcamentoController)
);

export default router;

