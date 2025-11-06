import express from 'express';
import { authenticate } from '../middleware/auth';
import financeiroController from '../controllers/FinanceiroController';
import contaBancariaController from '../controllers/ContaBancariaController';
import cartaoController from '../controllers/CartaoController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

// Movimentações financeiras
router.get('/movimentacoes', financeiroController.getMovimentacoes.bind(financeiroController));
router.post('/movimentacao', financeiroController.createMovimentacao.bind(financeiroController));
router.get('/saldos', financeiroController.getSaldos.bind(financeiroController));
router.get('/estatisticas', financeiroController.getEstatisticas.bind(financeiroController));

// Contas bancárias
router.get('/contas', contaBancariaController.getContas.bind(contaBancariaController));
router.post('/contas', contaBancariaController.createConta.bind(contaBancariaController));
router.put('/contas/:id', contaBancariaController.updateConta.bind(contaBancariaController));
router.delete('/contas/:id', contaBancariaController.deleteConta.bind(contaBancariaController));

// Cartões
router.get('/cartoes', cartaoController.getCartoes.bind(cartaoController));
router.post('/cartoes', cartaoController.createCartao.bind(cartaoController));
router.put('/cartoes/:id', cartaoController.updateCartao.bind(cartaoController));
router.delete('/cartoes/:id', cartaoController.deleteCartao.bind(cartaoController));

export default router;

