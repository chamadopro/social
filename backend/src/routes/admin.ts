import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const adminController = new AdminController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);
router.use(requireAdmin);

// Rotas administrativas
router.get('/dashboard', 
  adminController.getDashboard
);

router.get('/usuarios', 
  adminController.manageUsers
);

router.put('/usuarios/:id/toggle', 
  adminController.toggleUserStatus
);

router.get('/relatorios', 
  adminController.getRelatorios
);

// Rotas de posts
router.get('/posts', 
  adminController.listPosts
);

router.put('/posts/:id/toggle', 
  adminController.togglePostStatus
);

// Rotas de pagamentos
router.get('/pagamentos', 
  adminController.listPagamentos
);

router.put('/pagamentos/:id/liberar', 
  adminController.liberarPagamento
);

// Rotas de disputas
router.get('/disputas', 
  adminController.listDisputas
);

router.put('/disputas/:id/resolver', 
  adminController.resolverDisputa
);

// Relatórios avançados
router.get('/relatorios/avancados', 
  adminController.getRelatoriosAvancados
);

// Histórico de auditoria
router.get('/auditoria', 
  adminController.getHistoricoAuditoria
);

// Exportação de dados
router.post('/exportar', 
  adminController.exportarDados
);

export default router;

