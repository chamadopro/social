'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  DollarSign, 
  Star, 
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export interface SearchFilters {
  query: string;
  categoria: string;
  subcategoria: string;
  estado: string;
  cidade: string;
  cep: string;
  raio: number;
  precoMin: number;
  precoMax: number;
  tipoUsuario: string;
  verificado: boolean | null;
  reputacaoMin: number;
  reputacaoMax: number;
  totalAvaliacoesMin: number;
  dataInicio: string;
  dataFim: string;
  status: string;
  urgente: boolean | null;
  disponivel: boolean | null;
  orderBy: string;
  orderDirection: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  loading?: boolean;
  availableFilters?: {
    categorias: { value: string; count: number }[];
    estados: { value: string; count: number }[];
    cidades: { value: string; count: number }[];
  };
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  loading = false,
  availableFilters
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categoria: '',
    subcategoria: '',
    estado: '',
    cidade: '',
    cep: '',
    raio: 10,
    precoMin: 0,
    precoMax: 1000,
    tipoUsuario: '',
    verificado: null,
    reputacaoMin: 0,
    reputacaoMax: 5,
    totalAvaliacoesMin: 0,
    dataInicio: '',
    dataFim: '',
    status: 'ATIVO',
    urgente: null,
    disponivel: null,
    orderBy: 'relevancia',
    orderDirection: 'desc'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Contar filtros ativos
  useEffect(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.categoria) count++;
    if (filters.estado) count++;
    if (filters.cidade) count++;
    if (filters.precoMin > 0) count++;
    if (filters.precoMax < 1000) count++;
    if (filters.tipoUsuario) count++;
    if (filters.verificado !== null) count++;
    if (filters.reputacaoMin > 0) count++;
    if (filters.reputacaoMax < 5) count++;
    if (filters.dataInicio) count++;
    if (filters.dataFim) count++;
    if (filters.urgente !== null) count++;
    if (filters.disponivel !== null) count++;
    
    setActiveFiltersCount(count);
  }, [filters]);

  const handleInputChange = (field: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      query: '',
      categoria: '',
      subcategoria: '',
      estado: '',
      cidade: '',
      cep: '',
      raio: 10,
      precoMin: 0,
      precoMax: 1000,
      tipoUsuario: '',
      verificado: null,
      reputacaoMin: 0,
      reputacaoMax: 5,
      totalAvaliacoesMin: 0,
      dataInicio: '',
      dataFim: '',
      status: 'ATIVO',
      urgente: null,
      disponivel: null,
      orderBy: 'relevancia',
      orderDirection: 'desc'
    });
    onClear();
  };

  const clearFilter = (field: keyof SearchFilters) => {
    setFilters(prev => ({
      ...prev,
      [field]: field === 'raio' ? 10 : field === 'precoMin' ? 0 : field === 'precoMax' ? 1000 : field === 'reputacaoMin' ? 0 : field === 'reputacaoMax' ? 5 : field === 'totalAvaliacoesMin' ? 0 : field === 'status' ? 'ATIVO' : field === 'orderBy' ? 'relevancia' : field === 'orderDirection' ? 'desc' : ''
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Barra de busca principal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar posts, usuários, serviços..."
                  value={filters.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros avançados */}
      {showAdvanced && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Limpar Tudo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categoria e Localização */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={filters.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas as categorias</option>
                  {availableFilters?.categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.value} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os estados</option>
                  {availableFilters?.estados.map(estado => (
                    <option key={estado.value} value={estado.value}>
                      {estado.value} ({estado.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={filters.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  placeholder="Digite a cidade"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  value={filters.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  placeholder="00000-000"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Preço e Reputação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço (R$)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.precoMin}
                    onChange={(e) => handleInputChange('precoMin', Number(e.target.value))}
                    placeholder="Mínimo"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">até</span>
                  <input
                    type="number"
                    value={filters.precoMax}
                    onChange={(e) => handleInputChange('precoMax', Number(e.target.value))}
                    placeholder="Máximo"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reputação (1-5)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={filters.reputacaoMin}
                    onChange={(e) => handleInputChange('reputacaoMin', Number(e.target.value))}
                    placeholder="Mínimo"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="flex items-center text-gray-500">até</span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={filters.reputacaoMax}
                    onChange={(e) => handleInputChange('reputacaoMax', Number(e.target.value))}
                    placeholder="Máximo"
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Filtros de Usuário */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuário
                </label>
                <select
                  value={filters.tipoUsuario}
                  onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos os tipos</option>
                  <option value="CLIENTE">Cliente</option>
                  <option value="PRESTADOR">Prestador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verificação
                </label>
                <select
                  value={filters.verificado === null ? '' : filters.verificado ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('verificado', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Verificado</option>
                  <option value="false">Não verificado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mín. Avaliações
                </label>
                <input
                  type="number"
                  min="0"
                  value={filters.totalAvaliacoesMin}
                  onChange={(e) => handleInputChange('totalAvaliacoesMin', Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtros de Data e Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <input
                  type="date"
                  value={filters.dataInicio}
                  onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <input
                  type="date"
                  value={filters.dataFim}
                  onChange={(e) => handleInputChange('dataFim', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ATIVO">Ativo</option>
                  <option value="FINALIZADO">Finalizado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>

            {/* Filtros de Urgência e Disponibilidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgente
                </label>
                <select
                  value={filters.urgente === null ? '' : filters.urgente ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('urgente', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Urgente</option>
                  <option value="false">Não urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilidade
                </label>
                <select
                  value={filters.disponivel === null ? '' : filters.disponivel ? 'true' : 'false'}
                  onChange={(e) => handleInputChange('disponivel', e.target.value === '' ? null : e.target.value === 'true')}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="true">Disponível</option>
                  <option value="false">Indisponível</option>
                </select>
              </div>
            </div>

            {/* Ordenação */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.orderBy}
                  onChange={(e) => handleInputChange('orderBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="relevancia">Relevância</option>
                  <option value="data">Data</option>
                  <option value="preco">Preço</option>
                  <option value="reputacao">Reputação</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direção
                </label>
                <select
                  value={filters.orderDirection}
                  onChange={(e) => handleInputChange('orderDirection', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="desc">Decrescente</option>
                  <option value="asc">Crescente</option>
                </select>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                onClick={() => setShowAdvanced(false)}
                variant="outline"
              >
                Fechar Filtros
              </Button>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros ativos */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.query && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              "{filters.query}"
              <button onClick={() => clearFilter('query')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.categoria && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Categoria: {filters.categoria}
              <button onClick={() => clearFilter('categoria')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.estado && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {filters.estado}
              <button onClick={() => clearFilter('estado')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.precoMin > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              R$ {filters.precoMin}+
              <button onClick={() => clearFilter('precoMin')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.reputacaoMin > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {filters.reputacaoMin}+ estrelas
              <button onClick={() => clearFilter('reputacaoMin')} className="ml-1">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;


