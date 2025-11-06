import { create } from 'zustand';
import { Post, FiltrosBusca } from '@/types';
import { postsService } from '@/services/posts';

interface PostsState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filtros: FiltrosBusca;
}

interface PostsActions {
  fetchPosts: (filtros?: FiltrosBusca) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  createPost: (data: any) => Promise<void>;
  updatePost: (id: string, data: any) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  curtirPost: (id: string) => Promise<void>;
  descurtirPost: (id: string) => Promise<void>;
  comentarPost: (id: string, conteudo: string) => Promise<void>;
  finalizarPost: (id: string) => Promise<void>;
  cancelarPost: (id: string) => Promise<void>;
  reativarPost: (id: string) => Promise<void>;
  setFiltros: (filtros: FiltrosBusca) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearPosts: () => void;
}

type PostsStore = PostsState & PostsActions;

export const usePostsStore = create<PostsStore>((set, get) => ({
  // Estado inicial
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  filtros: {},

  // Ações
  fetchPosts: async (filtros?: FiltrosBusca) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postsService.getPosts(filtros);
      
      // Remover logs em produção; manter silencioso
      
      if (response.success && response.data) {
        set({
          posts: response.data.posts || [],
          pagination: response.data.pagination,
          filtros: filtros || {},
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao carregar posts',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao carregar posts',
      });
    }
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postsService.getPostById(id);
      
      if (response.success && response.data) {
        set({
          currentPost: response.data.post,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao carregar post',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao carregar post',
      });
    }
  },

  createPost: async (data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postsService.createPost(data);
      
      if (response.success && response.data) {
        const { posts } = get();
        set({
          posts: [response.data.post, ...posts],
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao criar post',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao criar post',
      });
    }
  },

  updatePost: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postsService.updatePost(id, data);
      
      if (response.success && response.data) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id ? response.data.post : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id ? response.data.post : currentPost,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao atualizar post',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao atualizar post',
      });
    }
  },

  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postsService.deletePost(id);
      
      if (response.success) {
        const { posts } = get();
        const filteredPosts = posts.filter(post => post.id !== id);
        
        set({
          posts: filteredPosts,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Erro ao deletar post',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao deletar post',
      });
    }
  },

  curtirPost: async (id: string) => {
    try {
      const response = await postsService.curtirPost(id);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id 
            ? { ...post, _count: { ...post._count, curtidas: (post._count?.curtidas || 0) + 1 } }
            : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id 
            ? { ...currentPost, _count: { ...currentPost._count, curtidas: (currentPost._count?.curtidas || 0) + 1 } }
            : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao curtir post' });
    }
  },

  descurtirPost: async (id: string) => {
    try {
      const response = await postsService.descurtirPost(id);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id 
            ? { ...post, _count: { ...post._count, curtidas: Math.max((post._count?.curtidas || 0) - 1, 0) } }
            : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id 
            ? { ...currentPost, _count: { ...currentPost._count, curtidas: Math.max((currentPost._count?.curtidas || 0) - 1, 0) } }
            : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao descurtir post' });
    }
  },

  comentarPost: async (id: string, conteudo: string) => {
    try {
      const response = await postsService.comentarPost(id, conteudo);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id 
            ? { ...post, _count: { ...post._count, comentarios: (post._count?.comentarios || 0) + 1 } }
            : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id 
            ? { ...currentPost, _count: { ...currentPost._count, comentarios: (currentPost._count?.comentarios || 0) + 1 } }
            : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao comentar post' });
    }
  },

  finalizarPost: async (id: string) => {
    try {
      const response = await postsService.finalizarPost(id);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id ? { ...post, status: 'FINALIZADO' } : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id ? { ...currentPost, status: 'FINALIZADO' } : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao finalizar post' });
    }
  },

  cancelarPost: async (id: string) => {
    try {
      const response = await postsService.cancelarPost(id);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id ? { ...post, status: 'CANCELADO' } : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id ? { ...currentPost, status: 'CANCELADO' } : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao cancelar post' });
    }
  },

  reativarPost: async (id: string) => {
    try {
      const response = await postsService.reativarPost(id);
      
      if (response.success) {
        const { posts, currentPost } = get();
        const updatedPosts = posts.map(post => 
          post.id === id ? { ...post, status: 'ATIVO' } : post
        );
        
        set({
          posts: updatedPosts,
          currentPost: currentPost?.id === id ? { ...currentPost, status: 'ATIVO' } : currentPost,
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Erro ao reativar post' });
    }
  },

  setFiltros: (filtros: FiltrosBusca) => {
    set({ filtros });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  clearPosts: () => {
    set({ posts: [], currentPost: null });
  },
}));

