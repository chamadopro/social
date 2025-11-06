'use client';

import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  TrendingUp,
  Filter,
  Search,
  Users
} from 'lucide-react';

interface UsuarioRanking {
  id: string;
  nome: string;
  foto_perfil?: string;
  tipo: string;
  reputacao: number;
  total_avaliacoes: number;
  data_cadastro: string;
}

const RankingPage: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [usuarios, setUsuarios] = useState<UsuarioRanking[]>([]);
  const [filtro, setFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRanking();
  }, [filtro, pagina]);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: '20',
        ...(filtro !== 'todos' && { tipo: filtro })
      });

      const response = await fetch(`http://localhost:3001/api/avaliacoes/ranking/reputacao?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao carregar ranking');
      }

      setUsuarios(data.data.usuarios);
      setTotal(data.data.pagination.total);

    } catch (error: any) {
      toast({
        title: 'Erro ao Carregar Ranking',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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

  const getRankingIcon = (posicao: number) => {
    if (posicao === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (posicao === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (posicao === 3) return <Trophy className="h-6 w-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-600">#{posicao}</span>;
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ranking de Reputação
          </h1>
          <p className="text-gray-600">
            Os profissionais mais bem avaliados da plataforma
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtrar por tipo:</span>
              <div className="flex gap-2">
                {[
                  { value: 'todos', label: 'Todos' },
                  { value: 'PRESTADOR', label: 'Prestadores' },
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

        {/* Ranking */}
        <div className="space-y-4">
          {usuarios.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500">
                  Não há usuários com avaliações suficientes para aparecer no ranking.
                </p>
              </CardContent>
            </Card>
          ) : (
            usuarios.map((usuario, index) => {
              const posicao = (pagina - 1) * 20 + index + 1;
              const reputacaoBadge = getReputacaoBadge(usuario.reputacao);
              
              return (
                <Card key={usuario.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Posição */}
                      <div className="flex-shrink-0 w-12 text-center">
                        {getRankingIcon(posicao)}
                      </div>

                      {/* Avatar e Nome */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar
                          src={usuario.foto_perfil}
                          name={usuario.nome}
                          size="lg"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {usuario.nome}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatUserType(usuario.tipo)} • Membro desde {formatDate(usuario.data_cadastro)}
                          </p>
                        </div>
                      </div>

                      {/* Reputação */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <span className={`text-2xl font-bold ${getReputacaoColor(usuario.reputacao)}`}>
                              {usuario.reputacao.toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {usuario.total_avaliacoes} avaliação{usuario.total_avaliacoes !== 1 ? 'ões' : ''}
                          </p>
                        </div>
                        <Badge variant={reputacaoBadge.variant}>
                          {reputacaoBadge.text}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Paginação */}
        {usuarios.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600">
              Página {pagina} de {Math.ceil(total / 20)}
            </span>
            <Button
              variant="outline"
              onClick={() => setPagina(p => p + 1)}
              disabled={pagina >= Math.ceil(total / 20)}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Informações sobre o Ranking */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Como funciona o ranking?
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• O ranking é baseado na reputação média dos usuários</li>
                  <li>• Apenas usuários com pelo menos 3 avaliações aparecem no ranking</li>
                  <li>• A reputação é calculada com base em todas as avaliações recebidas</li>
                  <li>• O ranking é atualizado em tempo real conforme novas avaliações são feitas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RankingPage;


