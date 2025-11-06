'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import OrcamentoCard from '@/components/OrcamentoCard';
import { useOrcamentos } from '@/hooks/useOrcamentos';
import { useAuthStore } from '@/store/auth';
import { 
  Plus, 
  Filter, 
  Search, 
  RefreshCw,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

const OrcamentosPage: React.FC = () => {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const {
    isLoading,
    orcamentos,
    pagination,
    fetchOrcamentos,
    responderOrcamento,
    iniciarNegociacao,
    deleteOrcamento
  } = useOrcamentos();

  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    post_id: searchParams.get('post_id') || '',
    prestador_id: searchParams.get('prestador_id') || '',
    cliente_id: searchParams.get('cliente_id') || '',
    valor_min: searchParams.get('valor_min') || '',
    valor_max: searchParams.get('valor_max') || '',
    page: 1,
    limit: 20
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrcamento, setSelectedOrcamento] = useState<string | null>(null);

  // Carregar orçamentos na inicialização
  useEffect(() => {
    loadOrcamentos();
  }, []);

  const loadOrcamentos = async () => {
    try {
      await fetchOrcamentos(filters);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset para primeira página ao filtrar
    }));
  };

  const handleSearch = () => {
    loadOrcamentos();
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      post_id: '',
      prestador_id: '',
      cliente_id: '',
      valor_min: '',
      valor_max: '',
      page: 1,
      limit: 20
    });
  };

  const handleResponder = async (id: string, status: 'ACEITO' | 'REJEITADO') => {
    try {
      await responderOrcamento(id, status);
      await loadOrcamentos(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao responder orçamento:', error);
    }
  };

  const handleIniciarNegociacao = async (id: string) => {
    try {
      await iniciarNegociacao(id);
      await loadOrcamentos(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao iniciar negociação:', error);
    }
  };

  const handleVerDetalhes = (id: string) => {
    setSelectedOrcamento(id);
    // Aqui você pode implementar navegação para página de detalhes
  };

  const getStatusCounts = () => {
    const counts = {
      PENDENTE: 0,
      ACEITO: 0,
      REJEITADO: 0,
      NEGOCIANDO: 0,
      EXPIRADO: 0
    };

    orcamentos.forEach(orcamento => {
      if (counts.hasOwnProperty(orcamento.status)) {
        counts[orcamento.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Orçamentos
              </h1>
              <p className="text-gray-600">
                Gerencie orçamentos e negociações
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
              <Button
                onClick={loadOrcamentos}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{statusCounts.PENDENTE}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Aceitos</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.ACEITO}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Rejeitados</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts.REJEITADO}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Negociando</p>
                  <p className="text-2xl font-bold text-blue-600">{statusCounts.NEGOCIANDO}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-600">{orcamentos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="ACEITO">Aceito</option>
                    <option value="REJEITADO">Rejeitado</option>
                    <option value="NEGOCIANDO">Negociando</option>
                    <option value="EXPIRADO">Expirado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Mínimo
                  </label>
                  <input
                    type="number"
                    value={filters.valor_min}
                    onChange={(e) => handleFilterChange('valor_min', e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Máximo
                  </label>
                  <input
                    type="number"
                    value={filters.valor_max}
                    onChange={(e) => handleFilterChange('valor_max', e.target.value)}
                    placeholder="1000.00"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Post
                  </label>
                  <input
                    type="text"
                    value={filters.post_id}
                    onChange={(e) => handleFilterChange('post_id', e.target.value)}
                    placeholder="UUID do post"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Prestador
                  </label>
                  <input
                    type="text"
                    value={filters.prestador_id}
                    onChange={(e) => handleFilterChange('prestador_id', e.target.value)}
                    placeholder="UUID do prestador"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID do Cliente
                  </label>
                  <input
                    type="text"
                    value={filters.cliente_id}
                    onChange={(e) => handleFilterChange('cliente_id', e.target.value)}
                    placeholder="UUID do cliente"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                >
                  Limpar Filtros
                </Button>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de orçamentos */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Carregando orçamentos...</span>
          </div>
        ) : orcamentos.length > 0 ? (
          <div className="space-y-6">
            {orcamentos.map((orcamento) => (
              <OrcamentoCard
                key={orcamento.id}
                orcamento={orcamento}
                onResponder={handleResponder}
                onIniciarNegociacao={handleIniciarNegociacao}
                onVerDetalhes={handleVerDetalhes}
                userType={user?.tipo === 'PRESTADOR' ? 'prestador' : 'cliente'}
                currentUserId={user?.id}
              />
            ))}

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => handleFilterChange('page', String(filters.page - 1))}
                  disabled={filters.page <= 1}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {filters.page} de {pagination.totalPages}
                </span>
                <Button
                  onClick={() => handleFilterChange('page', String(filters.page + 1))}
                  disabled={filters.page >= pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum orçamento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Não há orçamentos que correspondam aos filtros aplicados
              </p>
              <Button onClick={handleClearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrcamentosPage;