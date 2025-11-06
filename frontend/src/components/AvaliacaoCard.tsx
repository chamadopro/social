'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Star, Clock, MessageCircle } from 'lucide-react';

interface AvaliacaoCardProps {
  avaliacao: {
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
  };
  showContrato?: boolean;
}

const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ 
  avaliacao, 
  showContrato = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatUserType = (tipo: string) => {
    switch (tipo) {
      case 'CLIENTE': return 'Cliente';
      case 'PRESTADOR': return 'Prestador';
      case 'ADMIN': return 'Administrador';
      default: return tipo;
    }
  };

  const getAspectoLabel = (aspecto: string) => {
    const labels: Record<string, string> = {
      pontualidade: 'Pontualidade',
      qualidade: 'Qualidade',
      comunicacao: 'Comunicação',
      preco: 'Preço/Qualidade',
      limpeza: 'Limpeza',
      profissionalismo: 'Profissionalismo'
    };
    return labels[aspecto] || aspecto;
  };

  const StarDisplay = ({ nota }: { nota: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= nota 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar
                src={avaliacao.avaliador.foto_perfil}
                name={avaliacao.avaliador.nome}
                size="md"
              />
              <div>
                <h4 className="font-semibold text-gray-900">
                  {avaliacao.avaliador.nome}
                </h4>
                <p className="text-sm text-gray-500">
                  {formatUserType(avaliacao.avaliador.tipo)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDate(avaliacao.data_criacao)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <StarDisplay nota={avaliacao.nota} />
              <span className="text-lg font-semibold text-gray-700">
                {avaliacao.nota}
              </span>
            </div>
          </div>

          {/* Aspectos Específicos */}
          {avaliacao.aspectos && Object.keys(avaliacao.aspectos).length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Aspectos:</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(avaliacao.aspectos).map(([aspecto, nota]) => (
                  <div key={aspecto} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {getAspectoLabel(aspecto)}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarDisplay nota={nota} />
                      <span className="text-xs text-gray-500">{nota}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comentário */}
          {avaliacao.comentario && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <h5 className="text-sm font-medium text-gray-700">Comentário:</h5>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                {avaliacao.comentario}
              </p>
            </div>
          )}

          {/* Informações do Contrato */}
          {showContrato && avaliacao.contrato && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Contrato:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {avaliacao.contrato.status}
                  </Badge>
                  <span className="text-gray-700">
                    R$ {avaliacao.contrato.valor.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoCard;


