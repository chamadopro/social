import { api } from './api';
import { Orcamento, OrcamentoForm, FiltrosOrcamentos, PaginatedResponse } from '@/types';

export class OrcamentosService {
  // Obter todos os orçamentos
  async getOrcamentos(filtros?: FiltrosOrcamentos): Promise<PaginatedResponse<Orcamento>> {
    return api.getPaginated<Orcamento>('/orcamentos', filtros);
  }

  // Obter orçamento por ID
  async getOrcamentoById(id: string): Promise<{ success: boolean; data: { orcamento: Orcamento } }> {
    return api.get<{ orcamento: Orcamento }>(`/orcamentos/${id}`);
  }

  // Criar orçamento
  async createOrcamento(data: OrcamentoForm): Promise<{ success: boolean; data: { orcamento: Orcamento } }> {
    return api.post<{ orcamento: Orcamento }>('/orcamentos', data);
  }

  // Atualizar orçamento
  async updateOrcamento(id: string, data: Partial<OrcamentoForm>): Promise<{ success: boolean; data: { orcamento: Orcamento } }> {
    return api.put<{ orcamento: Orcamento }>(`/orcamentos/${id}`, data);
  }

  // Deletar orçamento
  async deleteOrcamento(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/orcamentos/${id}`);
  }

  // Aceitar orçamento
  async aceitarOrcamento(id: string): Promise<{ success: boolean; message: string; data: any }> {
    return api.post(`/orcamentos/${id}/aceitar`);
  }

  // Recusar orçamento
  async recusarOrcamento(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/orcamentos/${id}/recusar`);
  }

  // Cancelar orçamento
  async cancelarOrcamento(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/orcamentos/${id}/cancelar`);
  }

  // Contraproposta de orçamento
  async contrapropostaOrcamento(id: string, data: { valor: number; descricao?: string; prazo_execucao?: number; condicoes_pagamento?: string }): Promise<{ success: boolean; message: string; data: { orcamento: Orcamento } }> {
    return api.post<{ orcamento: Orcamento }>(`/orcamentos/${id}/contraproposta`, data);
  }

  // Aceitar contraproposta
  async aceitarContraproposta(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/orcamentos/${id}/aceitar-contraproposta`);
  }
}

export const orcamentosService = new OrcamentosService();

