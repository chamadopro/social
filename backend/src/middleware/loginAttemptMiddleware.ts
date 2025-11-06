import { Request, Response, NextFunction } from 'express';
import { loginAttemptService } from '../services/LoginAttemptService';
import { forbidden, tooManyRequests } from './errorHandler';
import { logger } from '../utils/logger';

export interface LoginAttemptRequest extends Request {
  loginAttempt?: {
    isBlocked: boolean;
    remainingAttempts: number;
    blockExpiresAt?: Date;
    message?: string;
  };
}

// Middleware para verificar tentativas de login antes do login
export const checkLoginAttempts = async (
  req: LoginAttemptRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email;
    const userAgent = req.get('User-Agent');

    // Verificar bloqueio por IP
    const ipCheck = await loginAttemptService.isIPBlocked(ip);
    if (ipCheck.isBlocked) {
      logger.warn(`Tentativa de login bloqueada por IP: ${ip}`, {
        ip,
        email,
        userAgent,
        blockExpiresAt: ipCheck.blockExpiresAt
      });

      throw forbidden(ipCheck.message || 'IP bloqueado temporariamente');
    }

    // Verificar bloqueio por email (se fornecido)
    if (email) {
      const emailCheck = await loginAttemptService.isEmailBlocked(email);
      if (emailCheck.isBlocked) {
        logger.warn(`Tentativa de login bloqueada por email: ${email}`, {
          ip,
          email,
          userAgent,
          blockExpiresAt: emailCheck.blockExpiresAt
        });

        throw forbidden(emailCheck.message || 'Email bloqueado temporariamente');
      }

      // Adicionar informações de tentativas à requisição
      req.loginAttempt = {
        isBlocked: false,
        remainingAttempts: Math.min(ipCheck.remainingAttempts, emailCheck.remainingAttempts),
        message: ipCheck.message || emailCheck.message
      };
    } else {
      // Apenas verificação por IP
      req.loginAttempt = {
        isBlocked: false,
        remainingAttempts: ipCheck.remainingAttempts,
        message: ipCheck.message
      };
    }

    // Log de tentativa de login
    logger.info(`Tentativa de login verificada`, {
      ip,
      email,
      remainingAttempts: req.loginAttempt.remainingAttempts,
      userAgent
    });

    next();

  } catch (error) {
    next(error);
  }
};

// Middleware para registrar tentativa de login após o processamento
export const recordLoginAttempt = async (
  req: LoginAttemptRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email;
    const userAgent = req.get('User-Agent');

    // Verificar se a resposta indica sucesso ou falha
    const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
    
    // Registrar tentativa
    await loginAttemptService.recordAttempt(ip, email, isSuccess, userAgent);

    // Se foi bloqueado, adicionar header de retry-after
    if (!isSuccess && req.loginAttempt?.remainingAttempts && req.loginAttempt.remainingAttempts <= 1) {
      const blockDuration = 10 * 60; // 10 minutos em segundos
      res.set('Retry-After', blockDuration.toString());
    }

    next();

  } catch (error) {
    logger.error('Erro ao registrar tentativa de login:', error);
    next(); // Não falhar a requisição por erro de logging
  }
};

// Middleware para rate limiting básico (máximo 10 tentativas por minuto por IP)
export const rateLimitLogin = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    // const now = new Date();
    // const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

    // Contar tentativas nos últimos 60 segundos
    const recentAttempts = await loginAttemptService.getAttemptStats(ip);
    
    if (recentAttempts.totalAttempts >= 10) {
      logger.warn(`Rate limit excedido para IP: ${ip}`, {
        ip,
        attempts: recentAttempts.totalAttempts,
        lastAttempt: recentAttempts.lastAttempt
      });

      throw tooManyRequests('Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.');
    }

    next();

  } catch (error) {
    next(error);
  }
};

// Middleware para limpar tentativas após login bem-sucedido
export const clearLoginAttempts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email;

    // Se o login foi bem-sucedido, limpar tentativas anteriores
    if (res.statusCode >= 200 && res.statusCode < 300) {
      await loginAttemptService.clearAttempts(ip, email);
      
      logger.info(`Tentativas de login limpas após sucesso`, {
        ip,
        email
      });
    }

    next();

  } catch (error) {
    logger.error('Erro ao limpar tentativas de login:', error);
    next(); // Não falhar a requisição por erro de limpeza
  }
};
