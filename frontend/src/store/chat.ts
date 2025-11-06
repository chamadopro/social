import { create } from 'zustand';
import { Mensagem } from '@/types';
import { chatService } from '@/services/chat';

interface ChatState {
  mensagens: Mensagem[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  currentContratoId: string | null;
}

interface ChatActions {
  connect: (contratoId: string) => void;
  disconnect: () => void;
  sendMessage: (conteudo: string) => Promise<void>;
  fetchMessages: (contratoId: string) => Promise<void>;
  addMessage: (mensagem: Mensagem) => void;
  updateMessage: (id: string, updates: Partial<Mensagem>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearMessages: () => void;
  setConnected: (connected: boolean) => void;
}

type ChatStore = ChatState & ChatActions;

export const useChatStore = create<ChatStore>((set, get) => ({
  // Estado inicial
  mensagens: [],
  isLoading: false,
  error: null,
  isConnected: false,
  currentContratoId: null,

  // Ações
  connect: (contratoId: string) => {
    set({ currentContratoId: contratoId, isConnected: true });
    // TODO: Implementar conexão com Socket.IO
  },

  disconnect: () => {
    set({ 
      currentContratoId: null, 
      isConnected: false,
      mensagens: []
    });
    // TODO: Implementar desconexão do Socket.IO
  },

  sendMessage: async (conteudo: string) => {
    const { currentContratoId } = get();
    
    if (!currentContratoId) {
      set({ error: 'Nenhum contrato selecionado' });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.sendMessage(currentContratoId, conteudo);
      
      if (response.success && response.data) {
        const { mensagens } = get();
        set({
          mensagens: [...mensagens, response.data.mensagem],
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao enviar mensagem',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao enviar mensagem',
      });
    }
  },

  fetchMessages: async (contratoId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await chatService.getMessages(contratoId);
      
      if (response.success && response.data) {
        set({
          mensagens: response.data.mensagens || [],
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao carregar mensagens',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao carregar mensagens',
      });
    }
  },

  addMessage: (mensagem: Mensagem) => {
    const { mensagens } = get();
    set({ mensagens: [...mensagens, mensagem] });
  },

  updateMessage: (id: string, updates: Partial<Mensagem>) => {
    const { mensagens } = get();
    const updatedMensagens = mensagens.map(mensagem =>
      mensagem.id === id ? { ...mensagem, ...updates } : mensagem
    );
    set({ mensagens: updatedMensagens });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  clearMessages: () => {
    set({ mensagens: [] });
  },

  setConnected: (connected: boolean) => {
    set({ isConnected: connected });
  },
}));

