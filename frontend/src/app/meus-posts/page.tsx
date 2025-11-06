'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { usePostsStore } from '@/store/posts';
import { api } from '@/services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Archive, 
  TrendingUp, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Post } from '@/types';
import { FinalizarTrabalhoModal } from '@/components/FinalizarTrabalhoModal';
import { useToast } from '@/components/ui/Toast';

export default function MeusPostsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { posts, isLoading, fetchPosts } = usePostsStore();
  const { addToast } = useToast();
  
  const [meusPosts, setMeusPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'ATIVO' | 'ORCAMENTO_ACEITO' | 'TRABALHO_CONCLUIDO' | 'FINALIZADO' | 'INATIVO' | 'CANCELADO'>('all');
  const [postParaFinalizar, setPostParaFinalizar] = useState<Post | null>(null);
  const [prestadorNome, setPrestadorNome] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.tipo !== 'CLIENTE') {
      router.push('/');
      return;
    }

    loadMeusPosts();
  }, [isAuthenticated, user]);

  const loadMeusPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts');
      const all = (response as any)?.data?.posts || (response as any)?.posts || [];
      const userPosts = all.filter(
        (post: Post) => post.usuario?.id === user?.id && post.tipo === 'SOLICITACAO'
      );
      setMeusPosts(userPosts);
      
      // Verificar se há posts aguardando confirmação
      const postConcluido = userPosts.find((p: Post) => p.status === 'TRABALHO_CONCLUIDO');
      if (postConcluido && (postConcluido as any).prestador_escolhido) {
        setPostParaFinalizar(postConcluido);
        setPrestadorNome((postConcluido as any).prestador_escolhido?.nome || 'Prestador');
        setModalAberto(true);
      }
    } catch (error) {
      console.error('Erro ao carregar meus posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarConclusao = async (data: {
    manterPublicado: boolean;
    avaliacao: {
      nota: number;
      comentario: string;
      aspectos?: {
        competencia: number;
        pontualidade: number;
        atendimento: number;
        preco_qualidade: number;
      };
    };
  }) => {
    if (!postParaFinalizar) return;

    try {
      const response = await api.post(`/posts/${postParaFinalizar.id}/confirmar-conclusao`, {
        manter_visivel: data.manterPublicado,
        avaliacao: data.avaliacao
      });

      if (response.success) {
        addToast({
          type: 'success',
          message: 'Trabalho confirmado como concluído com sucesso!'
        });
        setModalAberto(false);
        setPostParaFinalizar(null);
        loadMeusPosts();
      }
    } catch (error: any) {
      console.error('Erro ao confirmar conclusão:', error);
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao confirmar conclusão'
      });
    }
  };

  const handleAbrirModalFinalizacao = async (post: Post) => {
    try {
      // Buscar dados completos do post incluindo prestador
      const response = await api.get(`/posts/${post.id}`);
      const postCompleto = response.data.data.post;
      
      setPostParaFinalizar(postCompleto);
      setPrestadorNome(postCompleto.prestador_escolhido?.nome || 'Prestador');
      setModalAberto(true);
    } catch (error) {
      console.error('Erro ao carregar dados do post:', error);
      addToast({
        type: 'error',
        message: 'Erro ao carregar dados do prestador'
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setMeusPosts(meusPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      alert('Erro ao excluir post');
    }
  };

  const handleArchive = async (postId: string) => {
    try {
      await api.put(`/posts/${postId}`, { status: 'FINALIZADO' });
      loadMeusPosts();
    } catch (error) {
      console.error('Erro ao arquivar post:', error);
      alert('Erro ao arquivar post');
    }
  };

  const filteredPosts = filtroStatus === 'all' 
    ? meusPosts 
    : filtroStatus === 'FINALIZADO'
    ? meusPosts.filter(post => post.status === 'FINALIZADO' || post.status === 'INATIVO')
    : meusPosts.filter(post => post.status === filtroStatus);

  const estatisticas = {
    total: meusPosts.length,
    ativos: meusPosts.filter(p => p.status === 'ATIVO').length,
    finalizados: meusPosts.filter(p => p.status === 'FINALIZADO' || p.status === 'INATIVO').length,
    cancelados: meusPosts.filter(p => p.status === 'CANCELADO').length,
    aguardandoConfirmacao: meusPosts.filter(p => p.status === 'TRABALHO_CONCLUIDO').length,
    orcamentoAceito: meusPosts.filter(p => p.status === 'ORCAMENTO_ACEITO').length,
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Posts</h1>
          <p className="text-gray-600 mt-1">Gerencie suas solicitações de serviço</p>
        </div>
        <Button onClick={() => router.push('/posts/create?tipo=SOLICITACAO')} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Criar Solicitação
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{estatisticas.ativos}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        {estatisticas.aguardandoConfirmacao > 0 && (
          <Card className="p-4 border-2 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aguardando</p>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.aguardandoConfirmacao}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-yellow-600 animate-pulse" />
            </div>
          </Card>
        )}
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Finalizados</p>
              <p className="text-2xl font-bold text-blue-600">{estatisticas.finalizados}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelados</p>
              <p className="text-2xl font-bold text-red-600">{estatisticas.cancelados}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFiltroStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroStatus('ATIVO')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroStatus === 'ATIVO'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ativos
        </button>
        <button
          onClick={() => setFiltroStatus('ORCAMENTO_ACEITO')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroStatus === 'ORCAMENTO_ACEITO'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Orçamento Aceito
        </button>
        {estatisticas.aguardandoConfirmacao > 0 && (
          <button
            onClick={() => setFiltroStatus('TRABALHO_CONCLUIDO')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtroStatus === 'TRABALHO_CONCLUIDO'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            Aguardando Confirmação ({estatisticas.aguardandoConfirmacao})
          </button>
        )}
        <button
          onClick={() => setFiltroStatus('FINALIZADO')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroStatus === 'FINALIZADO'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Finalizados
        </button>
        <button
          onClick={() => setFiltroStatus('CANCELADO')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filtroStatus === 'CANCELADO'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cancelados
        </button>
      </div>

      {/* Lista de Posts */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum post encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {filtroStatus === 'all'
              ? 'Você ainda não criou nenhuma solicitação'
              : `Você não tem posts ${filtroStatus.toLowerCase()}`}
          </p>
          <Button onClick={() => router.push('/posts/create?tipo=SOLICITACAO')} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Solicitação
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div key={post.id} className="relative">
              <PostCard post={post} />
              
              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => handleArchive(post.id)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Arquivar"
                >
                  <Archive className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push(`/posts/${post.id}/edit`)}
                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  title="Editar"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                {post.status === 'ATIVO' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Ativo
                  </Badge>
                )}
                {post.status === 'ORCAMENTO_ACEITO' && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Orçamento Aceito
                  </Badge>
                )}
                {post.status === 'TRABALHO_CONCLUIDO' && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">
                    Aguardando Confirmação
                  </Badge>
                )}
                {(post.status === 'FINALIZADO' || post.status === 'INATIVO') && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Finalizado
                  </Badge>
                )}
                {post.status === 'CANCELADO' && (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                    Cancelado
                  </Badge>
                )}
              </div>

              {/* Botão especial para confirmar conclusão */}
              {post.status === 'TRABALHO_CONCLUIDO' && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Button
                    onClick={() => handleAbrirModalFinalizacao(post)}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar Conclusão do Trabalho
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Finalização */}
      {postParaFinalizar && (
        <FinalizarTrabalhoModal
          isOpen={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setPostParaFinalizar(null);
          }}
          onConfirm={handleConfirmarConclusao}
          prestadorNome={prestadorNome}
          postTitulo={postParaFinalizar.titulo}
        />
      )}
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}

