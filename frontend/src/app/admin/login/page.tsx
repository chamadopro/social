'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated, user } = useAuthStore();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Se já estiver autenticado como admin, redirecionar para dashboard
  useEffect(() => {
    if (isAuthenticated && user && user.tipo === 'ADMIN') {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || isLoading) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(formData.email, formData.senha);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { isAuthenticated: authStatus, user, error: authError } = useAuthStore.getState();
      
      if (authStatus && user && !authError) {
        // Verificar se é admin
        if (user.tipo !== 'ADMIN') {
          addToast({
            type: 'error',
            title: 'Acesso negado',
            description: 'Apenas administradores podem acessar esta área.',
          });
          setIsSubmitting(false);
          return;
        }

        addToast({
          type: 'success',
          title: 'Login realizado com sucesso!',
          description: 'Bem-vindo ao painel administrativo',
        });
        window.location.href = '/admin/dashboard';
      } else if (authError) {
        addToast({
          type: 'error',
          title: 'Erro no login',
          description: authError || 'Credenciais inválidas',
        });
        setIsSubmitting(false);
      } else {
        addToast({
          type: 'error',
          title: 'Erro no login',
          description: 'Ocorreu um erro ao atualizar sua sessão. Tente novamente.',
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: error.message || 'Credenciais inválidas',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8 shadow-xl">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600 text-sm">
              Acesso restrito para administradores
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) {
                      setErrors({ ...errors, email: '' });
                    }
                  }}
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={(e) => {
                    setFormData({ ...formData, senha: e.target.value });
                    if (errors.senha) {
                      setErrors({ ...errors, senha: '' });
                    }
                  }}
                  className={`pl-10 pr-10 ${errors.senha ? 'border-red-500' : ''}`}
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting || isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
              )}
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Entrar como Administrador
                </span>
              )}
            </Button>
          </form>

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Voltar para o site
            </a>
          </div>
        </Card>

        {/* Aviso de segurança */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <Shield className="h-3 w-3 mr-1" />
            Área restrita - Apenas administradores autorizados
          </p>
        </div>
      </div>
    </div>
  );
}

