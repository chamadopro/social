'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  DollarSign, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle,
  Star,
  MapPin
} from 'lucide-react';

interface OrcamentoCardProps {
  orcamento: {
    id: string;
    valor: number;
    descricao: string;
    prazo_execucao: number;
    condicoes_pagamento: string;
    status: string;
    data_criacao: string;
    data_expiracao?: string;
    observacoes?: string;
    contrapropostas: number;
    prestador: {
      id: string;
      nome: string;
      foto_perfil?: string;
      reputacao: number;
      total_avaliacoes: number;
      verificado: boolean;
      cidade: string;
      estado: string;
    };
    cliente: {
      id: string;
      nome: string;
      foto_perfil?: string;
    };
    post: {
      id: string;
      titulo: string;
      categoria: string;
    };
    negociacoes?: Array<{
      id: string;
      tipo: string;
      descricao: string;
      valor?: number;
      prazo?: number;
      data_criacao: string;
      autor: {
        id: string;
        nome: string;
        foto_perfil?: string;
      };
    }>;
  };
  onResponder?: (id: string, status: 'ACEITO' | 'REJEITADO') => void;
  onIniciarNegociacao?: (id: string) => void;
  onVerDetalhes?: (id: string) => void;
  userType?: 'cliente' | 'prestador';
  currentUserId?: string;
}

const OrcamentoCard: React.FC<OrcamentoCardProps> = ({
  orcamento,
  onResponder,
  onIniciarNegociacao,
  onVerDetalhes,
  userType,
  currentUserId
}) => {
  const [showNegociacoes, setShowNegociacoes] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACEITO':
        return 'bg-green-100 text-green-800';
      case 'REJEITADO':
        return 'bg-red-100 text-red-800';
      case 'NEGOCIANDO':
        return 'bg-blue-100 text-blue-800';
      case 'EXPIRADO':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'ACEITO':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJEITADO':
        return <XCircle className="h-4 w-4" />;
      case 'NEGOCIANDO':
        return <MessageSquare className="h-4 w-4" />;
      case 'EXPIRADO':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canResponder = userType === 'cliente' && 
    orcamento.status === 'PENDENTE' && 
    orcamento.cliente.id === currentUserId;

  const canIniciarNegociacao = orcamento.status === 'PENDENTE' && 
    (orcamento.prestador.id === currentUserId || orcamento.cliente.id === currentUserId);

  const canNegociar = orcamento.status === 'NEGOCIANDO' && 
    (orcamento.prestador.id === currentUserId || orcamento.cliente.id === currentUserId);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {orcamento.post.titulo}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {orcamento.post.categoria}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(orcamento.status)}`}>
                {getStatusIcon(orcamento.status)}
                <span className="ml-1">{orcamento.status}</span>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              R$ {orcamento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">
              Prazo: {orcamento.prazo_execucao} dias
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Informações do prestador/cliente */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={orcamento.prestador.foto_perfil || '/default-avatar.png'}
            alt={orcamento.prestador.nome}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {orcamento.prestador.nome}
              </h3>
              {orcamento.prestador.verificado && (
                <CheckCircle className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{orcamento.prestador.reputacao.toFixed(1)}</span>
                <span>({orcamento.prestador.total_avaliacoes})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{orcamento.prestador.cidade}, {orcamento.prestador.estado}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Descrição */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-1">Descrição do Serviço</h4>
          <p className="text-gray-600 text-sm line-clamp-3">
            {orcamento.descricao}
          </p>
        </div>

        {/* Condições de pagamento */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-1">Condições de Pagamento</h4>
          <p className="text-gray-600 text-sm">
            {orcamento.condicoes_pagamento}
          </p>
        </div>

        {/* Observações */}
        {orcamento.observacoes && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-1">Observações</h4>
            <p className="text-gray-600 text-sm">
              {orcamento.observacoes}
            </p>
          </div>
        )}

        {/* Negociações */}
        {orcamento.negociacoes && orcamento.negociacoes.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowNegociacoes(!showNegociacoes)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <MessageSquare className="h-4 w-4" />
              <span>
                {orcamento.negociacoes.length} negociação(ões)
                {orcamento.contrapropostas > 0 && ` • ${orcamento.contrapropostas} contraproposta(s)`}
              </span>
            </button>

            {showNegociacoes && (
              <div className="mt-3 space-y-3 max-h-60 overflow-y-auto">
                {orcamento.negociacoes.map((negociacao) => (
                  <div
                    key={negociacao.id}
                    className="p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={negociacao.autor.foto_perfil || '/default-avatar.png'}
                        alt={negociacao.autor.nome}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-medium text-sm text-gray-900">
                        {negociacao.autor.nome}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {negociacao.tipo}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {negociacao.descricao}
                    </p>
                    {(negociacao.valor || negociacao.prazo) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {negociacao.valor && (
                          <span>R$ {negociacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                        {negociacao.prazo && (
                          <span>{negociacao.prazo} dias</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Data de criação */}
        <div className="text-xs text-gray-500 mb-4">
          Criado em {new Date(orcamento.data_criacao).toLocaleDateString('pt-BR')}
          {orcamento.data_expiracao && (
            <span className="ml-2">
              • Expira em {new Date(orcamento.data_expiracao).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2">
          {onVerDetalhes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onVerDetalhes(orcamento.id)}
            >
              Ver Detalhes
            </Button>
          )}

          {canResponder && onResponder && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onResponder(orcamento.id, 'ACEITO')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Aceitar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onResponder(orcamento.id, 'REJEITADO')}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Rejeitar
              </Button>
            </>
          )}

          {canIniciarNegociacao && onIniciarNegociacao && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onIniciarNegociacao(orcamento.id)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Iniciar Negociação
            </Button>
          )}

          {canNegociar && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNegociacoes(!showNegociacoes)}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Negociar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrcamentoCard;