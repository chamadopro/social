import { io, Socket } from 'socket.io-client';
import { logger } from './logger';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export interface SocketConfig {
  token?: string;
  userId?: string;
  autoConnect?: boolean;
  transports?: ('websocket' | 'polling')[];
}

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private config: SocketConfig | null = null;

  /**
   * Conecta ao servidor Socket.IO
   */
  connect(config: SocketConfig): Socket {
    // Se já está conectado, retornar a instância existente
    if (this.socket?.connected) {
      return this.socket;
    }

    // Se já existe uma instância, desconectar antes
    if (this.socket) {
      this.disconnect();
    }

    this.config = config;
    this.reconnectAttempts = 0;

    // Configurar Socket.IO com opções para mobile
    this.socket = io(SOCKET_URL, {
      auth: config.token ? { token: config.token } : undefined,
      query: config.userId ? { userId: config.userId } : undefined,
      transports: config.transports || ['websocket', 'polling'], // Fallback para polling em mobile
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false,
    });

    // Eventos de conexão
    this.socket.on('connect', () => {
      logger.info('Socket.IO conectado:', this.socket?.id);
      this.reconnectAttempts = 0;
      
      // Registrar userId no servidor se fornecido
      if (config.userId) {
        this.socket?.emit('register_user', { userId: config.userId });
      }
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('Socket.IO desconectado:', reason);
      
      // Tentar reconectar se não foi desconexão manual
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Erro de conexão Socket.IO:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error('Máximo de tentativas de reconexão atingido');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.info(`Socket.IO reconectado após ${attemptNumber} tentativas`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      logger.info(`Tentativa de reconexão ${attemptNumber}/${this.maxReconnectAttempts}`);
    });

    this.socket.on('reconnect_failed', () => {
      logger.error('Falha ao reconectar Socket.IO');
    });

    return this.socket;
  }

  /**
   * Desconecta do servidor Socket.IO
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.config = null;
      logger.info('Socket.IO desconectado');
    }
  }

  /**
   * Retorna a instância do Socket.IO
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verifica se está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Reconnecta manualmente
   */
  reconnect(): void {
    if (this.config) {
      this.disconnect();
      this.connect(this.config);
    }
  }

  /**
   * Emite um evento
   */
  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      logger.warn(`Tentativa de emitir evento '${event}' sem conexão`);
    }
  }

  /**
   * Escuta um evento
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove listener de um evento
   */
  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

// Instância singleton
export const socketManager = new SocketManager();

// Helper para obter URL da API
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

// Helper para obter URL do Socket.IO
export const getSocketUrl = (): string => {
  return process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
};

