import { api } from './api';
import { Usuario, LoginForm, RegisterForm, ApiResponse } from '@/types';

export class AuthService {
  // Login
  async login(email: string, senha: string): Promise<ApiResponse<{ user: Usuario; token: string; refreshToken: string }>> {
    const response = await api.post<{ user: Usuario; token: string; refreshToken: string }>('/auth/login', {
      email,
      senha,
    });

    if (response.success && response.data) {
      api.setToken(response.data.token);
    }

    return response;
  }

  // Registro
  async register(data: RegisterForm): Promise<ApiResponse<{ user: Usuario; token: string; refreshToken: string }>> {
    const response = await api.post<{ user: Usuario; token: string; refreshToken: string }>('/auth/register', data);

    if (response.success && response.data) {
      api.setToken(response.data.token);
    }

    return response;
  }

  // Logout
  async logout(): Promise<ApiResponse> {
    const response = await api.post('/auth/logout');
    api.setToken(null);
    return response;
  }

  // Renovar token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    const response = await api.post<{ token: string }>('/auth/refresh', { refreshToken });
    
    if (response.success && response.data) {
      api.setToken(response.data.token);
    }

    return response;
  }

  // Obter perfil do usuário
  async getProfile(): Promise<ApiResponse<{ user: Usuario }>> {
    return api.get<{ user: Usuario }>('/auth/me');
  }

  // Esqueci minha senha
  async forgotPassword(email: string): Promise<ApiResponse> {
    return api.post('/auth/forgot-password', { email });
  }

  // Redefinir senha
  async resetPassword(token: string, senha: string): Promise<ApiResponse> {
    return api.post('/auth/reset-password', { token, senha });
  }

  // Verificar email
  async verifyEmail(token: string): Promise<ApiResponse> {
    return api.post('/auth/verify-email', { token });
  }

  // Reenviar verificação
  async resendVerification(): Promise<ApiResponse> {
    return api.post('/auth/resend-verification');
  }
}

export const authService = new AuthService();

