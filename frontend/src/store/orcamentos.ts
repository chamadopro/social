import { create } from 'zustand';
import { Orcamento, FiltrosOrcamentos } from '@/types';
import { orcamentosService } from '@/services/orcamentos';

interface OrcamentosState {
  orcamentos: Orcamento[];
  currentOrcamento: Orcamento | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filtros: FiltrosOrcamentos;
}

interface OrcamentosActions {
  fetchOrcamentos: (filtros?: FiltrosOrcamentos) => Promise<void>;
  fetchOrcamentoById: (id: string) => Promise<void>;
  createOrcamento: (data: any) => Promise<void>;
  updateOrcamento: (id: string, data: any) => Promise<void>;
  deleteOrcamento: (id: string) => Promise<void>;
  aceitarOrcamento: (id: string) => Promise<void>;
  recusarOrcamento: (id: string) => Promise<void>;
  cancelarOrcamento: (id: string) => Promise<void>;
  contrapropostaOrcamento: (id: string, data: any) => Promise<void>;
  aceitarContraproposta: (id: string) => Promise<void>;
  setFiltros: (filtros: FiltrosOrcamentos) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearOrcamentos: () => void;
}

type OrcamentosStore = OrcamentosState & OrcamentosActions;

export const useOrcamentosStore = create<OrcamentosStore>((set, get) => ({
  // Estado inicial
  orcamentos: [],
  currentOrcamento: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filtros: {},

  // Ações
  fetchOrcamentos: async (filtros?: FiltrosOrcamentos) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orcamentosService.getOrcamentos(filtros);
      
      if (response.success && response.data) {
        set({
          orcamentos: response.data.orcamentos || [],
          pagination: response.data.pagination,
          filtros: filtros || {},
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao carregar orçamentos',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao carregar orçamentos',
      });
    }
  },

  fetchOrcamentoById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orcamentosService.getOrcamentoById(id);
      
      if (response.success && response.data) {
        set({
          currentOrcamento: response.data.orcamento,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao carregar orçamento',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao carregar orçamento',
      });
    }
  },

  createOrcamento: async (data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orcamentosService.createOrcamento(data);
      
      if (response.success && response.data) {
        const { orcamentos } = get();
        set({
          orcamentos: [response.data.orcamento, ...orcamentos],
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao criar orçamento',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao criar orçamento',
      });
    }
  },

  updateOrcamento: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orcamentosService.updateOrcamento(id, data);
      
      if (response.success && response.data) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? response.data.orcamento : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? response.data.orcamento : currentOrcamento,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao atualizar orçamento',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao atualizar orçamento',
      });
    }
  },

  deleteOrcamento: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await orcamentosService.deleteOrcamento(id);
      
      if (response.success) {
        const { orcamentos } = get();
        const filteredOrcamentos = orcamentos.filter(orcamento => orcamento.id !== id);
        
        set({
          orcamentos: filteredOrcamentos,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao deletar orçamento',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao deletar orçamento',
      });
    }
  },

  aceitarOrcamento: async (id: string) => {
    try {
      const response = await orcamentosService.aceitarOrcamento(id);
      
      if (response.success) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? { ...orcamento, status: 'ACEITO' } : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? { ...currentOrcamento, status: 'ACEITO' } : currentOrcamento,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao aceitar orçamento' });
    }
  },

  recusarOrcamento: async (id: string) => {
    try {
      const response = await orcamentosService.recusarOrcamento(id);
      
      if (response.success) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? { ...orcamento, status: 'RECUSADO' } : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? { ...currentOrcamento, status: 'RECUSADO' } : currentOrcamento,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao recusar orçamento' });
    }
  },

  cancelarOrcamento: async (id: string) => {
    try {
      const response = await orcamentosService.cancelarOrcamento(id);
      
      if (response.success) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? { ...orcamento, status: 'CANCELADO' } : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? { ...currentOrcamento, status: 'CANCELADO' } : currentOrcamento,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao cancelar orçamento' });
    }
  },

  contrapropostaOrcamento: async (id: string, data: any) => {
    try {
      const response = await orcamentosService.contrapropostaOrcamento(id, data);
      
      if (response.success && response.data) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? response.data.orcamento : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? response.data.orcamento : currentOrcamento,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao enviar contraproposta' });
    }
  },

  aceitarContraproposta: async (id: string) => {
    try {
      const response = await orcamentosService.aceitarContraproposta(id);
      
      if (response.success) {
        const { orcamentos, currentOrcamento } = get();
        const updatedOrcamentos = orcamentos.map(orcamento => 
          orcamento.id === id ? { ...orcamento, status: 'ACEITO' } : orcamento
        );
        
        set({
          orcamentos: updatedOrcamentos,
          currentOrcamento: currentOrcamento?.id === id ? { ...currentOrcamento, status: 'ACEITO' } : currentOrcamento,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao aceitar contraproposta' });
    }
  },

  setFiltros: (filtros: FiltrosOrcamentos) => {
    set({ filtros });
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

  clearOrcamentos: () => {
    set({ orcamentos: [], currentOrcamento: null });
  },
}));

