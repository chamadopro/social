import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { authenticate } from '../middleware/auth';

const router = Router();
const uploadController = new UploadController();

// Middleware de autenticação para todas as rotas
router.use(authenticate);

// Rotas de upload
router.post('/files', UploadController.uploadMiddleware, uploadController.uploadFiles.bind(uploadController));
router.get('/files', uploadController.getUserFiles.bind(uploadController));
router.delete('/files/:fileId', uploadController.deleteFile.bind(uploadController));
router.get('/files/:filename', uploadController.getFile.bind(uploadController));

export default router;


