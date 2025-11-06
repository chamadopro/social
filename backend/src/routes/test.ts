import { Router } from 'express';
import { TestController } from '../controllers/TestController';

const router = Router();
const testController = new TestController();

// Rotas de teste (apenas para desenvolvimento)
router.post('/validate-document', testController.testDocumentValidation);
router.get('/generate-cpf', testController.generateValidCPF);
router.get('/generate-cnpj', testController.generateValidCNPJ);

// Rotas de teste para tentativas de login
router.get('/login-attempts', testController.checkLoginAttempts);
router.post('/clear-login-attempts', testController.clearLoginAttempts);
router.post('/run-cleanup', testController.runCleanup);

// Rotas de teste para validação de telefone
router.post('/validate-phone', testController.testPhoneValidation);
router.get('/generate-phone', testController.generatePhone);

// Rotas de teste para validação de CEP
router.post('/validate-cep', testController.testCEPValidation);
router.get('/generate-cep', testController.generateCEP);

export default router;
