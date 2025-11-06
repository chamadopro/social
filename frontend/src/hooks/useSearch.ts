'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth';

export interface SearchFilters {
  query: string;
  categoria: string;
  subcategoria: string;
  estado: string;
  cidade: string;
  cep: string;
  raio: number;
  precoMin: number;
  precoMax: number;
  tipoUsuario: string;
  verificado: boolean | null;
  reputacaoMin: number;
  reputacaoMax: number;
  totalAvaliacoesMin: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  urgente: boolean | null;
  disponivel: boolean | null;
  orderBy: string;
  orderDirection: string;
}

export interface SearchResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SearchFilters;
  aggregations?: {
    categorias: { [key: string]: number };
    estados: { [key: string]: number };
    faixasPreco: { [key: string]: number };
  };
}

export interface GlobalSearchResult {
  posts: any[];
  users: any[];
  services: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

class SearchManager {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  async searchPosts(filters: SearchFilters, page = 1, limit = 20): Promise<SearchResult<any>> {
    const params = new URLSearchParams();
    
    // Adicionar todos os filtros não vazios
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          params.append(key, value.toString());
        } else if (typeof value === 'number' && value > 0) {
          params.append(key, value.toString());
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.append(key, value);
        }
      }
    });

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search/posts?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    return response.json();
  }

  async searchUsers(filters: SearchFilters, page = 1, limit = 20): Promise<SearchResult<any>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          params.append(key, value.toString());
        } else if (typeof value === 'number' && value > 0) {
          params.append(key, value.toString());
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.append(key, value);
        }
      }
    });

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search/users?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    return response.json();
  }

  async searchServices(filters: SearchFilters, page = 1, limit = 20): Promise<SearchResult<any>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          params.append(key, value.toString());
        } else if (typeof value === 'number' && value > 0) {
          params.append(key, value.toString());
        } else if (typeof value === 'string' && value.trim() !== '') {
          params.append(key, value);
        }
      }
    });

    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search/services?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.statusText}`);
    }

    return response.json();
  }

  async globalSearch(query: string, page = 1, limit = 20): Promise<GlobalSearchResult> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/search/global?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na busca global: ${response.statusText}`);
    }

    return response.json();
  }

  async getSuggestions(query: string, type: 'posts' | 'users' | 'services' = 'posts'): Promise<string[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('type', type);

    const response = await fetch(`${this.baseUrl}/search/suggestions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter sugestões: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.suggestions;
  }

  async getAvailableFilters(): Promise<{
    categorias: { value: string; count: number }[];
    estados: { value: string; count: number }[];
    cidades: { value: string; count: number }[];
  }> {
    const response = await fetch(`${this.baseUrl}/search/filters`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter filtros: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  }

  async saveSearch(query: string, filters: SearchFilters, resultsCount: number, token: string): Promise<void> {
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    const response = await fetch(`${this.baseUrl}/search/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        query,
        filters,
        resultsCount
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro ao salvar busca: ${response.statusText}`);
    }
  }
}

const searchManager = new SearchManager();

export const useSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult<any> | null>(null);
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [availableFilters, setAvailableFilters] = useState<{
    categorias: { value: string; count: number }[];
    estados: { value: string; count: number }[];
    cidades: { value: string; count: number }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar filtros disponíveis
  const loadAvailableFilters = useCallback(async () => {
    try {
      const filters = await searchManager.getAvailableFilters();
      setAvailableFilters(filters);
    } catch (error: any) {
      console.error('Erro ao carregar filtros disponíveis:', error);
    }
  }, []);

  // Buscar posts
  const searchPosts = useCallback(async (filters: SearchFilters, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchManager.searchPosts(filters, page, limit);
      setResults(result);
      return result;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro na Busca',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar usuários
  const searchUsers = useCallback(async (filters: SearchFilters, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchManager.searchUsers(filters, page, limit);
      setResults(result);
      return result;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro na Busca',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Buscar serviços
  const searchServices = useCallback(async (filters: SearchFilters, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchManager.searchServices(filters, page, limit);
      setResults(result);
      return result;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro na Busca',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Busca global
  const globalSearch = useCallback(async (query: string, page = 1, limit = 20) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await searchManager.globalSearch(query, page, limit);
      setGlobalResults(result);
      return result;
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro na Busca Global',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Obter sugestões
  const getSuggestions = useCallback(async (query: string, type: 'posts' | 'users' | 'services' = 'posts') => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const suggestions = await searchManager.getSuggestions(query, type);
      setSuggestions(suggestions);
    } catch (error: any) {
      console.error('Erro ao obter sugestões:', error);
    }
  }, []);

  // Salvar busca
  const saveSearch = useCallback(async (query: string, filters: SearchFilters, resultsCount: number) => {
    try {
      const { token } = useAuthStore.getState();
      await searchManager.saveSearch(query, filters, resultsCount, token || '');
    } catch (error: any) {
      console.error('Erro ao salvar busca:', error);
    }
  }, []);

  // Limpar resultados
  const clearResults = useCallback(() => {
    setResults(null);
    setGlobalResults(null);
    setError(null);
  }, []);

  // Carregar filtros disponíveis na inicialização
  useEffect(() => {
    loadAvailableFilters();
  }, [loadAvailableFilters]);

  return {
    // Estado
    isLoading,
    results,
    globalResults,
    suggestions,
    availableFilters,
    error,
    
    // Ações
    searchPosts,
    searchUsers,
    searchServices,
    globalSearch,
    getSuggestions,
    saveSearch,
    clearResults,
    loadAvailableFilters
  };
};


