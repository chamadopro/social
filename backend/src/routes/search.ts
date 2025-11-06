import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { authenticate } from '../middleware/auth';

const router = Router();
const searchController = new SearchController();

// Rotas públicas
router.get('/posts', searchController.searchPosts.bind(searchController));
router.get('/users', searchController.searchUsers.bind(searchController));
router.get('/services', searchController.searchServices.bind(searchController));
router.get('/global', searchController.globalSearch.bind(searchController));
router.get('/suggestions', searchController.getSuggestions.bind(searchController));
router.get('/filters', searchController.getAvailableFilters.bind(searchController));

// Rotas protegidas (requer autenticação)
router.use(authenticate);
router.post('/save', searchController.saveSearch.bind(searchController));

export default router;


