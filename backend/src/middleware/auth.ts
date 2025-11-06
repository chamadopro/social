import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/database';
import { unauthorized, forbidden } from './errorHandler';
// import { logger } from '../utils/logger';

// Interface para o payload do JWT
interface JwtPayload {
  id: string;
  email: string;
  tipo: string;
  iat: number;
  exp: number;
}

// Estender a interface Request para incluir o usuário
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tipo: string;
      };
    }
  }
}

// Middleware de autenticação
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw unauthorized('Token de acesso não fornecido');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    if (!token) {
      throw unauthorized('Token de acesso não fornecido');
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload;
    
    // Buscar o usuário no banco de dados
    const user = await config.prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        tipo: true,
        ativo: true,
        verificado: true,
      },
    });

    if (!user) {
      throw unauthorized('Usuário não encontrado');
    }

    if (!user.ativo) {
      throw forbidden('Conta desativada');
    }

    if (!user.verificado) {
      throw forbidden('Email não verificado. Verifique sua caixa de entrada.');
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(unauthorized('Token inválido'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(unauthorized('Token expirado'));
    } else {
      next(error);
    }
  }
};

// Middleware para verificar tipo de usuário
export const requireUserType = (allowedTypes: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw unauthorized('Usuário não autenticado');
    }

    if (!allowedTypes.includes(req.user.tipo)) {
      throw forbidden('Acesso negado para este tipo de usuário');
    }

    next();
  };
};

// Middleware para verificar se é cliente
export const requireCliente = requireUserType(['CLIENTE']);

// Middleware para verificar se é prestador
export const requirePrestador = requireUserType(['PRESTADOR']);

// Middleware para verificar se é moderador
export const requireModerador = requireUserType(['MODERADOR', 'ADMIN']);

// Middleware para verificar se é admin
export const requireAdmin = requireUserType(['ADMIN']);

// Middleware para verificar se é moderador ou admin
export const requireModeradorOrAdmin = requireUserType(['MODERADOR', 'ADMIN']);

// Middleware para verificar se é cliente ou prestador
export const requireClienteOrPrestador = requireUserType(['CLIENTE', 'PRESTADOR']);

// Middleware para verificar se o usuário está verificado
export const requireVerified = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw unauthorized('Usuário não autenticado');
  }

  // Buscar informações completas do usuário
  config.prisma.usuario.findUnique({
    where: { id: req.user.id },
    select: { verificado: true },
  }).then(user => {
    if (!user?.verificado) {
      throw forbidden('Conta não verificada. Verifique seu email primeiro.');
    }
    next();
  }).catch(next);
};

// Middleware opcional de autenticação (não falha se não houver token)
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload;
    
    // Buscar o usuário no banco de dados
    const user = await config.prisma.usuario.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        tipo: true,
        ativo: true,
      },
    });

    if (user && user.ativo) {
      req.user = {
        id: user.id,
        email: user.email,
        tipo: user.tipo,
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem autenticar
    next();
  }
};

// Função para gerar token JWT
export const generateToken = (payload: { id: string; email: string; tipo: string }): string => {
  return jwt.sign(payload, process.env['JWT_SECRET']!, {
    expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
  } as jwt.SignOptions);
};

// Função para gerar refresh token
export const generateRefreshToken = (payload: { id: string; email: string; tipo: string }): string => {
  return jwt.sign(payload, process.env['REFRESH_TOKEN_SECRET']!, {
    expiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] || '30d',
  } as jwt.SignOptions);
};

// Função para verificar refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env['REFRESH_TOKEN_SECRET']!) as JwtPayload;
};

