'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { 
  Shield, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User
} from 'lucide-react';

interface Log {
  id: string;
  acao: string;
  detalhes: string;
  ip?: string;
  user_agent?: string;
  data_criacao: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}

export default function AdminAuditoriaPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    acao: '',
    usuario_id: '',
    dataInicio: '',
    dataFim: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.acao) params.acao = filters.acao;
      if (filters.usuario_id) params.usuario_id = filters.usuario_id;
      if (filters.dataInicio) params.dataInicio = filters.dataInicio;
      if (filters.dataFim) params.dataFim = filters.dataFim;

      const response = await api.get('/admin/auditoria', params);

      if (response.success && response.data) {
        let logsData = response.data;
        
        if (response.pagination) {
          setPagination({
            ...pagination,
            total: response.pagination.total,
            pages: response.pagination.pages
          });
        } else if (logsData.pagination) {
          setPagination({
            ...pagination,
            total: logsData.pagination.total,
            pages: logsData.pagination.pages
          });
        }

        if (Array.isArray(logsData)) {
          setLogs(logsData);
        } else if (logsData.data && Array.isArray(logsData.data)) {
          setLogs(logsData.data);
        }
      } else {
        setError('Erro ao carregar histórico de auditoria');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar histórico de auditoria');
    } finally {
      setLoading(false);
    }
  };

  const getAcaoColor = (acao: string) => {
    if (acao.includes('LOGIN') || acao.includes('CREATE')) return 'bg-green-100 text-green-800';
    if (acao.includes('DELETE') || acao.includes('REMOVE')) return 'bg-red-100 text-red-800';
    if (acao.includes('UPDATE') || acao.includes('EDIT')) return 'bg-yellow-100 text-yellow-800';
    if (acao.includes('EXPORT') || acao.includes('DOWNLOAD')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const parseDetalhes = (detalhes: string) => {
    try {
      return JSON.parse(detalhes);
    } catch {
      return detalhes;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Histórico de Auditoria</h1>
        <p className="text-gray-600 mt-1">Registro completo de ações do sistema</p>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por ação..."
              value={filters.acao}
              onChange={(e) => {
                setFilters({ ...filters, acao: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="ID do usuário..."
              value={filters.usuario_id}
              onChange={(e) => {
                setFilters({ ...filters, usuario_id: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="date"
              placeholder="Data início..."
              value={filters.dataInicio}
              onChange={(e) => {
                setFilters({ ...filters, dataInicio: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="date"
              placeholder="Data fim..."
              value={filters.dataFim}
              onChange={(e) => {
                setFilters({ ...filters, dataFim: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Logs */}
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
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalhes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        Nenhum log encontrado
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => {
                      const detalhes = parseDetalhes(log.detalhes);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.data_criacao).toLocaleString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAcaoColor(log.acao)}`}>
                              {log.acao}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.usuario ? (
                              <div>
                                <div className="text-sm font-medium text-gray-900">{log.usuario.nome}</div>
                                <div className="text-sm text-gray-500">{log.usuario.email}</div>
                                <div className="text-xs text-gray-400">{log.usuario.tipo}</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Sistema</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {typeof detalhes === 'object' ? JSON.stringify(detalhes) : detalhes}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.ip || 'N/A'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Paginação */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Mostrando página {pagination.page} de {pagination.pages} ({pagination.total} logs)
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

