import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { logger } from '../utils/logger';

// Configurações de rate limiting por tipo
const RATE_LIMIT_CONFIG = {
  // Rate limiter genérico (rotas públicas e protegidas)
  generic: {
    maxRequests: parseInt(process.env['RATE_LIMIT_GENERIC_MAX'] || '100'),
    windowMinutes: parseInt(process.env['RATE_LIMIT_GENERIC_WINDOW'] || '15'),
  },
  // Rate limiter para autenticação (mais restritivo)
  auth: {
    maxRequests: parseInt(process.env['RATE_LIMIT_AUTH_MAX'] || '10'),
    windowMinutes: parseInt(process.env['RATE_LIMIT_AUTH_WINDOW'] || '15'),
  },
  // Rate limiter para upload de arquivos
  upload: {
    maxRequests: parseInt(process.env['RATE_LIMIT_UPLOAD_MAX'] || '20'),
    windowMinutes: parseInt(process.env['RATE_LIMIT_UPLOAD_WINDOW'] || '60'),
  },
  // Rate limiter para API de pagamentos
  payment: {
    maxRequests: parseInt(process.env['RATE_LIMIT_PAYMENT_MAX'] || '5'),
    windowMinutes: parseInt(process.env['RATE_LIMIT_PAYMENT_WINDOW'] || '60'),
  },
  // Rate limiter para chat
  chat: {
    maxRequests: parseInt(process.env['RATE_LIMIT_CHAT_MAX'] || '50'),
    windowMinutes: parseInt(process.env['RATE_LIMIT_CHAT_WINDOW'] || '1'),
  },
};

// Função auxiliar para obter IP do cliente
const getClientIP = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

// Função auxiliar para verificar rate limit
const checkRateLimit = async (
  ip: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> => {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);

    // Contar requisições no período
    const count = await config.prisma.loginAttempt.count({
      where: {
        ip: ip,
        created_at: {
          gte: windowStart,
        },
        // Se houver identificador adicional (ex: user_id), pode ser usado
        // Por enquanto, usamos apenas IP
      },
    });

    const remaining = Math.max(0, maxRequests - count);
    const resetAt = new Date(now.getTime() + windowMinutes * 60 * 1000);

    return {
      allowed: count < maxRequests,
      remaining,
      resetAt,
    };
  } catch (error) {
    logger.error('Erro ao verificar rate limit:', error);
    // Em caso de erro, permitir a requisição (fail-open)
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(),
    };
  }
};

// Função auxiliar para registrar requisição
const recordRequest = async (ip: string, success: boolean): Promise<void> => {
  try {
    await config.prisma.loginAttempt.create({
      data: {
        ip,
        success,
        created_at: new Date(),
      },
    });
  } catch (error) {
    // Não bloquear requisição em caso de erro ao registrar
    logger.error('Erro ao registrar requisição para rate limiting:', error);
  }
};

// Rate limiter genérico
export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Em desenvolvimento, desativar rate limiting completamente
  if (process.env['NODE_ENV'] !== 'production') {
    return next();
  }

  const ip = getClientIP(req);
  const config = RATE_LIMIT_CONFIG.generic;

  const result = await checkRateLimit(ip, config.maxRequests, config.windowMinutes);

  if (!result.allowed) {
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return;
  }

  // Adicionar headers informativos
  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  // Registrar requisição (async, não bloqueia)
  recordRequest(ip, true).catch(() => {
    // Ignorar erros silenciosamente
  });

  next();
};

// Rate limiter para autenticação (mais restritivo)
export const authRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Em desenvolvimento, pode ser mais permissivo
  if (process.env['NODE_ENV'] === 'development' && process.env['DISABLE_RATE_LIMIT'] === 'true') {
    return next();
  }

  const ip = getClientIP(req);
  const config = RATE_LIMIT_CONFIG.auth;

  const result = await checkRateLimit(ip, config.maxRequests, config.windowMinutes);

  if (!result.allowed) {
    res.status(429).json({
      success: false,
      message: 'Muitas tentativas de autenticação. Aguarde antes de tentar novamente.',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  recordRequest(ip, true).catch(() => {});

  next();
};

// Rate limiter para upload de arquivos
export const uploadRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env['NODE_ENV'] === 'development' && process.env['DISABLE_RATE_LIMIT'] === 'true') {
    return next();
  }

  const ip = getClientIP(req);
  const config = RATE_LIMIT_CONFIG.upload;

  const result = await checkRateLimit(ip, config.maxRequests, config.windowMinutes);

  if (!result.allowed) {
    res.status(429).json({
      success: false,
      message: 'Limite de uploads excedido. Tente novamente mais tarde.',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  recordRequest(ip, true).catch(() => {});

  next();
};

// Rate limiter para API de pagamentos
export const paymentRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env['NODE_ENV'] === 'development' && process.env['DISABLE_RATE_LIMIT'] === 'true') {
    return next();
  }

  const ip = getClientIP(req);
  const config = RATE_LIMIT_CONFIG.payment;

  const result = await checkRateLimit(ip, config.maxRequests, config.windowMinutes);

  if (!result.allowed) {
    res.status(429).json({
      success: false,
      message: 'Limite de requisições de pagamento excedido. Tente novamente mais tarde.',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  recordRequest(ip, true).catch(() => {});

  next();
};

// Rate limiter para chat
export const chatRateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env['NODE_ENV'] === 'development' && process.env['DISABLE_RATE_LIMIT'] === 'true') {
    return next();
  }

  const ip = getClientIP(req);
  const config = RATE_LIMIT_CONFIG.chat;

  const result = await checkRateLimit(ip, config.maxRequests, config.windowMinutes);

  if (!result.allowed) {
    res.status(429).json({
      success: false,
      message: 'Muitas mensagens. Aguarde um momento antes de enviar novamente.',
      retryAfter: Math.ceil((result.resetAt.getTime() - Date.now()) / 1000),
    });
    return;
  }

  res.setHeader('X-RateLimit-Limit', config.maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());

  recordRequest(ip, true).catch(() => {});

  next();
};
