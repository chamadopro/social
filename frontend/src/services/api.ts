import { ApiResponse, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  /**
   * Configura o token de autenticação e armazena no localStorage
   */
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  /**
   * Retorna os headers padrão da requisição, incluindo autenticação se disponível
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Executa uma requisição HTTP genérica para a API
   * @param endpoint - Endpoint da API (ex: '/users')
   * @param options - Opções da requisição (method, body, etc)
   * @returns Resposta da API tipada
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const isDev = process.env.NODE_ENV === 'development';
    const shouldLog = isDev && typeof window !== 'undefined' && 
                     (window as any).__API_DEBUG__ === true;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      const data = await response.json();

      if (!response.ok) {
        console.error('API Error Response:', data);
        const errorMessage = data.message || data.error || data.errors?.[0]?.message || 'Erro na requisição';
        const error = new Error(errorMessage);
        (error as any).response = { data };
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        const isLocalhost = this.baseURL.includes('localhost');
        const isNetworkError = !navigator.onLine;
        
        if (isNetworkError) {
          throw new Error('Sem conexão com a internet. Verifique sua conexão.');
        } else if (isLocalhost) {
          throw new Error(
            'Não foi possível conectar ao servidor. ' +
            'Verifique se o backend está rodando e se você configurou o arquivo .env.local com o IP correto do computador.'
          );
        } else {
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Executa uma requisição GET
   * @param endpoint - Endpoint da API
   * @param params - Parâmetros de query string
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(endpoint + (url.search || ''));
  }

  /**
   * Executa uma requisição POST
   * @param endpoint - Endpoint da API
   * @param data - Dados a serem enviados no body
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Executa uma requisição PUT
   * @param endpoint - Endpoint da API
   * @param data - Dados a serem enviados no body
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Executa uma requisição PATCH
   * @param endpoint - Endpoint da API
   * @param data - Dados a serem enviados no body
   */
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Executa uma requisição DELETE
   * @param endpoint - Endpoint da API
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Faz upload de um arquivo para a API
   * @param endpoint - Endpoint da API para upload
   * @param file - Arquivo a ser enviado
   * @param additionalData - Dados adicionais a serem enviados junto com o arquivo
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method: 'POST',
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no upload');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  }

  /**
   * Executa uma requisição GET com paginação
   * @param endpoint - Endpoint da API
   * @param params - Parâmetros de query string (incluindo page, limit, etc)
   */
  async getPaginated<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.get<{ [key: string]: T[]; pagination: any }>(endpoint, params);
    return response as PaginatedResponse<T>;
  }
}

export const api = new ApiService(API_BASE_URL);
export default api;

