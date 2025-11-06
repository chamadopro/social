'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  Heart, 
  MessageCircle, 
  Share2, 
  Edit, 
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface Post {
  id: string;
  tipo: 'SOLICITACAO' | 'OFERTA' | 'VITRINE_PRESTADOR' | 'VITRINE_CLIENTE';
  titulo: string;
  categoria: string;
  descricao: string;
  localizacao: {
    endereco: string;
    latitude: number;
    longitude: number;
  };
  preco_estimado?: number;
  prazo?: string;
  fotos: string[];
  urgencia: 'BAIXA' | 'MEDIA' | 'ALTA';
  status: 'ATIVO' | 'ORCAMENTO_ACEITO' | 'TRABALHO_CONCLUIDO' | 'INATIVO' | 'FINALIZADO' | 'CANCELADO' | 'ARQUIVADO';
  data_criacao: string;
  usuario: {
    id: string;
    nome: string;
    foto_perfil?: string;
    reputacao: number;
    tipo: string;
    telefone?: string;
  };
  orcamentos: any[];
  curtidas: any[];
  comentarios: any[];
  _count: {
    orcamentos: number;
    curtidas: number;
    comentarios: number;
  };
}

const PostDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, token, isAuthenticated } = useAuthStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar post');
      }

      setPost(data.data.post);
      setIsLiked(data.data.post.curtidas.some((like: any) => like.usuario_id === user?.id));
    } catch (error: any) {
      toast({
        title: 'Erro ao Carregar Post',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Necessário',
        description: 'Você precisa fazer login para curtir posts.',
        variant: 'warning',
      });
      return;
    }

    try {
      const endpoint = isLiked ? 'descurtir' : 'curtir';
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/${endpoint}`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        fetchPost(); // Refresh post data
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível curtir/descurtir o post.',
        variant: 'destructive',
      });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/comentar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ conteudo: newComment }),
      });

      if (response.ok) {
        setNewComment('');
        fetchPost(); // Refresh post data
        toast({
          title: 'Comentário Adicionado',
          description: 'Seu comentário foi publicado com sucesso.',
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o comentário.',
        variant: 'destructive',
      });
    } finally {
      setIsCommenting(false);
    }
  };

  const handleStatusChange = async (action: 'finalizar' | 'cancelar' | 'reativar') => {
    try {
      const response = await fetch(`http://localhost:3001/api/posts/${postId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchPost(); // Refresh post data
        toast({
          title: 'Status Atualizado',
          description: `Post ${action === 'finalizar' ? 'finalizado' : action === 'cancelar' ? 'cancelado' : 'reativado'} com sucesso.`,
          variant: 'success',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do post.',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getUrgencyColor = (urgencia: string) => {
    switch (urgencia) {
      case 'ALTA': return 'destructive';
      case 'MEDIA': return 'warning';
      case 'BAIXA': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO': return 'default';
      case 'FINALIZADO': return 'success';
      case 'CANCELADO': return 'destructive';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Post não encontrado</h1>
          <p className="text-gray-600 mb-6">O post que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => router.push('/')}>
            Voltar ao Início
          </Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === post.usuario.id;
  const isVitrine = post.tipo === 'VITRINE_CLIENTE' || post.tipo === 'VITRINE_PRESTADOR';
  const canEdit = isOwner && post.status === 'ATIVO';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={getStatusColor(post.status)}>
                  {post.status}
                </Badge>
                <Badge variant={getUrgencyColor(post.urgencia)}>
                  {post.urgencia}
                </Badge>
                <Badge variant="outline">
                  {post.tipo === 'SOLICITACAO' ? 'Solicitação' : post.tipo === 'OFERTA' ? 'Oferta' : 'Vitrine'}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.titulo}</h1>
              <p className="text-lg text-gray-600">{post.categoria}</p>
            </div>
            
            {isOwner && (
              <div className="flex gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/posts/${postId}/edit`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
                {post.status === 'ATIVO' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('finalizar')}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Finalizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('cancelar')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </>
                )}
                {post.status === 'CANCELADO' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange('reativar')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reativar
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar
              src={post.usuario.foto_perfil}
              name={post.usuario.nome}
              size="lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{post.usuario.nome}</h3>
              <p className="text-sm text-gray-600">
                {post.usuario.tipo} • Reputação: {post.usuario.reputacao}/5
              </p>
              <p className="text-xs text-gray-500">
                Postado em {formatDate(post.data_criacao)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={isLiked ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {post._count.curtidas}
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{post.descricao}</p>
              </CardContent>
            </Card>

            {/* Photos */}
            {post.fotos && post.fotos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {post.fotos.map((foto, index) => (
                      <div key={index} className="relative w-full rounded-lg overflow-hidden pb-[56.25%] bg-gray-100">
                        <img
                          src={foto}
                          alt={`Foto ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Comentários ({post._count.comentarios})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleComment}
                      disabled={isCommenting || !newComment.trim()}
                      size="sm"
                    >
                      {isCommenting ? 'Enviando...' : 'Enviar'}
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comentarios.map((comentario: any) => (
                    <div key={comentario.id} className="flex gap-3">
                      <Avatar
                        src={comentario.usuario.foto_perfil}
                        name={comentario.usuario.nome}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {comentario.usuario.nome}
                          </h4>
                          <p className="text-gray-700 text-sm mt-1">
                            {comentario.conteudo}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(comentario.data_criacao)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.preco_estimado && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{formatPrice(post.preco_estimado)}</span>
                  </div>
                )}
                
                {post.prazo && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{formatDate(post.prazo)}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{post.localizacao.endereco}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleLike}
                  variant={isLiked ? "default" : "outline"}
                  className="w-full"
                  disabled={!isAuthenticated}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Curtido' : 'Curtir'} ({post._count.curtidas})
                </Button>
                
                {!isOwner && !isVitrine && (
                  <Button className="w-full">
                    Enviar Orçamento
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Orçamentos:</span>
                  <span className="font-semibold">{post._count.orcamentos}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Curtidas:</span>
                  <span className="font-semibold">{post._count.curtidas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Comentários:</span>
                  <span className="font-semibold">{post._count.comentarios}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailPage;


