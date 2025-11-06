import winston from 'winston';
import path from 'path';

// Configuração dos níveis de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Configuração das cores para cada nível
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Adicionar cores ao winston
winston.addColors(colors);

// Configuração do formato dos logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info['timestamp']} ${info.level}: ${info.message}`
  )
);

// Configuração dos transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format,
  }),
  
  // File transport para erros
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  
  // File transport para todos os logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Criar o logger
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Criar diretório de logs se não existir
import fs from 'fs';
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Função para log de auditoria
export const auditLog = (action: string, details: any, userId?: string) => {
  logger.info('AUDIT', {
    action,
    details,
    userId,
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown',
  });
};

// Função para log de segurança
export const securityLog = (event: string, details: any) => {
  logger.warn('SECURITY', {
    event,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Função para log de performance
export const performanceLog = (operation: string, duration: number, details?: any) => {
  logger.info('PERFORMANCE', {
    operation,
    duration: `${duration}ms`,
    details,
    timestamp: new Date().toISOString(),
  });
};

// Função para log de transação
export const transactionLog = (type: string, amount: number, details: any) => {
  logger.info('TRANSACTION', {
    type,
    amount,
    details,
    timestamp: new Date().toISOString(),
  });
};

export { logger };

