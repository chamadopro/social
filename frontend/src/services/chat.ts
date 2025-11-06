import { api } from './api';
import { Mensagem } from '@/types';

export class ChatService {
  // Enviar mensagem
  async sendMessage(contratoId: string, conteudo: string): Promise<{ success: boolean; data: { mensagem: Mensagem } }> {
    return api.post<{ mensagem: Mensagem }>(`/chat/messages`, {
      contrato_id: contratoId,
      conteudo,
    });
  }

  // Obter mensagens de um contrato
  async getMessages(contratoId: string, page: number = 1, limit: number = 50): Promise<{ success: boolean; data: { mensagens: Mensagem[] } }> {
    return api.get<{ mensagens: Mensagem[] }>(`/chat/messages`, {
      contrato_id: contratoId,
      page,
      limit,
    });
  }

  // Marcar mensagens como lidas
  async markAsRead(contratoId: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/chat/mark-read`, {
      contrato_id: contratoId,
    });
  }

  // Obter estatísticas do chat
  async getChatStats(contratoId: string): Promise<{ success: boolean; data: { totalMessages: number; unreadCount: number } }> {
    return api.get<{ totalMessages: number; unreadCount: number }>(`/chat/stats`, {
      contrato_id: contratoId,
    });
  }
}

export const chatService = new ChatService();

