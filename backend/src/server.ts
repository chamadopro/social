import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar configurações
import { config } from './config/database';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import orcamentoRoutes from './routes/orcamentos';
import contratoRoutes from './routes/contratos';
import pagamentoRoutes from './routes/pagamentos';
import chatRoutes from './routes/chat';
import avaliacaoRoutes from './routes/avaliacoes';
import disputaRoutes from './routes/disputas';
import uploadRoutes from './routes/uploadRoutes';
import buscaRoutes from './routes/busca';
import searchRoutes from './routes/search';
import notificacaoRoutes from './routes/notificacoes';
import adminRoutes from './routes/admin';
import mensagensAutomaticasRoutes from './routes/mensagensAutomaticas';
import solicitacaoRoutes from './routes/solicitacoes';
import financeiroRoutes from './routes/financeiro';

// Importar serviços
import { notificationService } from './services/NotificationService';

// Carregar variáveis de ambiente
dotenv.config();

class ChamadoProServer {
  private app: express.Application;
  private server: any;
  private io: Server;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3001');
    this.server = createServer(this.app);
    
    // Configurar trust proxy para obter IP real do cliente
    this.app.set('trust proxy', true);
    // Configurar Socket.IO CORS para aceitar localhost e IPs da rede local em desenvolvimento
    const isProduction = process.env['NODE_ENV'] === 'production';
    const socketOrigins = isProduction
      ? [process.env['FRONTEND_URL'] || 'https://chamadopro.com']
      : [
          'http://localhost:3000',
          'http://localhost:3002',
          'http://localhost:8000',
          // Permitir qualquer IP da rede local em desenvolvimento (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
          /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/,
          /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/,
        ];

    this.io = new Server(this.server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin && !isProduction) {
            // Permitir requisições sem origin em desenvolvimento
            return callback(null, true);
          }
          
