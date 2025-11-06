'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { 
  DollarSign, 
  Search, 
  CheckCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Pagamento {
  id: string;
  valor: number;
  status: string;
  data_criacao: string;
  data_pagamento?: string;
  contrato: {
    id: string;
    cliente: {
      id: string;
      nome: string;
      email: string;
    };
    prestador: {
      id: string;
      nome: string;
      email: string;
    };
  };
}

export default function AdminFinanceiroPage() {
  const { addToast } = useToast();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPagamentos();
  }, [pagination.page, filters]);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await api.get('/admin/pagamentos', params);

      if (response.success && response.data) {
        let pagamentosData = response.data;
        
        if (response.pagination) {
          setPagination({
            ...pagination,
            total: response.pagination.total,
            pages: response.pagination.pages
          });
        } else if (pagamentosData.pagination) {
          setPagination({
            ...pagination,
            total: pagamentosData.pagination.total,
            pages: pagamentosData.pagination.pages
          });
        }

        if (Array.isArray(pagamentosData)) {
          setPagamentos(pagamentosData);
        } else if (pagamentosData.data && Array.isArray(pagamentosData.data)) {
          setPagamentos(pagamentosData.data);
        }
      } else {
        setError('Erro ao carregar pagamentos');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  const handleLiberarPagamento = async (pagamentoId: string) => {
    if (!confirm('Tem certeza que deseja liberar este pagamento?')) {
      return;
    }

    try {
      const response = await api.put(`/admin/pagamentos/${pagamentoId}/liberar`, {});

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: response.message || 'Pagamento liberado com sucesso'
        });
        fetchPagamentos();
      } else {
        addToast({
          type: 'error',
          title: 'Erro',
          description: response.message || 'Erro ao liberar pagamento'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: err.message || 'Erro ao liberar pagamento'
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800';
      case 'AGUARDANDO_LIBERACAO':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDENTE':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalAguardando = pagamentos
    .filter(p => p.status === 'AGUARDANDO_LIBERACAO')
    .reduce((sum, p) => sum + p.valor, 0);

  const totalPago = pagamentos
    .filter(p => p.status === 'PAGO')
    .reduce((sum, p) => sum + p.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
        <p className="text-gray-600 mt-1">Gerencie pagamentos e liberações</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pago</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aguardando Liberação</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                R$ {totalAguardando.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Transações</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {pagination.total}
              </p>
            </div>
            <DollarSign className="h-12 w-12 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="PAGO">Pagos</option>
              <option value="AGUARDANDO_LIBERACAO">Aguardando Liberação</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="CANCELADO">Cancelados</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Pagamentos */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="p-6">
          <p className="text-red-600">{error}</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prestador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pagamentos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhum pagamento encontrado
                      </td>
                    </tr>
                  ) : (
                    pagamentos.map((pagamento) => (
                      <tr key={pagamento.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            R$ {pagamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{pagamento.contrato.cliente.nome}</div>
                            <div className="text-sm text-gray-500">{pagamento.contrato.cliente.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{pagamento.contrato.prestador.nome}</div>
                            <div className="text-sm text-gray-500">{pagamento.contrato.prestador.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(pagamento.status)}`}>
                            {pagamento.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pagamento.data_pagamento 
                            ? new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')
                            : new Date(pagamento.data_criacao).toLocaleDateString('pt-BR')
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {pagamento.status === 'AGUARDANDO_LIBERACAO' && (
                            <Button
                              onClick={() => handleLiberarPagamento(pagamento.id)}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Liberar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando página {pagination.page} de {pagination.pages} ({pagination.total} pagamentos)
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.pages}
                  variant="outline"
                  size="sm"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

