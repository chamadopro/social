'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { PostCard } from '@/components/PostCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { 
  CheckCircle, 
  Star, 
  MessageSquare, 
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  Archive,
  Trash2,
  Filter
} from 'lucide-react';
import { Post } from '@/types';

interface ServicoConcluido {
  id: string;
  post: Post;
  orcamento: any;
  contrato: any;
  avaliacao?: {
    nota: number;
    comentario: string;
    data_criacao: string;
  };
  data_conclusao: string;
  valor_final: number;
}

export default function ServicosConcluidosPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [servicosConcluidos, setServicosConcluidos] = useState<ServicoConcluido[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<'all' | 'cliente' | 'prestador'>('all');
  const [filtroAvaliacao, setFiltroAvaliacao] = useState<'all' | 'com_avaliacao' | 'sem_avaliacao'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadServicosConcluidos();
  }, [isAuthenticated, user]);

  const loadServicosConcluidos = async () => {
    setLoading(true);
    try {
      // Simular dados de serviços concluídos
      // Em uma implementação real, isso viria de uma API específica
      const mockData: ServicoConcluido[] = [
        {
          id: '1',
          post: {
            id: '1',
            titulo: 'Reparo de torneira',
            categoria: 'Encanamento',
            descricao: 'Torneira com vazamento',
            tipo: 'SOLICITACAO',
            status: 'FINALIZADO',
            preco_estimado: 150,
            fotos: [],
            data_criacao: '2024-01-15',
            usuario: { id: user?.id, nome: user?.nome, foto_perfil: user?.foto_perfil, tipo: user?.tipo }
          },
          orcamento: { valor: 120, status: 'ACEITO' },
          contrato: { status: 'CONCLUIDO' },
          avaliacao: { nota: 5, comentario: 'Excelente trabalho!', data_criacao: '2024-01-20' },
          data_conclusao: '2024-01-20',
          valor_final: 120
        },
        {
          id: '2',
          post: {
            id: '2',
            titulo: 'Instalação de chuveiro',
            categoria: 'Encanamento',
            descricao: 'Instalação de chuveiro elétrico',
            tipo: 'OFERTA',
            status: 'FINALIZADO',
            preco_estimado: 200,
            fotos: [],
            data_criacao: '2024-01-10',
            usuario: { id: user?.id, nome: user?.nome, foto_perfil: user?.foto_perfil, tipo: user?.tipo }
          },
          orcamento: { valor: 180, status: 'ACEITO' },
          contrato: { status: 'CONCLUIDO' },
          avaliacao: undefined,
          data_conclusao: '2024-01-18',
          valor_final: 180
        }
      ];

      setServicosConcluidos(mockData);
    } catch (error) {
      console.error('Erro ao carregar serviços concluídos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvaliar = (servicoId: string) => {
    router.push(`/avaliar/${servicoId}`);
  };

  const handleArquivar = async (servicoId: string) => {
    try {
      // Implementar arquivamento
      setServicosConcluidos(servicosConcluidos.filter(s => s.id !== servicoId));
    } catch (error) {
      console.error('Erro ao arquivar serviço:', error);
    }
  };

  const filteredServicos = servicosConcluidos.filter(servico => {
    if (filtroTipo === 'cliente' && servico.post.tipo !== 'SOLICITACAO') return false;
    if (filtroTipo === 'prestador' && servico.post.tipo !== 'OFERTA') return false;
    if (filtroAvaliacao === 'com_avaliacao' && !servico.avaliacao) return false;
    if (filtroAvaliacao === 'sem_avaliacao' && servico.avaliacao) return false;
    return true;
  });

  const estatisticas = {
    total: servicosConcluidos.length,
    comoCliente: servicosConcluidos.filter(s => s.post.tipo === 'SOLICITACAO').length,
    comoPrestador: servicosConcluidos.filter(s => s.post.tipo === 'OFERTA').length,
    comAvaliacao: servicosConcluidos.filter(s => s.avaliacao).length,
    semAvaliacao: servicosConcluidos.filter(s => !s.avaliacao).length,
    valorTotal: servicosConcluidos.reduce((sum, s) => sum + s.valor_final, 0)
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços Concluídos</h1>
          <p className="text-gray-600 mt-1">Histórico de serviços finalizados</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/ranking')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Ranking
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Serviços</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Como Cliente</p>
              <p className="text-2xl font-bold text-blue-600">{estatisticas.comoCliente}</p>
            </div>
            <Eye className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Como Prestador</p>
              <p className="text-2xl font-bold text-orange-primary">{estatisticas.comoPrestador}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-primary" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">R$ {estatisticas.valorTotal.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Tipo:</span>
          <button
            onClick={() => setFiltroTipo('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroTipo === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo('cliente')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroTipo === 'cliente'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Como Cliente
          </button>
          <button
            onClick={() => setFiltroTipo('prestador')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroTipo === 'prestador'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Como Prestador
          </button>
        </div>

        <div className="flex gap-2">
          <span className="text-sm font-medium text-gray-700 self-center">Avaliação:</span>
          <button
            onClick={() => setFiltroAvaliacao('all')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroAvaliacao === 'all'
                ? 'bg-orange-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltroAvaliacao('com_avaliacao')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroAvaliacao === 'com_avaliacao'
                ? 'bg-orange-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Com Avaliação
          </button>
          <button
            onClick={() => setFiltroAvaliacao('sem_avaliacao')}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filtroAvaliacao === 'sem_avaliacao'
                ? 'bg-orange-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sem Avaliação
          </button>
        </div>
      </div>

      {/* Lista de Serviços */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredServicos.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum serviço concluído
          </h3>
          <p className="text-gray-600 mb-4">
            Você ainda não tem serviços concluídos
          </p>
          <Button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700">
            Explorar Serviços
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredServicos.map((servico) => (
            <Card key={servico.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <PostCard post={servico.post} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Concluído em: {new Date(servico.data_conclusao).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Valor: R$ {servico.valor_final.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {servico.avaliacao ? (
                        <>
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">
                            Avaliado: {servico.avaliacao.nota}/5
                          </span>
                        </>
                      ) : (
                        <>
                          <Star className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Sem avaliação
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {servico.avaliacao && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <strong>Avaliação:</strong> {servico.avaliacao.comentario}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {!servico.avaliacao && (
                    <Button
                      size="sm"
                      onClick={() => handleAvaliar(servico.id)}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Avaliar
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleArquivar(servico.id)}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Arquivar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}
