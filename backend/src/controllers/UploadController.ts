import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
// import { config } from '../config/database';
import { logger } from '../utils/logger';

// Configuração do multer para upload
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
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro de tipos de arquivo
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Tipos de imagem permitidos
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  // Tipos de documento permitidos
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (imageTypes.includes(file.mimetype) || documentTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens (JPEG, PNG, GIF, WebP) e documentos (PDF, DOC, DOCX) são aceitos.'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Máximo 5 arquivos por upload
  }
});

export class UploadController {
  // Middleware de upload
  public static uploadMiddleware = upload.array('files', 5);

  // Upload de arquivos
  public async uploadFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi enviado'
        });
        return;
      }

      const files = req.files as Express.Multer.File[];
      const processedFiles: any[] = [];

      for (const file of files) {
        try {
          const fileInfo = await this.processFile(file, userId);
          processedFiles.push(fileInfo);
        } catch (error) {
          logger.error(`Erro ao processar arquivo ${file.originalname}:`, error);
          // Continue processando outros arquivos mesmo se um falhar
        }
      }

      if (processedFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Nenhum arquivo foi processado com sucesso'
        });
        return;
      }

      logger.info(`Upload realizado por usuário ${userId}: ${processedFiles.length} arquivos`);

      res.status(200).json({
        success: true,
        message: `${processedFiles.length} arquivo(s) enviado(s) com sucesso`,
        data: {
          files: processedFiles,
          total: processedFiles.length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Processar arquivo individual
  private async processFile(file: Express.Multer.File, userId: string): Promise<any> {
    const fileInfo = {
      id: require('crypto').randomUUID(),
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${file.filename}`,
      userId: userId,
      createdAt: new Date()
    };

    // Se for uma imagem, criar versões redimensionadas
    if (file.mimetype.startsWith('image/')) {
      await this.createImageVariants(file.path, file.filename);
    }

    // Salvar informações do arquivo no banco de dados
    await this.saveFileToDatabase(fileInfo);

    return fileInfo;
  }

  // Criar versões redimensionadas da imagem
  private async createImageVariants(filePath: string, filename: string): Promise<void> {
    const baseName = path.parse(filename).name;
    const ext = path.parse(filename).ext;
    const dir = path.dirname(filePath);

    try {
      // Thumbnail (150x150)
      await sharp(filePath)
        .resize(150, 150, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(path.join(dir, `${baseName}_thumb${ext}`));

      // Medium (600x600)
      await sharp(filePath)
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(path.join(dir, `${baseName}_medium${ext}`));

      // Large (1200x1200)
      await sharp(filePath)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toFile(path.join(dir, `${baseName}_large${ext}`));

    } catch (error) {
      logger.error(`Erro ao criar variantes da imagem ${filename}:`, error);
      throw error;
    }
  }

  // Salvar informações do arquivo no banco de dados
  private async saveFileToDatabase(fileInfo: any): Promise<void> {
    try {
      // Aqui você pode salvar as informações do arquivo em uma tabela específica
      // Por enquanto, vamos apenas logar
      logger.info(`Arquivo salvo: ${fileInfo.originalName} (${fileInfo.size} bytes)`);
    } catch (error) {
      logger.error('Erro ao salvar arquivo no banco de dados:', error);
      throw error;
    }
  }

  // Listar arquivos do usuário
  public async getUserFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { page = 1, limit = 10, type: _type } = req.query;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Por enquanto, retornar uma lista vazia
      // Em uma implementação real, você buscaria do banco de dados
      res.status(200).json({
        success: true,
        data: {
          files: [],
          total: 0,
          page: Number(page),
          limit: Number(limit),
          totalPages: 0
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Deletar arquivo
  public async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { fileId: _fileId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Por enquanto, retornar sucesso
      // Em uma implementação real, você deletaria o arquivo e as informações do banco
      res.status(200).json({
        success: true,
        message: 'Arquivo deletado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter arquivo
  public async getFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename } = req.params;
      const filePath = path.join(__dirname, '../../uploads', filename);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'Arquivo não encontrado'
        });
        return;
      }

      res.sendFile(filePath);

    } catch (error) {
      next(error);
    }
  }
}