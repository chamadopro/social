import { Router } from 'express';
import { ContratoController } from '../controllers/ContratoController';
import { authenticate, requireClienteOrPrestador } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { contratoSchemas } from '../middleware/validation';

const router = Router();
const contratoController = new ContratoController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireClienteOrPrestador);

// Rotas de contratos
router.get('/', 
  contratoController.getAllContratos
);

router.get('/andamentos', 
  contratoController.getAndamentos
);

router.get('/concluidos', 
  contratoController.getContratosConcluidos
);

router.get('/:id', 
  contratoController.getContratoById
);

router.put('/:id', 
  validate(contratoSchemas.update),
  contratoController.updateContrato
);

// Rotas de ação do contrato
router.post('/:id/iniciar', 
  contratoController.iniciarServico
);

router.post('/:id/concluir', 
  contratoController.concluirServico
);

router.post('/:id/cancelar', 
  contratoController.cancelarContrato
);

router.post('/:id/confirmar-entrega', 
  contratoController.confirmarEntrega
);

// Rotas de evidências
router.post('/:id/evidencia-inicial', 
  contratoController.uploadEvidenciaInicial
);

router.post('/:id/evidencia-progresso', 
  contratoController.uploadEvidenciaProgresso
);

router.post('/:id/evidencia-final', 
  contratoController.uploadEvidenciaFinal
);

export default router;