          if (isProduction) {
            // Em produção, apenas origins permitidas
            if (origin && socketOrigins.includes(origin)) {
              callback(null, true);
            } else {
              callback(new Error('Não permitido pelo CORS'));
            }
          } else {
            // Em desenvolvimento, permitir localhost e IPs da rede local
            if (origin) {
              const isAllowed = socketOrigins.some(allowed => {
                if (typeof allowed === 'string') {
                  return origin === allowed;
                } else if (allowed instanceof RegExp) {
                  return allowed.test(origin);
                }
                return false;
              });
              
              if (isAllowed || origin.includes('localhost') || origin.includes('127.0.0.1')) {
                callback(null, true);
              } else {
                callback(new Error('Não permitido pelo CORS'));
              }
            } else {
              callback(null, true);
            }
          }
        },
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Servir arquivos estáticos SEM helmet primeiro
    const path = require('path');
    const fs = require('fs');
    const uploadPath = path.join(__dirname, '../uploads');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    this.app.use('/uploads', express.static(uploadPath, {
      setHeaders: (res: any) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    }));

    // Segurança
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "http:", "https:", "'unsafe-inline'"],
        },
      },
    }));

    // CORS - Configuração baseada em ambiente
    const isProduction = process.env['NODE_ENV'] === 'production';
    const allowedOrigins = isProduction
      ? (process.env['CORS_ORIGINS']?.split(',') || ['https://chamadopro.com'])
      : [
          'http://localhost:3000',
          'http://localhost:3002',
          'http://localhost:8000',
          // Adicionar IPs da rede local para teste mobile (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
          ...(process.env['ALLOWED_IPS']?.split(',') || [])
        ];

    this.app.use(cors({
      origin: (origin, callback) => {
        // Permitir requisições sem origin (mobile apps, Postman, etc.) apenas em desenvolvimento
        if (!origin && !isProduction) {
          return callback(null, true);
        }

        // Verificar se origin está na lista permitida
        if (origin && allowedOrigins.includes(origin)) {
          callback(null, true);
        } else if (origin && !isProduction) {
          // Em desenvolvimento, permitir qualquer origin localhost ou IP da rede local
          const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
          const isLocalNetwork = /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin) ||
                                 /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(origin) ||
                                 /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(origin);
          
          if (isLocalhost || isLocalNetwork) {
            callback(null, true);
          } else {
            callback(new Error('Não permitido pelo CORS'));
          }
        } else {
          callback(new Error('Não permitido pelo CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
      exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
      maxAge: 86400 // 24 horas
    }));

    // Compressão
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: { write: (message) => logger.info(message.trim()) }
    }));

    // Rate limiting
    this.app.use(rateLimiter);

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env['NODE_ENV'] || 'development'
      });
    });
  }

  private initializeRoutes(): void {
    // Rotas da API
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/posts', postRoutes);
    this.app.use('/api/orcamentos', orcamentoRoutes);
    this.app.use('/api/contratos', contratoRoutes);
    this.app.use('/api/solicitacoes', solicitacaoRoutes);
    this.app.use('/api/pagamentos', pagamentoRoutes);
    this.app.use('/api/chat', chatRoutes);
    this.app.use('/api/avaliacoes', avaliacaoRoutes);
    this.app.use('/api/disputas', disputaRoutes);
    this.app.use('/api/upload', uploadRoutes);
    this.app.use('/api/busca', buscaRoutes);
    this.app.use('/api/search', searchRoutes);
    this.app.use('/api/notificacoes', notificacaoRoutes);
    this.app.use('/api/admin', adminRoutes);
    this.app.use('/api/mensagens-automaticas', mensagensAutomaticasRoutes);
    this.app.use('/api/financeiro', financeiroRoutes);

    // Rota 404
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado',
        path: req.originalUrl
      });
    });
  }

  private initializeSocketIO(): void {
    // Anexar Socket.IO ao NotificationService para notificações push
    notificationService.attachIO(this.io);
    
    // Log apenas em produção ou quando explicitamente habilitado para debug
    const isProduction = process.env['NODE_ENV'] === 'production';
    const shouldLog = isProduction || process.env['DEBUG_SOCKET'] === 'true';
    
    // Configurar Socket.IO para chat em tempo real
    this.io.on('connection', (socket) => {
      if (shouldLog) {
        logger.info(`Cliente conectado: ${socket.id}`);
      }

      // Entrar na sala do contrato
      socket.on('join_contract', (contratoId: string) => {
        socket.join(`contract_${contratoId}`);
        if (shouldLog) {
          logger.info(`Cliente ${socket.id} entrou na sala do contrato ${contratoId}`);
        }
      });

      // Sair da sala do contrato
      socket.on('leave_contract', (contratoId: string) => {
        socket.leave(`contract_${contratoId}`);
        if (shouldLog) {
          logger.info(`Cliente ${socket.id} saiu da sala do contrato ${contratoId}`);
        }
      });

      // Entrar na sala de admin
      socket.on('join_admin', (adminId: string) => {
        socket.join(`admin_${adminId}`);
        socket.join('admins');
        if (shouldLog) {
          logger.info(`Admin ${adminId} (${socket.id}) entrou na sala de administradores`);
        }
      });

      // Sair da sala de admin
      socket.on('leave_admin', (adminId: string) => {
        socket.leave(`admin_${adminId}`);
        socket.leave('admins');
        if (shouldLog) {
          logger.info(`Admin ${adminId} (${socket.id}) saiu da sala de administradores`);
        }
      });

      // Enviar mensagem (comentado temporariamente)
      socket.on('send_message', async (data: any) => {
        try {
          // const chatService = new ChatService();
          // const result = await chatService.sendMessage(data);
          
          // Broadcast para todos na sala do contrato
          this.io.to(`contract_${data.contratoId}`).emit('new_message', { message: 'Mensagem recebida' });
        } catch (error) {
          socket.emit('error', { message: 'Erro ao enviar mensagem' });
          logger.error('Erro ao enviar mensagem:', error);
        }
      });

      // Desconexão
      socket.on('disconnect', () => {
        if (shouldLog) {
          logger.info(`Cliente desconectado: ${socket.id}`);
        }
      });
    });
  }

  private initializeErrorHandling(): void {
    // Error handler global
    this.app.use(errorHandler);

    // Process handlers
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });
  }

  public async start(): Promise<void> {
    try {
    // Conectar ao banco de dados
    await config.connect();
    logger.info('✅ Banco de dados conectado');

      // Iniciar servidor
      this.server.listen(this.port, () => {
        logger.info(`🚀 Servidor ChamadoPro rodando na porta ${this.port}`);
        logger.info(`📱 API disponível em: http://localhost:${this.port}/api`);
        logger.info(`🔌 Socket.IO disponível em: http://localhost:${this.port}`);
        logger.info(`🌍 Ambiente: ${process.env['NODE_ENV'] || 'development'}`);
      });

    } catch (error) {
      logger.error('❌ Erro ao iniciar servidor:', error);
      process.exit(1);
    }
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getIO(): Server {
    return this.io;
  }
}

// Inicializar servidor
const server = new ChamadoProServer();
server.start();

export default server;
