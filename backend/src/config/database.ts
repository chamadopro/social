import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

class DatabaseConfig {
  private static instance: DatabaseConfig;
  public prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        {
          emit: 'event',
          level: 'query',
        },
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'info',
        },
        {
          emit: 'event',
          level: 'warn',
        },
      ],
    });

    // Configurar logs do Prisma (comentado temporariamente)
    // this.prisma.$on('query', (e: any) => {
    //   if (process.env['NODE_ENV'] === 'development') {
    //     logger.debug('Query:', {
    //       query: e.query,
    //       params: e.params,
    //       duration: `${e.duration}ms`,
    //     });
    //   }
    // });

    // this.prisma.$on('error', (e: any) => {
    //   logger.error('Prisma Error:', e);
    // });

    // this.prisma.$on('info', (e: any) => {
    //   logger.info('Prisma Info:', e.message);
    // });

    // this.prisma.$on('warn', (e: any) => {
    //   logger.warn('Prisma Warning:', e.message);
    // });
  }

  public static getInstance(): DatabaseConfig {
    if (!DatabaseConfig.instance) {
      DatabaseConfig.instance = new DatabaseConfig();
    }
    return DatabaseConfig.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Conectado ao banco de dados PostgreSQL');
    } catch (error) {
      logger.error('❌ Erro ao conectar ao banco de dados:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('✅ Desconectado do banco de dados');
    } catch (error) {
      logger.error('❌ Erro ao desconectar do banco de dados:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('❌ Health check do banco falhou:', error);
      return false;
    }
  }

  // Método para executar transações
  public async transaction<T>(
    callback: (prisma: any) => Promise<T>
  ): Promise<T> {
    return await this.prisma.$transaction(callback);
  }

  // Método para executar queries raw
  public async rawQuery<T = any>(query: string, params: any[] = []): Promise<T> {
    return await this.prisma.$queryRawUnsafe(query, ...params);
  }
}

export const config = DatabaseConfig.getInstance();
export { PrismaClient } from '@prisma/client';
