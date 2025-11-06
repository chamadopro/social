'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth';

export interface Orcamento {
  id: string;
  valor: number;
  descricao: string;
  prazo_execucao: number;
  condicoes_pagamento: string;
  status: string;
  data_criacao: string;
  data_expiracao?: string;
  observacoes?: string;
  contrapropostas: number;
  prestador: {
    id: string;
    nome: string;
    foto_perfil?: string;
    reputacao: number;
    total_avaliacoes: number;
    verificado: boolean;
    cidade: string;
    estado: string;
  };
  cliente: {
    id: string;
    nome: string;
    foto_perfil?: string;
  };
  post: {
    id: string;
    titulo: string;
    categoria: string;
  };
  negociacoes?: Array<{
    id: string;
    tipo: string;
    descricao: string;
    valor?: number;
    prazo?: number;
    data_criacao: string;
    autor: {
      id: string;
      nome: string;
      foto_perfil?: string;
    };
  }>;
}

export interface CreateOrcamentoData {
  post_id: string;
  prestador_id: string;
  cliente_id: string;
  valor: number;
  descricao: string;
  prazo_execucao: number;
  condicoes_pagamento: string;
  fotos?: string[];
  garantia?: string;
  desconto?: number;
  observacoes?: string;
  // Mock de taxa paga; em produção será substituído por integração real
  pagamento_mock?: boolean;
}

export interface CreateNegociacaoData {
  orcamento_id: string;
  tipo: 'PROPOSTA' | 'CONTRAPROPOSTA' | 'ACEITE' | 'REJEICAO' | 'PERGUNTA';
  valor?: number;
  prazo?: number;
  descricao: string;
}

class OrcamentoManager {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  async getOrcamentos(filters: any = {}): Promise<{ data: Orcamento[]; pagination: any }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/orcamentos?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar orçamentos: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrcamentoById(id: string): Promise<Orcamento> {
    const response = await fetch(`${this.baseUrl}/orcamentos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar orçamento: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async createOrcamento(data: CreateOrcamentoData, token: string): Promise<Orcamento> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar orçamento: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async updateOrcamento(id: string, data: Partial<CreateOrcamentoData>, token: string): Promise<Orcamento> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar orçamento: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async responderOrcamento(id: string, status: 'ACEITO' | 'REJEITADO', token: string, observacoes?: string): Promise<Orcamento> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/${id}/responder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, observacoes }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao responder orçamento: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async iniciarNegociacao(id: string, token: string): Promise<Orcamento> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/${id}/iniciar-negociacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao iniciar negociação: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async createNegociacao(data: CreateNegociacaoData, token: string): Promise<any> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/negociacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar negociação: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async finalizarNegociacao(id: string, status: 'ACEITO' | 'REJEITADO', token: string): Promise<Orcamento> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/${id}/finalizar-negociacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao finalizar negociação: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async deleteOrcamento(id: string, token: string): Promise<void> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/orcamentos/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao deletar orçamento: ${response.statusText}`);
    }
  }
}

const orcamentoManager = new OrcamentoManager();

