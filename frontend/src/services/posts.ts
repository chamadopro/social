import { api } from './api';
import { Post, PostForm, FiltrosBusca, PaginatedResponse } from '@/types';

export class PostsService {
  // Obter todos os posts (feed)
  async getPosts(filtros?: FiltrosBusca): Promise<PaginatedResponse<Post>> {
    return api.getPaginated<Post>('/posts', filtros);
  }

  // Obter post por ID
  async getPostById(id: string): Promise<{ success: boolean; data: { post: Post } }> {
    return api.get<{ post: Post }>(`/posts/${id}`);
  }

  // Criar post
  async createPost(data: PostForm): Promise<{ success: boolean; data: { post: Post } }> {
    return api.post<{ post: Post }>('/posts', data);
  }

  // Atualizar post
  async updatePost(id: string, data: Partial<PostForm>): Promise<{ success: boolean; data: { post: Post } }> {
    return api.put<{ post: Post }>(`/posts/${id}`, data);
  }

  // Deletar post
  async deletePost(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/posts/${id}`);
  }

  // Curtir post
  async curtirPost(id: string): Promise<{ success: boolean; message: string }> {
    return api.post(`/posts/${id}/curtir`);
  }

  // Descurtir post
  async descurtirPost(id: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/posts/${id}/curtir`);
  }

  // Comentar post
  async comentarPost(id: string, conteudo: string): Promise<{ success: boolean; data: { comentario: any } }> {
    return api.post<{ comentario: any }>(`/posts/${id}/comentar`, { conteudo });
  }

  // Deletar comentário
  async deletarComentario(postId: string, comentarioId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/posts/${postId}/comentarios/${comentarioId}`);
  }

  // Finalizar post
  async finalizarPost(id: string): Promise<{ success: boolean; message: string }> {
    return api.put(`/posts/${id}/finalizar`);
  }

  // Cancelar post
  async cancelarPost(id: string): Promise<{ success: boolean; message: string }> {
    return api.put(`/posts/${id}/cancelar`);
  }

  // Reativar post
  async reativarPost(id: string): Promise<{ success: boolean; message: string }> {
    return api.put(`/posts/${id}/reativar`);
  }

  // Obter orçamentos de um post
  async getPostOrcamentos(id: string, page: number = 1, limit: number = 20, status?: string): Promise<PaginatedResponse<any>> {
    return api.getPaginated<any>(`/posts/${id}/orcamentos`, { page, limit, status });
  }
}

export const postsService = new PostsService();

