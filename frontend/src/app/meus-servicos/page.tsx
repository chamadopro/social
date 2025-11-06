'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { AbasTrabalhoHibrido } from '@/components/AbasTrabalhoHibrido';
import { AndamentosServicosTable } from '@/components/AndamentosServicosTable';
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
  ListChecks
} from 'lucide-react';
import { Post } from '@/types';
import { useToast } from '@/components/ui/Toast';

type TipoAba = 'PRESTADOR' | 'CLIENTE';
type SecaoAtiva = 'andamentos' | 'ofertas';

export default function MeusServicosPage() {
  const router = useRouter();
  const { user, isAuthenticated, temClienteAssociado } = useAuthStore();
  const { posts, isLoading, fetchPosts } = usePostsStore();
  const { addToast } = useToast();
  
  const [abaAtiva, setAbaAtiva] = useState<TipoAba>('PRESTADOR');
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoAtiva>('andamentos');
  const [meusServicos, setMeusServicos] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAndamentos, setLoadingAndamentos] = useState(false);
  const [andamentos, setAndamentos] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'ATIVO' | 'ORCAMENTO_ACEITO' | 'TRABALHO_CONCLUIDO' | 'FINALIZADO' | 'INATIVO' | 'CANCELADO'>('all');

  const isHybrid = user?.tipo === 'PRESTADOR' && (temClienteAssociado || user?.temClienteAssociado);
  const isPrestador = user?.tipo === 'PRESTADOR';
  const isCliente = user?.tipo === 'CLIENTE' || (isHybrid && abaAtiva === 'CLIENTE');

  // Restaurar última aba do localStorage
  useEffect(() => {
    if (isHybrid) {
      const ultimaAba = localStorage.getItem('meusServicos_ultimaAba') as TipoAba | null;
      if (ultimaAba === 'PRESTADOR' || ultimaAba === 'CLIENTE') {
        setAbaAtiva(ultimaAba);
      }
    }
  }, [isHybrid]);

  // Salvar última aba no localStorage
  useEffect(() => {
    if (isHybrid) {
      localStorage.setItem('meusServicos_ultimaAba', abaAtiva);
    }
  }, [abaAtiva, isHybrid]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Permitir acesso para PRESTADOR, CLIENTE ou híbrido
    if (user?.tipo !== 'PRESTADOR' && user?.tipo !== 'CLIENTE') {
      router.push('/');
      return;
    }

    loadAndamentos();
    if (isPrestador || (isHybrid && abaAtiva === 'PRESTADOR')) {
      loadMeusServicos();
    }
  }, [isAuthenticated, user, abaAtiva, isHybrid, isPrestador]);

  const loadAndamentos = async () => {
    setLoadingAndamentos(true);
    try {
      const tipo = isHybrid ? abaAtiva : (user?.tipo === 'PRESTADOR' ? 'PRESTADOR' : 'CLIENTE');
      const response = await api.get(`/contratos/andamentos?tipo=${tipo}`);
      if (response.data?.andamentos) {
        setAndamentos(response.data.andamentos);
      }
    } catch (error) {
      console.error('Erro ao carregar andamentos:', error);
    } finally {
      setLoadingAndamentos(false);
    }
  };

  const loadMeusServicos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts');
      const all = (response as any)?.data?.posts || (response as any)?.posts || [];
      const userPosts = all.filter(
        (post: Post) => post.usuario?.id === user?.id && post.tipo === 'OFERTA'
      );
      setMeusServicos(userPosts);
    } catch (error) {
      console.error('Erro ao carregar meus serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setMeusServicos(meusServicos.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      alert('Erro ao excluir serviço');
    }
  };

  const handleArchive = async (postId: string) => {
    try {
      await api.put(`/posts/${postId}`, { status: 'FINALIZADO' });
      loadMeusServicos();
    } catch (error) {
      console.error('Erro ao arquivar serviço:', error);
      alert('Erro ao arquivar serviço');
    }
  };

  const filteredPosts = filtroStatus === 'all' 
    ? meusServicos 
    : filtroStatus === 'FINALIZADO'
    ? meusServicos.filter(post => post.status === 'FINALIZADO' || post.status === 'INATIVO')
    : meusServicos.filter(post => post.status === filtroStatus);

  const estatisticas = {
    total: meusServicos.length,
    ativos: meusServicos.filter(p => p.status === 'ATIVO').length,
    emExecucao: meusServicos.filter(p => p.status === 'ORCAMENTO_ACEITO').length,
    aguardandoConfirmacao: meusServicos.filter(p => p.status === 'TRABALHO_CONCLUIDO').length,
    finalizados: meusServicos.filter(p => p.status === 'FINALIZADO' || p.status === 'INATIVO').length,
    cancelados: meusServicos.filter(p => p.status === 'CANCELADO').length,
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
          <p className="text-gray-600 mt-1">
            {isHybrid 
              ? 'Gerencie seus serviços como prestador e cliente'
              : isPrestador 
                ? 'Gerencie suas ofertas de serviço'
                : 'Acompanhe seus serviços contratados'}
          </p>
        </div>
        {(isPrestador || (isHybrid && abaAtiva === 'PRESTADOR')) && (
          <Button onClick={() => router.push('/posts/create?tipo=OFERTA')} className="bg-orange-primary hover:bg-orange-dark">
            <Plus className="h-4 w-4 mr-2" />
            Criar Oferta
          </Button>
        )}
      </div>

      {/* Abas para usuário híbrido */}
      {isHybrid && (
        <AbasTrabalhoHibrido 
          abaAtiva={abaAtiva}
          onAbaChange={(aba) => {
            setAbaAtiva(aba);
            loadAndamentos();
            if (aba === 'PRESTADOR') {
              loadMeusServicos();
            }
          }}
        />
      )}

      {/* Tabs de seção (Andamentos / Ofertas) */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSecaoAtiva('andamentos')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            secaoAtiva === 'andamentos'
              ? 'border-orange-primary text-orange-primary'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <ListChecks className="inline h-4 w-4 mr-2" />
          Andamentos dos Serviços
        </button>
        {(isPrestador || (isHybrid && abaAtiva === 'PRESTADOR')) && (
          <button
            onClick={() => setSecaoAtiva('ofertas')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              secaoAtiva === 'ofertas'
                ? 'border-orange-primary text-orange-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="inline h-4 w-4 mr-2" />
            Minhas Ofertas
          </button>
        )}
      </div>

      {/* Seção: Andamentos */}
      {secaoAtiva === 'andamentos' && (
        <div>
          {loadingAndamentos ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary"></div>
            </div>
          ) : (
            <AndamentosServicosTable
              andamentos={andamentos}
              tipoUsuario={abaAtiva}
              usuarioId={user?.id || ''}
              onRefresh={loadAndamentos}
            />
          )}
        </div>
      )}

      {/* Seção: Ofertas (apenas para prestadores) */}
      {secaoAtiva === 'ofertas' && (isPrestador || (isHybrid && abaAtiva === 'PRESTADOR')) && (
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
                </div>
                <Eye className="h-8 w-8 text-orange-primary" />
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

            {estatisticas.emExecucao > 0 && (
              <Card className="p-4 border-2 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Em Execução</p>
                    <p className="text-2xl font-bold text-purple-600">{estatisticas.emExecucao}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            )}

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
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroStatus('ATIVO')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === 'ATIVO'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ativos
            </button>
            {estatisticas.emExecucao > 0 && (
              <button
                onClick={() => setFiltroStatus('ORCAMENTO_ACEITO')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroStatus === 'ORCAMENTO_ACEITO'
                    ? 'bg-purple-500 text-white'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                }`}
              >
                Em Execução ({estatisticas.emExecucao})
              </button>
            )}
            {estatisticas.aguardandoConfirmacao > 0 && (
              <button
                onClick={() => setFiltroStatus('TRABALHO_CONCLUIDO')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filtroStatus === 'TRABALHO_CONCLUIDO'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Aguardando Cliente ({estatisticas.aguardandoConfirmacao})
              </button>
            )}
            <button
              onClick={() => setFiltroStatus('FINALIZADO')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === 'FINALIZADO'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Finalizados
            </button>
            <button
              onClick={() => setFiltroStatus('CANCELADO')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroStatus === 'CANCELADO'
                  ? 'bg-orange-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelados
            </button>
          </div>

          {/* Lista de Posts */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum serviço encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {filtroStatus === 'all'
                  ? 'Você ainda não criou nenhuma oferta'
                  : `Você não tem serviços ${filtroStatus.toLowerCase()}`}
              </p>
              <Button onClick={() => router.push('/posts/create?tipo=OFERTA')} className="bg-orange-primary hover:bg-orange-dark">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Oferta
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
                      className="p-2 bg-orange-primary text-white rounded-lg hover:bg-orange-dark transition-colors"
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
                        Em Execução
                      </Badge>
                    )}
                    {post.status === 'TRABALHO_CONCLUIDO' && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Aguardando Cliente
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}
