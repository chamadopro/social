'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { api } from '@/services/api';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  estatisticas: {
    totalUsuarios: number;
    totalPosts: number;
    totalOrcamentos: number;
    totalContratos: number;
    totalPagamentos: number;
    usuariosAtivos: number;
    postsAtivos: number;
  };
  receitas: {
    total: number;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let hasLoaded = false;
    
    const loadData = async () => {
      if (isMounted && !hasLoaded) {
        hasLoaded = true;
        await fetchDashboardData();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!stats) {
        setLoading(true);
      }
      setError(null);
      const response = await api.get('/admin/dashboard');
      
      if (response.success && response.data) {
        const data = response.data as DashboardStats;
        if (data.estatisticas && data.receitas) {
          setStats(data);
          setLoading(false);
        } else {
          setError('Dados do dashboard em formato inválido');
          setLoading(false);
        }
      } else {
        setError('Erro ao carregar dados do dashboard');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do dashboard');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      title: 'Total de Usuários',
      value: stats.estatisticas.totalUsuarios,
      icon: Users,
      color: 'blue',
      subtitle: `${stats.estatisticas.usuariosAtivos} ativos`
    },
    {
      title: 'Posts',
      value: stats.estatisticas.totalPosts,
      icon: FileText,
      color: 'green',
      subtitle: `${stats.estatisticas.postsAtivos} ativos`
    },
    {
      title: 'Orçamentos',
      value: stats.estatisticas.totalOrcamentos,
      icon: TrendingUp,
      color: 'purple',
      subtitle: 'Total de propostas'
    },
    {
      title: 'Contratos',
      value: stats.estatisticas.totalContratos,
      icon: CheckCircle,
      color: 'indigo',
      subtitle: 'Contratos realizados'
    },
    {
      title: 'Pagamentos',
      value: stats.estatisticas.totalPagamentos,
      icon: DollarSign,
      color: 'yellow',
      subtitle: 'Total de transações'
    },
    {
      title: 'Receitas',
      value: `R$ ${stats.receitas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'green',
      subtitle: 'Receita total'
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorClass = colorClasses[stat.color as keyof typeof colorClasses];
          
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/usuarios"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <Users className="h-5 w-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Gerenciar Usuários</p>
            <p className="text-sm text-gray-600 mt-1">Ver e editar usuários</p>
          </Link>
          <Link
            href="/admin/posts"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <FileText className="h-5 w-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Moderar Posts</p>
            <p className="text-sm text-gray-600 mt-1">Revisar e moderar conteúdo</p>
          </Link>
          <Link
            href="/admin/disputas"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <AlertCircle className="h-5 w-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Resolver Disputas</p>
            <p className="text-sm text-gray-600 mt-1">Analisar e resolver conflitos</p>
          </Link>
          <Link
            href="/admin/relatorios"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <TrendingUp className="h-5 w-5 text-gray-600 mb-2" />
            <p className="font-medium text-gray-900">Relatórios</p>
            <p className="text-sm text-gray-600 mt-1">Análises e gráficos</p>
          </Link>
        </div>
      </Card>
    </div>
  );
}

