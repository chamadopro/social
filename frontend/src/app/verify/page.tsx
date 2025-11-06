'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { Mail, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { updateUser } = useAuthStore();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const token = searchParams?.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    if (!token) return;

    setStatus('verifying');
    try {
      const response = await api.post('/auth/verify-email', { token });
      
      if (response.success) {
        setStatus('success');
        setMessage(response.message || 'Email verificado com sucesso!');
        
        // Atualizar status do usuário para verificado
        updateUser({ verificado: true });
        
        addToast({
          type: 'success',
          title: 'Email verificado!',
          description: 'Você pode acessar todas as funcionalidades da plataforma.',
        });
        
        // Redirecionar após 3 segundos
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.message || 'Erro ao verificar email');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Erro ao verificar email. Tente novamente.');
      addToast({
        type: 'error',
        title: 'Erro ao verificar',
        description: error.message || 'Não foi possível verificar seu email.',
      });
    }
  };

  const resendVerification = async () => {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-orange-primary rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Verificação de Email
          </h2>
        </div>

        {/* Card de Status */}
        <Card>
          <div className="text-center space-y-4">
            {status === 'verifying' && (
              <>
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center animate-spin">
                  <RefreshCw className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Verificando...</h3>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto verificamos seu email.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-600">Verificado com sucesso!</h3>
                <p className="text-sm text-gray-600">{message}</p>
                <p className="text-xs text-gray-500">
                  Redirecionando em 3 segundos...
                </p>
              </>
            )}

            {status === 'error' && !token && (
              <>
                <div className="mx-auto h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Email não verificado</h3>
                <p className="text-sm text-gray-600">
                  Verifique seu email e clique no link de verificação.
                </p>
                <p className="text-sm text-gray-600">
                  Não recebeu o email? Clique em "Reenviar" abaixo.
                </p>
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full"
                    variant="primary"
                  >
                    {isResending ? 'Enviando...' : 'Reenviar Email'}
                  </Button>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      Ir para página inicial
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && token && (
              <>
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-600">Erro na verificação</h3>
                <p className="text-sm text-gray-600">{message}</p>
                <p className="text-sm text-gray-600">
                  O link pode ter expirado. Solicite um novo link abaixo.
                </p>
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={resendVerification}
                    disabled={isResending}
                    className="w-full"
                    variant="primary"
                  >
                    {isResending ? 'Enviando...' : 'Reenviar Email de Verificação'}
                  </Button>
                  <Link href="/" className="block">
                    <Button variant="outline" className="w-full">
                      Ir para página inicial
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

