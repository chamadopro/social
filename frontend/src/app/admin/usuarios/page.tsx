'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  tipo: string;
  ativo: boolean;
  data_cadastro: string;
  reputacao: number;
}

export default function AdminUsuariosPage() {
  const { addToast } = useToast();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    tipo: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchUsuarios();
  }, [pagination.page, filters]);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (filters.tipo !== 'all') {
        params.tipo = filters.tipo;
      }

      const response = await api.get('/admin/usuarios', params);

      if (response.success && response.data) {
        let usuariosData = response.data;
        
        // Se response.data tem pagination, ajustar
        if (response.pagination) {
          usuariosData = response.data;
          setPagination({
            ...pagination,
            total: response.pagination.total,
            pages: response.pagination.pages
          });
        } else if (Array.isArray(usuariosData)) {
          setUsuarios(usuariosData);
        } else if (usuariosData.data && Array.isArray(usuariosData.data)) {
          setUsuarios(usuariosData.data);
          if (usuariosData.pagination) {
            setPagination({
              ...pagination,
              total: usuariosData.pagination.total,
              pages: usuariosData.pagination.pages
            });
          }
        }
      } else {
        setError('Erro ao carregar usuários');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (usuarioId: string, ativo: boolean) => {
    try {
      const response = await api.put(`/admin/usuarios/${usuarioId}/toggle`, { ativo: !ativo });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: response.message || `Usuário ${!ativo ? 'ativado' : 'desativado'} com sucesso`
        });
        fetchUsuarios();
      } else {
        addToast({
          type: 'error',
          title: 'Erro',
          description: response.message || 'Erro ao alterar status do usuário'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: err.message || 'Erro ao alterar status do usuário'
      });
    }
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        usuario.nome.toLowerCase().includes(search) ||
        usuario.email.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const getTipoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'MODERADOR':
        return 'bg-purple-100 text-purple-800';
      case 'PRESTADOR':
        return 'bg-blue-100 text-blue-800';
      case 'CLIENTE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
        <p className="text-gray-600 mt-1">Gerencie usuários do sistema</p>
      </div>

      {/* Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro Status */}
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
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          {/* Filtro Tipo */}
          <select
            value={filters.tipo}
            onChange={(e) => {
              setFilters({ ...filters, tipo: e.target.value });
              setPagination({ ...pagination, page: 1 });
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os tipos</option>
            <option value="CLIENTE">Cliente</option>
            <option value="PRESTADOR">Prestador</option>
            <option value="MODERADOR">Moderador</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </Card>

      {/* Lista de Usuários */}
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
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reputação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cadastro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsuarios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  ) : (
                    filteredUsuarios.map((usuario) => (
                      <tr key={usuario.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                            <div className="text-sm text-gray-500">{usuario.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoBadgeColor(usuario.tipo)}`}>
                            {usuario.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usuario.reputacao?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(usuario.data_cadastro).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            usuario.ativo 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            onClick={() => handleToggleStatus(usuario.id, usuario.ativo)}
                            variant={usuario.ativo ? 'outline' : 'default'}
                            size="sm"
                            className="ml-auto"
                          >
                            {usuario.ativo ? (
                              <>
                                <UserX className="h-4 w-4 mr-1" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-1" />
                                Ativar
                              </>
                            )}
                          </Button>
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
                Mostrando página {pagination.page} de {pagination.pages} ({pagination.total} usuários)
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

