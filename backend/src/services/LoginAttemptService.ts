import { config } from '../config/database';
import { logger } from '../utils/logger';

export interface LoginAttemptResult {
  isBlocked: boolean;
  remainingAttempts: number;
  blockExpiresAt?: Date;
  message?: string;
}

export interface LoginAttemptConfig {
  maxAttempts: number;
  blockDurationMinutes: number;
  windowSizeMinutes: number;
  cleanupIntervalMinutes: number;
}

const DEFAULT_CONFIG: LoginAttemptConfig = {
  maxAttempts: 5,
  blockDurationMinutes: 10,
  windowSizeMinutes: 15,
  cleanupIntervalMinutes: 5
};

export class LoginAttemptService {
  private config: LoginAttemptConfig;

  constructor(customConfig?: Partial<LoginAttemptConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  // Verificar se IP está bloqueado
  public async isIPBlocked(ip: string): Promise<LoginAttemptResult> {
    try {
      const now = new Date();

      // Verificar se há bloqueio ativo para este IP
      const activeBlock = await config.prisma.loginAttempt.findFirst({
        where: {
          ip: ip,
          blocked: true,
          block_expires: {
            gt: now
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (activeBlock) {
        return {
          isBlocked: true,
          remainingAttempts: 0,
          blockExpiresAt: activeBlock.block_expires || undefined,
          message: `IP bloqueado temporariamente. Tente novamente em ${this.getTimeRemaining(activeBlock.block_expires)}`
        };
      }

      // Contar tentativas recentes para este IP
      const windowStart = new Date(now.getTime() - (this.config.windowSizeMinutes * 60 * 1000));
      const recentAttempts = await config.prisma.loginAttempt.count({
        where: {
          ip: ip,
          success: false,
          created_at: {
            gte: windowStart
          }
        }
      });

      const remainingAttempts = Math.max(0, this.config.maxAttempts - recentAttempts);

      return {
        isBlocked: false,
        remainingAttempts,
        message: remainingAttempts <= 2 ? `Restam ${remainingAttempts} tentativas` : undefined
      };

    } catch (error) {
      logger.error('Erro ao verificar bloqueio de IP:', error);
      return {
        isBlocked: false,
        remainingAttempts: this.config.maxAttempts,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  // Verificar se email está bloqueado
  public async isEmailBlocked(email: string): Promise<LoginAttemptResult> {
    try {
      const now = new Date();

      // Verificar se há bloqueio ativo para este email
      const activeBlock = await config.prisma.loginAttempt.findFirst({
        where: {
          email: email,
          blocked: true,
          block_expires: {
            gt: now
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (activeBlock) {
        return {
          isBlocked: true,
          remainingAttempts: 0,
          blockExpiresAt: activeBlock.block_expires || undefined,
          message: `Email bloqueado temporariamente. Tente novamente em ${this.getTimeRemaining(activeBlock.block_expires)}`
        };
      }

      // Contar tentativas recentes para este email
      const windowStart = new Date(now.getTime() - (this.config.windowSizeMinutes * 60 * 1000));
      const recentAttempts = await config.prisma.loginAttempt.count({
        where: {
          email: email,
          success: false,
          created_at: {
            gte: windowStart
          }
        }
      });

      const remainingAttempts = Math.max(0, this.config.maxAttempts - recentAttempts);

      return {
        isBlocked: false,
        remainingAttempts,
        message: remainingAttempts <= 2 ? `Restam ${remainingAttempts} tentativas` : undefined
      };

    } catch (error) {
      logger.error('Erro ao verificar bloqueio de email:', error);
      return {
        isBlocked: false,
        remainingAttempts: this.config.maxAttempts,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  // Registrar tentativa de login
  public async recordAttempt(
    ip: string, 
    email: string | null, 
    success: boolean, 
    userAgent?: string
  ): Promise<void> {
    try {
      const now = new Date();
      
      // Se foi uma tentativa falhada, verificar se deve bloquear
      if (!success) {
        const windowStart = new Date(now.getTime() - (this.config.windowSizeMinutes * 60 * 1000));
        
        // Contar tentativas recentes para IP
        const ipAttempts = await config.prisma.loginAttempt.count({
          where: {
            ip: ip,
            success: false,
            created_at: {
              gte: windowStart
            }
          }
        });

        // Contar tentativas recentes para email (se fornecido)
        let emailAttempts = 0;
        if (email) {
          emailAttempts = await config.prisma.loginAttempt.count({
            where: {
              email: email,
              success: false,
              created_at: {
                gte: windowStart
              }
            }
          });
        }

        // Verificar se deve bloquear
        const shouldBlock = (ipAttempts + 1) >= this.config.maxAttempts || 
                           (email && (emailAttempts + 1) >= this.config.maxAttempts);

        // Calcular data de expiração do bloqueio
        const blockExpires = shouldBlock ? new Date(now.getTime() + (this.config.blockDurationMinutes * 60 * 1000)) : undefined;

        // Registrar tentativa
        await config.prisma.loginAttempt.create({
          data: {
            id: crypto.randomUUID(),
            ip: ip,
            email: email,
            success: false,
            user_agent: userAgent,
            blocked: shouldBlock || false,
            block_expires: blockExpires || undefined
          }
        });

        if (shouldBlock) {
          logger.warn(`Login bloqueado para IP: ${ip}${email ? `, Email: ${email}` : ''}`);
        }

      } else {
        // Login bem-sucedido - registrar e limpar tentativas anteriores
        await config.prisma.loginAttempt.create({
          data: {
            id: crypto.randomUUID(),
            ip: ip,
            email: email,
            success: true,
            user_agent: userAgent,
            blocked: false
          }
        });

        // Limpar tentativas anteriores para este IP/email
        await this.clearAttempts(ip, email);
      }

    } catch (error) {
      logger.error('Erro ao registrar tentativa de login:', error);
    }
  }

  // Limpar tentativas anteriores (quando login é bem-sucedido)
  public async clearAttempts(ip: string, email?: string | null): Promise<void> {
    try {
      const whereClause: any = { ip: ip };
      if (email) {
        whereClause.email = email;
      }

      await config.prisma.loginAttempt.updateMany({
        where: {
          ...whereClause,
          success: false,
          blocked: false
        },
        data: {
          blocked: true // Marcar como "limpo" para não contar mais
        }
      });

    } catch (error) {
      logger.error('Erro ao limpar tentativas de login:', error);
    }
  }

  // Limpeza automática de tentativas antigas
  public async cleanupOldAttempts(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 24); // 24 horas atrás

      const result = await config.prisma.loginAttempt.deleteMany({
        where: {
          created_at: {
            lt: cutoffDate
          }
        }
      });

      logger.info(`${result.count} tentativas de login antigas removidas`);
      return result.count;

    } catch (error) {
      logger.error('Erro ao limpar tentativas antigas:', error);
      return 0;
    }
  }

  // Limpeza de bloqueios expirados
  public async cleanupExpiredBlocks(): Promise<number> {
    try {
      const now = new Date();

      const result = await config.prisma.loginAttempt.updateMany({
        where: {
          blocked: true,
          block_expires: {
            lt: now
          }
        },
        data: {
          blocked: false,
          block_expires: null
        }
      });

      if (result.count > 0) {
        logger.info(`${result.count} bloqueios expirados removidos`);
      }

      return result.count;

    } catch (error) {
      logger.error('Erro ao limpar bloqueios expirados:', error);
      return 0;
    }
  }

  // Obter estatísticas de tentativas
  public async getAttemptStats(ip?: string, email?: string): Promise<{
    totalAttempts: number;
    failedAttempts: number;
    successfulAttempts: number;
    blockedAttempts: number;
    lastAttempt?: Date;
  }> {
    try {
      const whereClause: any = {};
      if (ip) whereClause.ip = ip;
      if (email) whereClause.email = email;

      const [total, failed, successful, blocked, last] = await Promise.all([
        config.prisma.loginAttempt.count({ where: whereClause }),
        config.prisma.loginAttempt.count({ where: { ...whereClause, success: false } }),
        config.prisma.loginAttempt.count({ where: { ...whereClause, success: true } }),
        config.prisma.loginAttempt.count({ where: { ...whereClause, blocked: true } }),
        config.prisma.loginAttempt.findFirst({
          where: whereClause,
          orderBy: { created_at: 'desc' },
          select: { created_at: true }
        })
      ]);

      return {
        totalAttempts: total,
        failedAttempts: failed,
        successfulAttempts: successful,
        blockedAttempts: blocked,
        lastAttempt: last?.created_at
      };

    } catch (error) {
      logger.error('Erro ao obter estatísticas de tentativas:', error);
      return {
        totalAttempts: 0,
        failedAttempts: 0,
        successfulAttempts: 0,
        blockedAttempts: 0
      };
    }
  }

  // Calcular tempo restante até desbloqueio
  private getTimeRemaining(blockExpires: Date | null): string {
    if (!blockExpires) return '0 minutos';

    const now = new Date();
    const diffMs = blockExpires.getTime() - now.getTime();
    
    if (diffMs <= 0) return '0 minutos';

    const minutes = Math.ceil(diffMs / (1000 * 60));
    return `${minutes} minutos`;
  }

  // Iniciar limpeza automática (chamado pelo cron job)
  public async startCleanupJob(): Promise<void> {
    setInterval(async () => {
      try {
        await this.cleanupOldAttempts();
        await this.cleanupExpiredBlocks();
      } catch (error) {
        logger.error('Erro no job de limpeza:', error);
      }
    }, this.config.cleanupIntervalMinutes * 60 * 1000);

    logger.info('Job de limpeza de tentativas de login iniciado');
  }
}

// Instância padrão
export const loginAttemptService = new LoginAttemptService();
