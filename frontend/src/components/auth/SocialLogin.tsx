'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface SocialLoginProps {
  onSuccess?: (provider: string, data: any) => void;
  onError?: (error: string) => void;
}

export const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, onError }) => {
  const { addToast } = useToast();

  const handleGoogleLogin = async () => {
    try {
      // Simular login com Google
      addToast({
        type: 'info',
        title: 'Login com Google',
        description: 'Redirecionando para o Google...',
        duration: 3000
      });

      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
      window.location.href = `${base}/api/auth/google`;
    } catch (error) {
      const errorMessage = 'Erro ao fazer login com Google';
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: errorMessage,
        duration: 5000
      });
      onError?.(errorMessage);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      addToast({
        type: 'info',
        title: 'Login com Facebook',
        description: 'Redirecionando para o Facebook...',
        duration: 3000
      });

      // Simular login com Facebook
      setTimeout(() => {
        const mockUser = {
          id: 'facebook-user-001',
          email: 'usuario@facebook.com',
          nome: 'Usuário Facebook',
          provider: 'facebook'
        };
        
        onSuccess?.('facebook', mockUser);
        addToast({
          type: 'success',
          title: 'Login realizado!',
          description: 'Bem-vindo ao ChamadoPro!',
          duration: 5000
        });
      }, 2000);

    } catch (error) {
      const errorMessage = 'Erro ao fazer login com Facebook';
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: errorMessage,
        duration: 5000
      });
      onError?.(errorMessage);
    }
  };

  const handleInstagramLogin = async () => {
    try {
      addToast({
        type: 'info',
        title: 'Login com Instagram',
        description: 'Redirecionando para o Instagram...',
        duration: 3000
      });

      // Iniciar fluxo OAuth via backend
      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '');
      window.location.href = `${base}/api/auth/instagram`;
    } catch (error) {
      const errorMessage = 'Erro ao fazer login com Instagram';
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: errorMessage,
        duration: 5000
      });
      onError?.(errorMessage);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Google Login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>

        {/* Facebook Login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleFacebookLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </Button>

        {/* Instagram Login */}
        <Button
          type="button"
          variant="outline"
          onClick={handleInstagramLogin}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
            <defs>
              <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f09433" />
                <stop offset="25%" stopColor="#e6683c" />
                <stop offset="50%" stopColor="#dc2743" />
                <stop offset="75%" stopColor="#cc2366" />
                <stop offset="100%" stopColor="#bc1888" />
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Instagram
        </Button>
      </div>
    </div>
  );
};

