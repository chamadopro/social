'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { 
  AlertCircle, 
  Search, 
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

interface Disputa {
  id: string;
  tipo: string;
  descricao: string;
  status: string;
  decisao?: string;
  observacoes?: string;
  data_criacao: string;
  data_resolucao?: string;
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
  moderador?: {
    id: string;
    nome: string;
  };
}

export default function AdminDisputasPage() {
  const { addToast } = useToast();
  const [disputas, setDisputas] = useState<Disputa[]>([]);
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
  const [selectedDisputa, setSelectedDisputa] = useState<Disputa | null>(null);
  const [resolucaoForm, setResolucaoForm] = useState({
    decisao: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchDisputas();
  }, [pagination.page, filters]);

  const fetchDisputas = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      const response = await api.get('/admin/disputas', params);

      if (response.success && response.data) {
        let disputasData = response.data;
        
        if (response.pagination) {
          setPagination({
            ...pagination,
            total: response.pagination.total,
            pages: response.pagination.pages
          });
        } else if (disputasData.pagination) {
          setPagination({
            ...pagination,
            total: disputasData.pagination.total,
            pages: disputasData.pagination.pages
          });
        }

        if (Array.isArray(disputasData)) {
          setDisputas(disputasData);
        } else if (disputasData.data && Array.isArray(disputasData.data)) {
          setDisputas(disputasData.data);
        }
      } else {
        setError('Erro ao carregar disputas');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar disputas');
    } finally {
      setLoading(false);
    }
  };

  const handleResolverDisputa = async (disputaId: string) => {
    if (!resolucaoForm.decisao.trim()) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Por favor, informe a decisão'
      });
      return;
    }

    try {
      const response = await api.put(`/admin/disputas/${disputaId}/resolver`, {
        decisao: resolucaoForm.decisao,
        observacoes: resolucaoForm.observacoes || null
      });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: response.message || 'Disputa resolvida com sucesso'
        });
        setSelectedDisputa(null);
        setResolucaoForm({ decisao: '', observacoes: '' });
        fetchDisputas();
      } else {
        addToast({
          type: 'error',
          title: 'Erro',
          description: response.message || 'Erro ao resolver disputa'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: err.message || 'Erro ao resolver disputa'
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ABERTA':
        return 'bg-yellow-100 text-yellow-800';
      case 'EM_ANALISE':
        return 'bg-blue-100 text-blue-800';
      case 'RESOLVIDA':
        return 'bg-green-100 text-green-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const disputasAbertas = disputas.filter(d => d.status === 'ABERTA' || d.status === 'EM_ANALISE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resolução de Disputas</h1>
        <p className="text-gray-600 mt-1">Analise e resolva disputas do sistema</p>
      </div>

      {/* Card de Resumo */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Disputas Abertas</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{disputasAbertas}</p>
          </div>
          <AlertCircle className="h-12 w-12 text-yellow-500" />
        </div>
      </Card>

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
              <option value="ABERTA">Abertas</option>
              <option value="EM_ANALISE">Em Análise</option>
              <option value="RESOLVIDA">Resolvidas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Disputas */}
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
                      Tipo
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
                  {disputas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhuma disputa encontrada
                      </td>
                    </tr>
                  ) : (
                    disputas.map((disputa) => (
                      <tr key={disputa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{disputa.tipo}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{disputa.descricao}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{disputa.contrato.cliente.nome}</div>
                            <div className="text-sm text-gray-500">{disputa.contrato.cliente.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{disputa.contrato.prestador.nome}</div>
                            <div className="text-sm text-gray-500">{disputa.contrato.prestador.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(disputa.status)}`}>
                            {disputa.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(disputa.data_criacao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              onClick={() => setSelectedDisputa(disputa)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                            {(disputa.status === 'ABERTA' || disputa.status === 'EM_ANALISE') && (
                              <Button
                                onClick={() => {
                                  setSelectedDisputa(disputa);
                                  setResolucaoForm({ decisao: '', observacoes: '' });
                                }}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolver
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Modal de Resolução */}
          {selectedDisputa && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {resolucaoForm.decisao ? 'Resolver Disputa' : 'Detalhes da Disputa'}
                    </h2>
                    <button
                      onClick={() => {
                        setSelectedDisputa(null);
                        setResolucaoForm({ decisao: '', observacoes: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Tipo</p>
                      <p className="text-gray-900">{selectedDisputa.tipo}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Descrição</p>
                      <p className="text-gray-900">{selectedDisputa.descricao}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Cliente</p>
                        <p className="text-gray-900">{selectedDisputa.contrato.cliente.nome}</p>
                        <p className="text-sm text-gray-500">{selectedDisputa.contrato.cliente.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Prestador</p>
                        <p className="text-gray-900">{selectedDisputa.contrato.prestador.nome}</p>
                        <p className="text-sm text-gray-500">{selectedDisputa.contrato.prestador.email}</p>
                      </div>
                    </div>

                    {(selectedDisputa.status === 'ABERTA' || selectedDisputa.status === 'EM_ANALISE') && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decisão *
                          </label>
                          <select
                            value={resolucaoForm.decisao}
                            onChange={(e) => setResolucaoForm({ ...resolucaoForm, decisao: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Selecione uma decisão</option>
                            <option value="FAVOR_CLIENTE">Favor do Cliente</option>
                            <option value="FAVOR_PRESTADOR">Favor do Prestador</option>
                            <option value="DIVIDIR">Dividir Valor</option>
                            <option value="CANCELAR">Cancelar</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações (opcional)
                          </label>
                          <textarea
                            value={resolucaoForm.observacoes || ''}
                            onChange={(e) => setResolucaoForm({ ...resolucaoForm, observacoes: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Adicione observações sobre a resolução (será salvo no log de auditoria)..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            As observações serão registradas no log de auditoria
                          </p>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => {
                              setSelectedDisputa(null);
                              setResolucaoForm({ decisao: '', observacoes: '' });
                            }}
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleResolverDisputa(selectedDisputa.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolver Disputa
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedDisputa.status === 'RESOLVIDA' && selectedDisputa.decisao && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700">Decisão</p>
                        <p className="text-gray-900">{selectedDisputa.decisao}</p>
                        {selectedDisputa.moderador && (
                          <>
                            <p className="text-sm font-medium text-gray-700 mt-2">Resolvida por</p>
                            <p className="text-gray-900">{selectedDisputa.moderador.nome}</p>
                          </>
                        )}
                        {selectedDisputa.data_resolucao && (
                          <>
                            <p className="text-sm font-medium text-gray-700 mt-2">Data de Resolução</p>
                            <p className="text-gray-900">{new Date(selectedDisputa.data_resolucao).toLocaleString('pt-BR')}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando página {pagination.page} de {pagination.pages} ({pagination.total} disputas)
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

