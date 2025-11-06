import React, { useState } from 'react';
import { Contrato } from '@/types';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ChatModal } from '@/components/ChatModal';
import { formatCurrency, formatDate, formatRelativeTime, formatStatus } from '@/utils/format';
import { MessageCircle, Calendar, DollarSign, User, Clock, AlertCircle } from 'lucide-react';

interface ContratoCardProps {
  contrato: Contrato;
  onVerDetalhes?: (id: string) => void;
  onFinalizar?: (id: string) => void;
  onCancelar?: (id: string) => void;
  onAbrirDisputa?: (id: string) => void;
  isCliente?: boolean;
  isPrestador?: boolean;
}

export const ContratoCard: React.FC<ContratoCardProps> = ({
  contrato,
  onVerDetalhes,
  onFinalizar,
  onCancelar,
  onAbrirDisputa,
  isCliente = false,
  isPrestador = false,
}) => {
  const [showChat, setShowChat] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'success';
      case 'CONCLUIDO':
        return 'default';
      case 'CANCELADO':
        return 'destructive';
      case 'DISPUTADO':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return <Clock className="h-4 w-4" />;
      case 'CONCLUIDO':
        return <Calendar className="h-4 w-4" />;
      case 'CANCELADO':
        return <AlertCircle className="h-4 w-4" />;
      case 'DISPUTADO':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canFinalizar = (isCliente || isPrestador) && contrato.status === 'ATIVO';
  const canCancelar = (isCliente || isPrestador) && contrato.status === 'ATIVO';
  const canAbrirDisputa = (isCliente || isPrestador) && contrato.status === 'ATIVO';
  const canChat = contrato.status === 'ATIVO' || contrato.status === 'DISPUTADO';

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={isCliente ? contrato.prestador?.foto_perfil : contrato.cliente?.foto_perfil}
                name={isCliente ? contrato.prestador?.nome : contrato.cliente?.nome}
                size="md"
              />
              <div>
                <h3 className="font-medium text-gray-900">
                  {isCliente ? contrato.prestador?.nome : contrato.cliente?.nome}
                </h3>
                <p className="text-sm text-gray-500">
                  {isCliente ? 'Prestador' : 'Cliente'} • {formatRelativeTime(contrato.data_criacao)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusVariant(contrato.status)} size="sm">
                {getStatusIcon(contrato.status)}
                <span className="ml-1">{formatStatus(contrato.status)}</span>
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {contrato.orcamento?.post?.titulo}
            </h2>
            <p className="text-gray-600 line-clamp-2">
              {contrato.orcamento?.descricao}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-lg font-semibold text-green-600">
                <DollarSign className="h-5 w-5 mr-1" />
                {formatCurrency(contrato.valor)}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Prazo: {formatDate(contrato.prazo)}</span>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>Condições:</strong> {contrato.condicoes}</p>
              {contrato.garantias && (
                <p><strong>Garantias:</strong> {contrato.garantias}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{contrato._count?.mensagens || 0} mensagens</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{contrato._count?.avaliacoes || 0} avaliações</span>
              </div>
            </div>
            
            {contrato.disputa && (
              <div className="flex items-center text-orange-600">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Em disputa</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {canChat && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowChat(true)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chat
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onVerDetalhes?.(contrato.id)}
              >
                Ver Detalhes
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              {canFinalizar && (
                <Button
                  size="sm"
                  onClick={() => onFinalizar?.(contrato.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Finalizar
                </Button>
              )}
              
              {canCancelar && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onCancelar?.(contrato.id)}
                >
                  Cancelar
                </Button>
              )}
              
              {canAbrirDisputa && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAbrirDisputa?.(contrato.id)}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Disputa
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        contratoId={contrato.id}
        contratoTitulo={contrato.orcamento?.post?.titulo}
      />
    </>
  );
};

