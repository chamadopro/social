import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../middleware/auth';

const router = Router();
const profileController = new ProfileController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas do perfil
router.get('/', profileController.getProfile.bind(profileController));
router.put('/', profileController.updateProfile.bind(profileController));
router.put('/picture', profileController.updateProfilePicture.bind(profileController));
router.put('/password', profileController.changePassword.bind(profileController));
router.get('/activity', profileController.getActivityHistory.bind(profileController));
router.delete('/', profileController.deleteAccount.bind(profileController));

export default router;
