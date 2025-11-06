'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { ContratoCard } from '@/components/ContratoCard';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { FiltrosContratos } from '@/types';
import { Plus, Filter, Search, FileText, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ContratosPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [contratos, setContratos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<FiltrosContratos>({
    tipo: 'all',
    status: '',
  });

  useEffect(() => {
    fetchContratos();
  }, [filtros]);

  const fetchContratos = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params: any = {};
      if (filtros.status) params.status = filtros.status;
      if (filtros.tipo && filtros.tipo !== 'all') params.tipo = filtros.tipo; // backend deve interpretar tipo=cliente/prestador

      const resp = await api.get<any[]>('/contratos', params);
      const list = (resp as any).data?.contratos || (resp as any).data || [];
      setContratos(list);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar contratos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipoChange = (tipo: 'all' | 'cliente' | 'prestador') => {
    setFiltros(prev => ({ ...prev, tipo }));
  };

  const handleStatusChange = (status: string) => {
    setFiltros(prev => ({ ...prev, status }));
  };

  const getStatusCounts = () => {
    const counts = {
      ativos: 0,
      concluidos: 0,
      cancelados: 0,
      disputados: 0,
    };

    contratos.forEach(contrato => {
      switch (contrato.status) {
        case 'ATIVO':
          counts.ativos++;
          break;
        case 'CONCLUIDO':
          counts.concluidos++;
          break;
        case 'CANCELADO':
          counts.cancelados++;
          break;
        case 'DISPUTADO':
          counts.disputados++;
          break;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" text="Carregando contratos..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar contratos</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchContratos}>
            Tentar Novamente
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
            <p className="text-gray-600 mt-2">
              Gerencie seus contratos ativos e finalizados
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.ativos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.concluidos}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelados</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.cancelados}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disputados</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.disputados}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Tipo Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleTipoChange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtros.tipo === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => handleTipoChange('cliente')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtros.tipo === 'cliente'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Como Cliente
                </button>
                <button
                  onClick={() => handleTipoChange('prestador')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtros.tipo === 'prestador'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Como Prestador
                </button>
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtros.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os status</option>
                <option value="ATIVO">Ativo</option>
                <option value="CONCLUIDO">Concluído</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="DISPUTADO">Disputado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contratos List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {contratos.length > 0 ? `${contratos.length} contratos encontrados` : 'Nenhum contrato encontrado'}
            </h2>
          </div>

          {contratos.length > 0 ? (
            <div className="space-y-4">
              {contratos.map((contrato) => (
                <ContratoCard
                  key={contrato.id}
                  contrato={contrato}
                  isCliente={user?.tipo === 'CLIENTE'}
                  isPrestador={user?.tipo === 'PRESTADOR'}
                  onVerDetalhes={(id) => {
                    router.push(`/contratos/${id}`);
                  }}
                  onFinalizar={(id) => {
                    // TODO: Implementar finalizar contrato
                  }}
                  onCancelar={(id) => {
                    // TODO: Implementar cancelar contrato
                  }}
                  onAbrirDisputa={(id) => {
                    // TODO: Implementar abrir disputa
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FileText className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum contrato encontrado
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não possui contratos ativos
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

