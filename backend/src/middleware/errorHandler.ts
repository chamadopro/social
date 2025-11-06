import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Interface para erros customizados
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Classe para erros customizados
export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware de tratamento de erros
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let { statusCode = 500, message } = error;

  // Log do erro
  logger.error('Error Handler:', {
    error: message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
  });

  // Se não for um erro operacional, não expor detalhes
  if (!error.isOperational) {
    message = 'Algo deu errado no servidor';
    statusCode = 500;
  }

  // Resposta de erro
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env['NODE_ENV'] === 'development' && {
      stack: error.stack,
      details: error,
    }),
  });
};

// Middleware para capturar erros assíncronos
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para 404
export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  const error = new CustomError(`Rota não encontrada: ${req.originalUrl}`, 404);
  next(error);
};

// Função para criar erros customizados
export const createError = (message: string, statusCode: number = 500): CustomError => {
  return new CustomError(message, statusCode);
};

// Funções para erros comuns
export const badRequest = (message: string = 'Requisição inválida'): CustomError => {
  return new CustomError(message, 400);
};

export const unauthorized = (message: string = 'Não autorizado'): CustomError => {
  return new CustomError(message, 401);
};

export const forbidden = (message: string = 'Acesso negado'): CustomError => {
  return new CustomError(message, 403);
};

export const notFoundError = (message: string = 'Recurso não encontrado'): CustomError => {
  return new CustomError(message, 404);
};

export const conflict = (message: string = 'Conflito de dados'): CustomError => {
  return new CustomError(message, 409);
};

export const unprocessableEntity = (message: string = 'Dados inválidos'): CustomError => {
  return new CustomError(message, 422);
};

export const tooManyRequests = (message: string = 'Muitas requisições'): CustomError => {
  return new CustomError(message, 429);
};

export const internalServerError = (message: string = 'Erro interno do servidor'): CustomError => {
  return new CustomError(message, 500);
};

export const serviceUnavailable = (message: string = 'Serviço indisponível'): CustomError => {
  return new CustomError(message, 503);
};

