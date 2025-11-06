import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middleware/validation';
import { authSchemas } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { checkLoginAttempts, recordLoginAttempt, rateLimitLogin, clearLoginAttempts } from '../middleware/loginAttemptMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from '../config/database';
import { instagramAuthController } from '../controllers/InstagramAuthController';
import { googleAuthController } from '../controllers/GoogleAuthController';

const router = Router();
const authController = new AuthController();

// Configuração do multer para upload de foto de perfil e documentos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = file.fieldname === 'foto_perfil' ? 'perfil-' : 
                   file.fieldname === 'documento_verificacao' ? 'doc-' : 'file-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar imagens e PDFs
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens e PDFs são aceitos.'));
  }
};

const uploadFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB para permitir PDFs
  }
}).fields([
  { name: 'foto_perfil', maxCount: 1 },
  { name: 'documento_verificacao', maxCount: 1 }
]);

// Rate limiting para autenticação
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  router.use(authRateLimiter);
}

// Rotas de autenticação
router.post('/register', 
  uploadFiles,
  // Validação Joi comentada temporariamente - campos serão validados no controller
  // validate(authSchemas.register),
  authController.register
);

// Em desenvolvimento, desabilitar rate limit de login para evitar bloqueios ao testar pelo mobile
if (isProduction) {
  router.post('/login', 
    rateLimitLogin,
    checkLoginAttempts,
    validate(authSchemas.login),
    authController.login,
    recordLoginAttempt,
    clearLoginAttempts
  );
} else {
  router.post('/login', 
    validate(authSchemas.login),
    authController.login
  );
}

// Endpoint DEV para limpar tentativas de login (não disponível em produção)
if (!isProduction) {
  router.post('/dev/clear-login-attempts', async (req, res, next) => {
    try {
      const { email, ip, secret } = req.body || {};

      // Proteção simples: exigir uma chave em ambiente de dev
      const expected = process.env.DEV_ADMIN_SECRET || 'dev-secret';
      if (secret !== expected) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const where: any = {};
      if (email) where.email = email;
      if (ip) where.ip = ip;

      if (!email && !ip) {
        return res.status(400).json({ success: false, message: 'Informe email ou ip' });
      }

      const result = await config.prisma.loginAttempt.deleteMany({ where });
      return res.json({ success: true, data: { deletedCount: result.count } });
    } catch (error) {
      next(error);
    }
  });

  router.get('/dev/login-attempt-ips', async (_req, res, next) => {
    try {
      const rows = await config.prisma.loginAttempt.findMany({
        select: { ip: true },
        orderBy: { created_at: 'desc' },
        distinct: ['ip'],
        take: 20
      });
      res.json({ success: true, data: rows.map(r => r.ip).filter(Boolean) });
    } catch (error) {
      next(error);
    }
  });
}

// Rotas OAuth Instagram
router.get('/instagram', (req, res) => instagramAuthController.start(req, res));
router.get('/instagram/callback', (req, res, next) => instagramAuthController.callback(req, res, next));

// Rotas OAuth Google
router.get('/google', (req, res) => googleAuthController.start(req, res));
router.get('/google/callback', (req, res, next) => googleAuthController.callback(req, res, next));

router.post('/refresh', 
  validate(authSchemas.refreshToken),
  authController.refreshToken
);

router.post('/logout', 
  authController.logout
);

router.post('/forgot-password', 
  validate(authSchemas.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password', 
  validate(authSchemas.resetPassword),
  authController.resetPassword
);

router.get('/me', 
  authController.getProfile
);

router.post('/verify-email', 
  authController.verifyEmail
);

router.post('/resend-verification', 
  authController.resendVerificationEmail
);

export default router;

