'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle, XCircle, Mail, Clock } from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Token de verificação não encontrado');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setIsVerifying(true);
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verificado com sucesso! Você já pode usar sua conta.');
        
        addToast({
          type: 'success',
          title: 'Email verificado!',
          description: 'Sua conta foi ativada com sucesso.',
          duration: 5000,
        });

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        if (data.message?.includes('expirado')) {
          setStatus('expired');
          setMessage('Token expirado. Solicite um novo email de verificação.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Erro ao verificar email');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendVerification = async () => {
    try {
      const email = searchParams.get('email');
      
      if (!email) {
        addToast({
          type: 'error',
          title: 'Erro',
          description: 'Email não encontrado. Faça login novamente.',
          duration: 5000,
        });
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast({
          type: 'success',
          title: 'Email reenviado!',
          description: 'Verifique sua caixa de entrada.',
          duration: 5000,
        });
      } else {
        addToast({
          type: 'error',
          title: 'Erro',
          description: data.message || 'Erro ao reenviar email',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Erro de conexão. Tente novamente.',
        duration: 5000,
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500 mx-auto" />;
      case 'expired':
        return <Clock className="h-16 w-16 text-orange-500 mx-auto" />;
      default:
        return <Mail className="h-16 w-16 text-blue-500 mx-auto animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'expired':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card className={`p-8 text-center ${getStatusColor()}`}>
            {getStatusIcon()}
            
            <h1 className="mt-6 text-2xl font-bold text-gray-900">
              {status === 'loading' && 'Verificando email...'}
              {status === 'success' && 'Email verificado!'}
              {status === 'error' && 'Erro na verificação'}
              {status === 'expired' && 'Token expirado'}
            </h1>
            
            <p className="mt-4 text-gray-600">
              {message}
            </p>

            {status === 'loading' && (
              <div className="mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Aguarde enquanto verificamos seu email...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Redirecionando para o login...
                </p>
                <Button
                  onClick={() => router.push('/login')}
                  className="mt-4"
                >
                  Ir para Login
                </Button>
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="mt-6 space-y-4">
                <Button
                  onClick={resendVerification}
                  variant="outline"
                  className="w-full"
                >
                  Reenviar Email de Verificação
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Ir para Login
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}


