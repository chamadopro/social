'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import AvaliacaoCard from '@/components/AvaliacaoCard';
import { 
  Star, 
  TrendingUp, 
  Award, 
  Users, 
  Calendar,
  Filter,
  ChevronLeft
} from 'lucide-react';

interface Avaliacao {
  id: string;
  nota: number;
  comentario?: string;
  aspectos?: Record<string, number>;
  data_criacao: string;
  avaliador: {
    id: string;
    nome: string;
    foto_perfil?: string;
    tipo: string;
  };
  contrato?: {
    id: string;
    valor: number;
    status: string;
  };
}

interface ReputacaoStats {
  media: number;
  total: number;
  soma: number;
  menor: number;
  maior: number;
}

interface Distribuicao {
  nota: number;
  quantidade: number;
}

interface Usuario {
  id: string;
  nome: string;
  reputacao: number;
}

const AvaliacoesPage: React.FC = () => {
  const params = useParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [stats, setStats] = useState<ReputacaoStats | null>(null);
  const [distribuicao, setDistribuicao] = useState<Distribuicao[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [pagina, setPagina] = useState(1);

  const userId = params.id as string;

  useEffect(() => {
    fetchReputacaoStats();
    fetchAvaliacoes();
  }, [userId, filtro, pagina]);

  const fetchReputacaoStats = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/avaliacoes/reputacao/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar estatísticas');
      }

      setUsuario(data.data.usuario);
      setStats(data.data.estatisticas);
      setDistribuicao(data.data.distribuicao);
      setAvaliacoes(data.data.avaliacoesRecentes);

    } catch (error: any) {
      toast({
        title: 'Erro ao Carregar Dados',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvaliacoes = async () => {
    try {
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: '10',
        ...(filtro !== 'todas' && { tipo: filtro })
      });

      const response = await fetch(`http://localhost:3001/api/avaliacoes/usuario/${userId}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar avaliações');
      }

      setAvaliacoes(data.data.avaliacoes);

    } catch (error: any) {
      toast({
        title: 'Erro ao Carregar Avaliações',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    }
  };

  const formatUserType = (tipo: string) => {
    switch (tipo) {
      case 'CLIENTE': return 'Cliente';
      case 'PRESTADOR': return 'Prestador';
      case 'ADMIN': return 'Administrador';
      default: return tipo;
    }
  };

  const getReputacaoColor = (reputacao: number) => {
    if (reputacao >= 4.5) return 'text-green-600';
    if (reputacao >= 3.5) return 'text-yellow-600';
    if (reputacao >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReputacaoBadge = (reputacao: number) => {
    if (reputacao >= 4.5) return { text: 'Excelente', variant: 'success' as const };
    if (reputacao >= 3.5) return { text: 'Bom', variant: 'default' as const };
    if (reputacao >= 2.5) return { text: 'Regular', variant: 'warning' as const };
    return { text: 'Ruim', variant: 'destructive' as const };
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!usuario || !stats) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h1>
          <p className="text-gray-600 mb-6">O usuário que você está procurando não existe.</p>
          <Button onClick={() => window.history.back()}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const reputacaoBadge = getReputacaoBadge(stats.media);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-0">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
            <Avatar
              src={usuario.foto_perfil}
              name={usuario.nome}
              size="lg"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{usuario.nome}</h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className={`text-2xl font-bold ${getReputacaoColor(stats.media)}`}>
                    {stats.media.toFixed(1)}
                  </span>
                </div>
                <Badge variant={reputacaoBadge.variant}>
                  {reputacaoBadge.text}
                </Badge>
                <span className="text-gray-600">
                  {stats.total} avaliação{stats.total !== 1 ? 'ões' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Estatísticas */}
          <div className="lg:col-span-1 space-y-6">
            {/* Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Média:</span>
                  <span className="font-semibold">{stats.media.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Menor nota:</span>
                  <span className="font-semibold">{stats.menor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maior nota:</span>
                  <span className="font-semibold">{stats.maior}</span>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Distribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(nota => {
                    const item = distribuicao.find(d => d.nota === nota);
                    const quantidade = item?.quantidade || 0;
                    const porcentagem = stats.total > 0 ? (quantidade / stats.total) * 100 : 0;
                    
                    return (
                      <div key={nota} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            {nota} <Star className="h-3 w-3 text-yellow-500" />
                          </span>
                          <span>{quantidade}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${porcentagem}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avaliações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtrar:</span>
                  <div className="flex gap-2">
                    {[
                      { value: 'todas', label: 'Todas' },
                      { value: 'SERVICO', label: 'Serviços' },
                      { value: 'CLIENTE', label: 'Clientes' }
                    ].map(option => (
                      <Button
                        key={option.value}
                        variant={filtro === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFiltro(option.value)}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Avaliações */}
            <div className="space-y-4">
              {avaliacoes.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Nenhuma avaliação encontrada
                    </h3>
                    <p className="text-gray-500">
                      Este usuário ainda não possui avaliações.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                avaliacoes.map(avaliacao => (
                  <AvaliacaoCard
                    key={avaliacao.id}
                    avaliacao={avaliacao}
                    showContrato={true}
                  />
                ))
              )}
            </div>

            {/* Paginação */}
            {avaliacoes.length > 0 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-600">
                  Página {pagina}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => p + 1)}
                  disabled={avaliacoes.length < 10}
                >
                  Próxima
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AvaliacoesPage;


