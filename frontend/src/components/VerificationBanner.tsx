'use client';

import React, { useState } from 'react';
import { AlertCircle, X, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

export const VerificationBanner: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);

  // Só mostra se o usuário estiver logado mas não verificado
  if (!user || user.verificado) {
    return null;
  }

  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await api.post('/auth/resend-verification');
      
      if (response.success) {
        addToast({
          type: 'success',
          title: 'Email reenviado!',
          description: 'Verifique sua caixa de entrada.',
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro ao reenviar',
          description: response.message || 'Não foi possível reenviar o email.',
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao reenviar',
        description: error.message || 'Não foi possível reenviar o email.',
      });
    } finally {
      setIsResending(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3 flex-1">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">
                Verifique seu email para acessar todas as funcionalidades
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Um email foi enviado para <strong>{user.email}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={isResending}
              className="hidden sm:flex"
            >
              <Mail className="h-4 w-4 mr-2" />
              {isResending ? 'Enviando...' : 'Reenviar'}
            </Button>
            <Link href="/verify">
              <Button size="sm" variant="primary" className="hidden sm:flex">
                Verificar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-2 text-yellow-600 hover:text-yellow-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