export const useOrcamentos = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [currentOrcamento, setCurrentOrcamento] = useState<Orcamento | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Buscar orçamentos
  const fetchOrcamentos = useCallback(async (filters: any = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await orcamentoManager.getOrcamentos(filters);
      setOrcamentos(result.data);
      setPagination(result.pagination);
      return result;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao buscar orçamentos',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar orçamento por ID
  const fetchOrcamentoById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const orcamento = await orcamentoManager.getOrcamentoById(id);
      setCurrentOrcamento(orcamento);
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao buscar orçamento',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Criar orçamento
  const createOrcamento = useCallback(async (data: CreateOrcamentoData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const orcamento = await orcamentoManager.createOrcamento(data, token || '');
      setOrcamentos(prev => [orcamento, ...prev]);
      toast({
        title: 'Orçamento criado',
        description: 'Seu orçamento foi enviado com sucesso.',
      });
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao criar orçamento',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Atualizar orçamento
  const updateOrcamento = useCallback(async (id: string, data: Partial<CreateOrcamentoData>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const orcamento = await orcamentoManager.updateOrcamento(id, data, token || '');
      setOrcamentos(prev => prev.map(o => o.id === id ? orcamento : o));
      if (currentOrcamento?.id === id) {
        setCurrentOrcamento(orcamento);
      }
      toast({
        title: 'Orçamento atualizado',
        description: 'Seu orçamento foi atualizado com sucesso.',
      });
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao atualizar orçamento',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentOrcamento]);

  // Responder orçamento
  const responderOrcamento = useCallback(async (id: string, status: 'ACEITO' | 'REJEITADO', observacoes?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const orcamento = await orcamentoManager.responderOrcamento(id, status, token || '', observacoes);
      setOrcamentos(prev => prev.map(o => o.id === id ? orcamento : o));
      if (currentOrcamento?.id === id) {
        setCurrentOrcamento(orcamento);
      }
      toast({
        title: `Orçamento ${status.toLowerCase()}`,
        description: `O orçamento foi ${status.toLowerCase()} com sucesso.`,
      });
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao responder orçamento',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentOrcamento]);

  // Iniciar negociação
  const iniciarNegociacao = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const orcamento = await orcamentoManager.iniciarNegociacao(id, token || '');
      setOrcamentos(prev => prev.map(o => o.id === id ? orcamento : o));
      if (currentOrcamento?.id === id) {
        setCurrentOrcamento(orcamento);
      }
      toast({
        title: 'Negociação iniciada',
        description: 'A negociação foi iniciada com sucesso.',
      });
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao iniciar negociação',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentOrcamento]);

  // Criar negociação
  const createNegociacao = useCallback(async (data: CreateNegociacaoData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const negociacao = await orcamentoManager.createNegociacao(data, token || '');
      // Atualizar orçamento local
      await fetchOrcamentoById(data.orcamento_id);
      toast({
        title: 'Negociação enviada',
        description: 'Sua negociação foi enviada com sucesso.',
      });
      return negociacao;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao criar negociação',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, fetchOrcamentoById]);

  // Finalizar negociação
  const finalizarNegociacao = useCallback(async (id: string, status: 'ACEITO' | 'REJEITADO') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      const orcamento = await orcamentoManager.finalizarNegociacao(id, status, token || '');
      setOrcamentos(prev => prev.map(o => o.id === id ? orcamento : o));
      if (currentOrcamento?.id === id) {
        setCurrentOrcamento(orcamento);
      }
      toast({
        title: `Negociação ${status.toLowerCase()}`,
        description: `A negociação foi ${status.toLowerCase()} com sucesso.`,
      });
      return orcamento;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao finalizar negociação',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentOrcamento]);

  // Deletar orçamento
  const deleteOrcamento = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { token } = useAuthStore.getState();
      await orcamentoManager.deleteOrcamento(id, token || '');
      setOrcamentos(prev => prev.filter(o => o.id !== id));
      if (currentOrcamento?.id === id) {
        setCurrentOrcamento(null);
      }
      toast({
        title: 'Orçamento deletado',
        description: 'O orçamento foi deletado com sucesso.',
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao deletar orçamento',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast, currentOrcamento]);

  // Limpar estado
  const clearState = useCallback(() => {
    setOrcamentos([]);
    setCurrentOrcamento(null);
    setPagination(null);
    setError(null);
  }, []);

  return {
    // Estado
    isLoading,
    orcamentos,
    currentOrcamento,
    pagination,
    error,
    
    // Ações
    fetchOrcamentos,
    fetchOrcamentoById,
    createOrcamento,
    updateOrcamento,
    responderOrcamento,
    iniciarNegociacao,
    createNegociacao,
    finalizarNegociacao,
    deleteOrcamento,
    clearState
  };
};


