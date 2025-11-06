'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { 
  FileText, 
  Search, 
  Eye, 
  EyeOff,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Post {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  status: string;
  data_criacao: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}

export default function AdminPostsPage() {
  const { addToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    fetchPosts();
  }, [pagination.page, filters]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.status !== 'all') {
        params.status = filters.status;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.get('/admin/posts', params);

      if (response.success && response.data) {
        let postsData = response.data;
        
        if (response.pagination) {
          setPagination({
            ...pagination,
            total: response.pagination.total,
            pages: response.pagination.pages
          });
        } else if (postsData.pagination) {
          setPagination({
            ...pagination,
            total: postsData.pagination.total,
            pages: postsData.pagination.pages
          });
        }

        if (Array.isArray(postsData)) {
          setPosts(postsData);
        } else if (postsData.data && Array.isArray(postsData.data)) {
          setPosts(postsData.data);
        }
      } else {
        setError('Erro ao carregar posts');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar posts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (postId: string, acao: 'ocultar' | 'remover') => {
    try {
      const response = await api.put(`/admin/posts/${postId}/toggle`, { acao });

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Sucesso',
          description: response.message || `Post ${acao === 'ocultar' ? 'ocultado' : 'removido'} com sucesso`
        });
        fetchPosts();
      } else {
        addToast({
          type: 'error',
          title: 'Erro',
          description: response.message || 'Erro ao alterar status do post'
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: err.message || 'Erro ao alterar status do post'
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-green-100 text-green-800';
      case 'ARQUIVADO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      case 'FINALIZADO':
      case 'INATIVO':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Moderação de Posts</h1>
        <p className="text-gray-600 mt-1">Gerencie e modere posts do sistema</p>
      </div>

      {/* Filtros e Busca */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchPosts();
                }
              }}
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
              <option value="ATIVO">Ativos</option>
              <option value="ARQUIVADO">Arquivados</option>
              <option value="CANCELADO">Cancelados</option>
              <option value="FINALIZADO">Finalizados</option>
              <option value="INATIVO">Inativos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Posts */}
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
                      Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Autor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
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
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        Nenhum post encontrado
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm font-medium text-gray-900 truncate">{post.titulo}</div>
                            <div className="text-sm text-gray-500 truncate">{post.descricao}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.usuario.nome}</div>
                            <div className="text-sm text-gray-500">{post.usuario.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.categoria}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(post.status)}`}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.data_criacao).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {post.status === 'ATIVO' ? (
                              <Button
                                onClick={() => handleToggleStatus(post.id, 'ocultar')}
                                variant="outline"
                                size="sm"
                              >
                                <EyeOff className="h-4 w-4 mr-1" />
                                Arquivar
                              </Button>
                            ) : post.status === 'ARQUIVADO' ? (
                              <Button
                                onClick={() => handleToggleStatus(post.id, 'ocultar')}
                                variant="outline"
                                size="sm"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Restaurar
                              </Button>
                            ) : null}
                            <Button
                              onClick={() => handleToggleStatus(post.id, 'remover')}
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </div>
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
                Mostrando página {pagination.page} de {pagination.pages} ({pagination.total} posts)
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

