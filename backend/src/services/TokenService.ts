import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/database';
import { logger } from '../utils/logger';
import { TipoToken } from '@prisma/client';

export class TokenService {
  // Criar token de verificação
  public async createVerificationToken(
    usuarioId: string, 
    tipo: TipoToken, 
    expiraEmHoras: number = 24
  ): Promise<string> {
    try {
      // Invalidar tokens anteriores do mesmo tipo para o usuário
      await config.prisma.tokenVerificacao.updateMany({
        where: {
          usuario_id: usuarioId,
          tipo: tipo,
          usado: false
        },
        data: {
          usado: true
        }
      });

      // Criar novo token
      const token = uuidv4();
      const expiraEm = new Date();
      expiraEm.setHours(expiraEm.getHours() + expiraEmHoras);

      await config.prisma.tokenVerificacao.create({
        data: {
          id: uuidv4(),
          usuario_id: usuarioId,
          token: token,
          tipo: tipo,
          expira_em: expiraEm,
          usado: false
        }
      });

      logger.info(`Token de ${tipo} criado para usuário ${usuarioId}`);
      return token;

    } catch (error) {
      logger.error('Erro ao criar token de verificação:', error);
      throw error;
    }
  }

  // Validar token de verificação
  public async validateToken(token: string, tipo: TipoToken): Promise<{
    isValid: boolean;
    usuarioId?: string;
    message?: string;
  }> {
    try {
      const tokenRecord = await config.prisma.tokenVerificacao.findUnique({
        where: { token },
        include: { usuario: true }
      });

      if (!tokenRecord) {
        return {
          isValid: false,
          message: 'Token inválido'
        };
      }

      if (tokenRecord.usado) {
        return {
          isValid: false,
          message: 'Token já foi utilizado'
        };
      }

      if (tokenRecord.tipo !== tipo) {
        return {
          isValid: false,
          message: 'Tipo de token inválido'
        };
      }

      if (new Date() > tokenRecord.expira_em) {
        return {
          isValid: false,
          message: 'Token expirado'
        };
      }

      if (!tokenRecord.usuario.ativo) {
        return {
          isValid: false,
          message: 'Usuário inativo'
        };
      }

      return {
        isValid: true,
        usuarioId: tokenRecord.usuario_id
      };

    } catch (error) {
      logger.error('Erro ao validar token:', error);
      return {
        isValid: false,
        message: 'Erro interno do servidor'
      };
    }
  }

  // Marcar token como usado
  public async markTokenAsUsed(token: string): Promise<void> {
    try {
      await config.prisma.tokenVerificacao.update({
        where: { token },
        data: { usado: true }
      });

      logger.info(`Token ${token} marcado como usado`);

    } catch (error) {
      logger.error('Erro ao marcar token como usado:', error);
      throw error;
    }
  }

  // Limpar tokens expirados
  public async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await config.prisma.tokenVerificacao.deleteMany({
        where: {
          expira_em: {
            lt: new Date()
          }
        }
      });

      logger.info(`${result.count} tokens expirados removidos`);
      return result.count;

    } catch (error) {
      logger.error('Erro ao limpar tokens expirados:', error);
      throw error;
    }
  }

  // Obter token ativo do usuário por tipo
  public async getActiveTokenByUser(
    usuarioId: string, 
    tipo: TipoToken
  ): Promise<string | null> {
    try {
      const tokenRecord = await config.prisma.tokenVerificacao.findFirst({
        where: {
          usuario_id: usuarioId,
          tipo: tipo,
          usado: false,
          expira_em: {
            gt: new Date()
          }
        },
        orderBy: {
          criado_em: 'desc'
        }
      });

      return tokenRecord ? tokenRecord.token : null;

    } catch (error) {
      logger.error('Erro ao buscar token ativo:', error);
      throw error;
    }
  }

  // Verificar se usuário tem token ativo
  public async hasActiveToken(
    usuarioId: string, 
    tipo: TipoToken
  ): Promise<boolean> {
    try {
      const tokenRecord = await config.prisma.tokenVerificacao.findFirst({
        where: {
          usuario_id: usuarioId,
          tipo: tipo,
          usado: false,
          expira_em: {
            gt: new Date()
          }
        }
      });

      return !!tokenRecord;

    } catch (error) {
      logger.error('Erro ao verificar token ativo:', error);
      throw error;
    }
  }
}

// Instância padrão
export const tokenService = new TokenService();

