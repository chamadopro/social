'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AuthenticatedLayout, useLayoutViewMode } from '@/components/layout/AuthenticatedLayout';
import { PostCard } from '@/components/PostCard';
import { Loading } from '@/components/ui/Loading';
import { usePostsStore } from '@/store/posts';
import { useAuthStore } from '@/store/auth';
import { Search, Filter, RotateCcw, SortAsc, SortDesc, Layers, HelpCircle, Megaphone, User, Briefcase } from 'lucide-react';
import { CategoryFilterModal } from '@/components/CategoryFilterModal';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { posts, isLoading, error, fetchPosts } = usePostsStore();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'price_asc' | 'price_desc'>('recent');
  
  const [filters, setFilters] = useState({
    categoria: searchParams.get('categoria') || '',
    tipo: searchParams.get('tipo') || '',
    estado: '',
    cidade: '',
    precoMin: '',
    precoMax: '',
    urgencia: '',
    disponibilidade: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      const searchFilters = {
        ...filters,
        ...(query && { search: query })
      };
      fetchPosts(searchFilters);
    }
  }, [query, filters, isAuthenticated, fetchPosts]);

  const handleSearch = () => {
    const searchFilters = {
      ...filters,
      ...(query && { search: query })
    };
    fetchPosts(searchFilters);
  };

  const handleClear = () => {
    setQuery('');
    setFilters({
      categoria: '',
      tipo: '',
      estado: '',
      cidade: '',
      precoMin: '',
      precoMax: '',
      urgencia: '',
      disponibilidade: ''
    });
    setSortBy('recent');
    fetchPosts({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '');

  // Ordenar posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
    } else if (sortBy === 'price_asc') {
      return (a.preco_estimado || 0) - (b.preco_estimado || 0);
    } else if (sortBy === 'price_desc') {
      return (b.preco_estimado || 0) - (a.preco_estimado || 0);
    }
    return 0;
  });

  const categorias = [
    'Encanamento', 'Eletricidade', 'Pintura', 'Limpeza', 'Jardinagem',
    'Reformas', 'Montagem', 'Transporte', 'Tecnologia', 'Consultoria'
  ];

  const toolbar = (
    <>
      <div className="relative flex-1 min-w-[180px] sm:min-w-[200px] max-w-full sm:max-w-[420px]">
        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 sm:h-4 w-3.5 sm:w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Pesquisar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 w-full text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setFilters({ ...filters, tipo: '' })}
            title="Todos"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
              !filters.tipo ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Layers className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Todos</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, tipo: 'SOLICITACAO' })}
            title="Chamado"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
              filters.tipo === 'SOLICITACAO' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <HelpCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Chamado</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, tipo: 'OFERTA' })}
            title="Profissional"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
              filters.tipo === 'OFERTA' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Megaphone className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Profissional</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, tipo: 'VITRINE_CLIENTE' })}
            title="Vitrine Cliente"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
              filters.tipo === 'VITRINE_CLIENTE' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Vitrine Cliente</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, tipo: 'VITRINE_PRESTADOR' })}
            title="Vitrine Prestador"
            className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
              filters.tipo === 'VITRINE_PRESTADOR' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Briefcase className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Vitrine Prestador</span>
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            title="Categorias"
            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex flex-col items-center"
          >
            <Filter className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="mt-0.5 text-[7px] sm:text-[8px]">Categorias</span>
          </button>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
        >
          <Filter className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="hidden sm:inline">{showFilters ? 'Ocultar' : 'Filtros'}</span>
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="flex items-center gap-1 sm:gap-2 text-gray-600 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm"
            title="Limpar filtros"
          >
            <RotateCcw className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
        )}
      </div>
    </>
  );

  const content = (
    <div className="space-y-6">
      {/* Painel de Filtros Avançados (colapsável) */}
      {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Estado */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Estado</label>
              <Input
                type="text"
                placeholder="Ex: SP, RJ, MG..."
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Cidade */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Cidade</label>
              <Input
                type="text"
                placeholder="Ex: São Paulo..."
                value={filters.cidade}
                onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Preço Mínimo */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Preço Mín (R$)</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.precoMin}
                onChange={(e) => setFilters({ ...filters, precoMin: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Preço Máximo */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Preço Máx (R$)</label>
              <Input
                type="number"
                placeholder="10000"
                value={filters.precoMax}
                onChange={(e) => setFilters({ ...filters, precoMax: e.target.value })}
                className="text-sm"
              />
            </div>

            {/* Disponibilidade (para ofertas) */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Disponibilidade</label>
              <select
                value={filters.disponibilidade}
                onChange={(e) => setFilters({ ...filters, disponibilidade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent text-sm"
              >
                <option value="">Todas disponibilidades</option>
                <option value="COMERCIAL_8_5">Comercial (8h-17h)</option>
                <option value="FLEXIVEL">Flexível</option>
                <option value="FINAL_SEMANA">Fins de semana</option>
              </select>
            </div>
          </div>
        )}

        {/* Contagem de resultados */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              {sortedPosts.length} {sortedPosts.length === 1 ? 'post encontrado' : 'posts encontrados'}
            </span>
            
            {sortBy === 'recent' ? (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <SortDesc className="h-3 w-3" />
                Ordenado por mais recentes
              </span>
            ) : (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <SortAsc className="h-3 w-3" />
                Ordenado por preço
              </span>
            )}
          </div>
        </div>
      {/* Lista de Posts */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum resultado encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Tente ajustar os filtros ou usar termos de busca diferentes
          </p>
          <Button onClick={handleClear} variant="outline">
            Limpar Todos os Filtros
          </Button>
        </Card>
      ) : (
        <PostsAutoLayoutSearch posts={sortedPosts} />
      )}
    </div>
  );

  return (
    <AuthenticatedLayout toolbar={toolbar}>
      {content}
      <CategoryFilterModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        initialSelected={selectedCategories}
        onApply={(cats) => {
          setSelectedCategories(cats);
          setFilters({ ...filters, categoria: cats.length ? cats.join(',') : '' });
        }}
      />
    </AuthenticatedLayout>
  );
}

function PostsAutoLayoutSearch({ posts }: { posts: any[] }) {
  const { viewMode } = useLayoutViewMode();
  if (viewMode === 'feed') {
    return (
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}