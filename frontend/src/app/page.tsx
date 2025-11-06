'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '@/components/layout/Layout';
import { AuthenticatedLayout, useLayoutViewMode } from '@/components/layout/AuthenticatedLayout';
import { PostCard } from '@/components/PostCard';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { usePostsStore } from '@/store/posts';
import { useAuthStore } from '@/store/auth';
import { Search, Layers, HelpCircle, Megaphone, User, Briefcase, Filter } from 'lucide-react';
import { ALL_CATEGORIES } from '@/components/CategorySelector';
import { CategoryFilterModal } from '@/components/CategoryFilterModal';

export default function HomePage() {
  const { posts, isLoading, error, fetchPosts, filtros, setFiltros } = usePostsStore();
  const [isMounted, setIsMounted] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { user, isAuthenticated } = useAuthStore();
  
  // Evita piscar layout antigo antes de hidratar estado de auth
  // Aguarda um momento adicional no mobile para garantir que o localStorage foi lido
  useEffect(() => {
    // Aguardar um pequeno delay no mobile para garantir que o Zustand persist leu o localStorage
    const isMobile = typeof window !== 'undefined' && /Mobile|Android|iPhone/i.test(navigator.userAgent);
    const delay = isMobile ? 150 : 50;
    
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {

    // Para usuários não autenticados, mostrar apenas posts de apresentação
    if (!isAuthenticated) {
      fetchPosts({ ...filtros, is_apresentacao: true });
    } else {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleFilterChange = (key: string, value: any) => {
    const newFiltros = { ...filtros, [key]: value };
    setFiltros(newFiltros);
    
    // Aplicar filtro de apresentação para não autenticados
    if (!isAuthenticated) {
      fetchPosts({ ...newFiltros, is_apresentacao: true });
    } else {
      fetchPosts(newFiltros);
    }
  };

  const toolbar = (
    <>
      {/* Botões rápidos de tipo (com ícones) */}
      <div className="flex items-center flex-wrap gap-1 sm:gap-1.5">
              <button
                onClick={() => handleFilterChange('tipo', '')}
                title="Todos"
          className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
                  !filtros.tipo ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
          <Layers className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="mt-0.5 text-[7px] sm:text-[8px]">Todos</span>
              </button>
              <button
                onClick={() => handleFilterChange('tipo', 'SOLICITACAO')}
                title="Chamado"
          className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
                  filtros.tipo === 'SOLICITACAO' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
          <HelpCircle className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="mt-0.5 text-[7px] sm:text-[8px]">Chamado</span>
              </button>
              <button
                onClick={() => handleFilterChange('tipo', 'OFERTA')}
                title="Profissional"
          className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
                  filtros.tipo === 'OFERTA' ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
          <Megaphone className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="mt-0.5 text-[7px] sm:text-[8px]">Profissional</span>
              </button>
              <button
                onClick={() => handleFilterChange('tipo', 'VITRINE_CLIENTE')}
                title="Vitrine Cliente"
          className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
                  filtros.tipo === 'VITRINE_CLIENTE' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
          <User className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="mt-0.5 text-[7px] sm:text-[8px]">Vitrine Cliente</span>
              </button>
              <button
                onClick={() => handleFilterChange('tipo', 'VITRINE_PRESTADOR')}
                title="Vitrine Prestador"
          className={`p-1.5 sm:p-2 rounded-lg transition-colors flex flex-col items-center ${
                  filtros.tipo === 'VITRINE_PRESTADOR' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
          <Briefcase className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
          <span className="mt-0.5 text-[7px] sm:text-[8px]">Vitrine Prestador</span>
              </button>
      {/* Categoria */}
      <button
        onClick={() => setShowCategoryModal(true)}
        title="Categorias"
        className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 flex flex-col items-center"
      >
        <Filter className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
        <span className="mt-0.5 text-[7px] sm:text-[8px]">Categorias</span>
      </button>
      </div>
    </>
  );

  const content = (
    <div className="space-y-6">
        {/* Posts Grid/Feed */}
        <div className="space-y-4 sm:space-y-6">
          {posts.length > 0 ? (
            <PostsAutoLayout posts={posts} />
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-500">
                Tente ajustar os filtros para encontrar mais posts
              </p>
            </div>
          )}
        </div>
      </div>
  );

  if (isLoading) {
    return isAuthenticated ? (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" text="Carregando posts..." />
        </div>
      </AuthenticatedLayout>
    ) : (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" text="Carregando posts..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return isAuthenticated ? (
      <AuthenticatedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar posts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchPosts()}>
            Tentar Novamente
          </Button>
        </div>
      </AuthenticatedLayout>
    ) : (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar posts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => fetchPosts()}>
            Tentar Novamente
          </Button>
        </div>
      </Layout>
    );
  }

  if (!isMounted) {
    return null;
  }

  return isAuthenticated ? (
    <AuthenticatedLayout currentPath="/" toolbar={toolbar}>
      {content}
      <CategoryFilterModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        initialSelected={selectedCategories}
        disabledOptions={filtros.tipo === 'SOLICITACAO' ? (user?.areas_atuacao || []) : []}
        onApply={(cats) => {
          setSelectedCategories(cats);
          handleFilterChange('categoria', cats.length ? cats.join(',') : '');
        }}
      />
    </AuthenticatedLayout>
  ) : (
    <Layout>
      {content}
      <CategoryFilterModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        initialSelected={selectedCategories}
        onApply={(cats) => {
          setSelectedCategories(cats);
          handleFilterChange('categoria', cats.length ? cats.join(',') : '');
        }}
      />
    </Layout>
  );
}

function PostsAutoLayout({ posts }: { posts: any[] }) {
  const { viewMode } = useLayoutViewMode();
  
  // No mobile sempre usar feed (grid-cols-1), desktop usa viewMode
  // Usamos classes CSS responsivas ao invés de JS para evitar problemas de SSR
  if (viewMode === 'feed') {
    return (
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    );
  }
  // Grid view: sempre grid-cols-1 no mobile, depois responsivo
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}