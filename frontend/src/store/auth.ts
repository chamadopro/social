import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Usuario } from '@/types';
import { authService } from '@/services/auth';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  temClienteAssociado?: boolean;
}

interface AuthActions {
  login: (email: string, senha: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Ações
      login: async (email: string, senha: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login(email, senha);
          
          if (response.success && response.data) {
            const user: any = response.data.user;
            set({
              user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              temClienteAssociado: !!user.temClienteAssociado,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || 'Erro no login',
            });
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Erro no login';
          
          // Verificar se é erro de verificação de email
          if (errorMessage.includes('Email não verificado') || errorMessage.includes('verificado')) {
            set({
              isLoading: false,
              error: 'Email não verificado. Verifique sua caixa de entrada e clique no link de verificação.',
            });
          } else {
            set({
              isLoading: false,
              error: errorMessage,
            });
          }
        }
      },

      register: async (data: any) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.register(data);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            const errorMessage = response.message || 'Erro no registro';
            set({
              isLoading: false,
              error: errorMessage,
            });
            throw new Error(errorMessage);
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro no registro',
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateUser: (data: Partial<Usuario>) => {
        const { user } = get();
        if (user) {
          set({
            user: { ...user, ...data },
          });
        }
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

      refreshProfile: async () => {
        set({ isLoading: true });
        
        try {
          const response = await authService.getProfile();
          
          if (response.success && response.data) {
            const user: any = response.data.user || response.data;
            set({
              user,
              isLoading: false,
              temClienteAssociado: !!user.temClienteAssociado,
            });
          } else {
            set({
              isLoading: false,
              error: response.message || 'Erro ao carregar perfil',
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Erro ao carregar perfil',
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        temClienteAssociado: state.temClienteAssociado,
      }),
    }
  )
);

