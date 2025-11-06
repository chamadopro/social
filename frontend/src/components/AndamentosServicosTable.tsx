'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Play, CheckCircle, Clock, DollarSign, User, Briefcase, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ModalIniciarServico } from './ModalIniciarServico';
import { ModalFinalizarServico } from './ModalFinalizarServico';
import { ModalAbrirDisputa } from './ModalAbrirDisputa';

interface Andamento {
  id: string;
  status: string;
  valor: number;
  data_inicio: string | null;
  data_fim: string | null;
  quem_iniciou: string | null;
  quem_finalizou: string | null;
  aguardando_liberacao: boolean;
  data_liberacao_prevista: string | null;
  cliente: {
    id: string;
    nome: string;
    foto_perfil: string | null;
  };
  prestador: {
    id: string;
    nome: string;
    foto_perfil: string | null;
  };
  categoria: string | null;
  titulo: string | null;
  pagamento: {
    id: string;
    status: string;
    valor: number;
    data_liberacao: string | null;
    liberado_por: string | null;
  } | null;
  data_criacao: string;
  data_atualizacao: string;
}

interface AndamentosServicosTableProps {
  andamentos: Andamento[];
  tipoUsuario: 'PRESTADOR' | 'CLIENTE';
  usuarioId: string;
  onRefresh: () => void;
}

export function AndamentosServicosTable({
  andamentos,
  tipoUsuario,
  usuarioId,
  onRefresh
}: AndamentosServicosTableProps) {
  const { addToast } = useToast();
  const [modalIniciar, setModalIniciar] = useState<{ open: boolean; contratoId: string | null }>({ open: false, contratoId: null });
  const [modalFinalizar, setModalFinalizar] = useState<{ open: boolean; contratoId: string | null; quemFinaliza: 'CLIENTE' | 'PRESTADOR' | null }>({ open: false, contratoId: null, quemFinaliza: null });
  const [modalDisputa, setModalDisputa] = useState<{ open: boolean; contratoId: string | null }>({ open: false, contratoId: null });
  const [loading, setLoading] = useState(false);

  const handleIniciarClick = (contratoId: string) => {
    setModalIniciar({ open: true, contratoId });
  };

  const handleIniciarConfirm = async (fotos: string[]) => {
    if (!modalIniciar.contratoId) return;

    setLoading(true);
    try {
      const response = await api.post(`/contratos/${modalIniciar.contratoId}/iniciar`, {
        fotos_antes: fotos
      });
      if (response.success) {
        addToast({
          type: 'success',
          message: 'Serviço iniciado com sucesso!'
        });
        setModalIniciar({ open: false, contratoId: null });
        onRefresh();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao iniciar serviço'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizarClick = (contratoId: string, quemFinaliza: 'CLIENTE' | 'PRESTADOR') => {
    setModalFinalizar({ open: true, contratoId, quemFinaliza });
  };

  const handleFinalizarConfirm = async (fotos: string[]) => {
    if (!modalFinalizar.contratoId || !modalFinalizar.quemFinaliza) return;

    setLoading(true);
    try {
      const response = await api.post(`/contratos/${modalFinalizar.contratoId}/concluir`, {
        fotos_depois: fotos
      });
      if (response.success) {
        addToast({
          type: 'success',
          message: response.message || 'Serviço finalizado com sucesso!'
        });
        setModalFinalizar({ open: false, contratoId: null, quemFinaliza: null });
        onRefresh();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao finalizar serviço'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirDisputa = (contratoId: string) => {
    setModalDisputa({ open: true, contratoId });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      'ATIVO': { label: 'Ativo', variant: 'default', className: 'bg-green-100 text-green-800' },
      'EM_EXECUCAO': { label: 'Em Execução', variant: 'secondary', className: 'bg-purple-100 text-purple-800' },
      'CONCLUIDO': { label: 'Concluído', variant: 'default', className: 'bg-blue-100 text-blue-800' },
      'CANCELADO': { label: 'Cancelado', variant: 'destructive', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const, className: '' };
    return (
      <Badge variant={statusInfo.variant} className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPagamentoStatus = (pagamento: Andamento['pagamento']) => {
    if (!pagamento) return null;

    const statusMap: Record<string, { label: string; className: string }> = {
      'PENDENTE': { label: 'Pendente', className: 'text-yellow-600' },
      'PAGO': { label: 'Pago', className: 'text-green-600' },
      'AGUARDANDO_LIBERACAO': { label: 'Aguardando Liberação', className: 'text-orange-600' },
      'LIBERADO': { label: 'Liberado', className: 'text-blue-600' },
      'REEMBOLSADO': { label: 'Reembolsado', className: 'text-gray-600' },
    };

    const statusInfo = statusMap[pagamento.status] || { label: pagamento.status, className: 'text-gray-600' };
    return (
      <span className={`text-sm font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  if (andamentos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum serviço em andamento
        </h3>
        <p className="text-gray-600">
          Você ainda não possui serviços {tipoUsuario === 'PRESTADOR' ? 'como prestador' : 'como cliente'}.
        </p>
      </Card>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Serviço</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">
              {tipoUsuario === 'PRESTADOR' ? 'Cliente' : 'Prestador'}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Valor</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Início</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Fim</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Pagamento</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {andamentos.map((andamento) => {
            const outroUsuario = tipoUsuario === 'PRESTADOR' ? andamento.cliente : andamento.prestador;
            const podeIniciar = andamento.status === 'ATIVO' && !andamento.data_inicio;
            const podeFinalizar = andamento.status === 'EM_EXECUCAO' && andamento.data_inicio && !andamento.data_fim;

            return (
              <tr key={andamento.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {andamento.titulo || 'Sem título'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {andamento.categoria || 'Sem categoria'}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {outroUsuario.foto_perfil ? (
                      <img
                        src={outroUsuario.foto_perfil}
                        alt={outroUsuario.nome}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-xs text-gray-600">
                          {outroUsuario.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-900">{outroUsuario.nome}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(andamento.status)}
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">
                    {formatCurrency(andamento.valor)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    {andamento.data_inicio ? formatDate(andamento.data_inicio) : '-'}
                  </div>
                  {andamento.quem_iniciou && (
                    <div className="text-xs text-gray-500 mt-1">
                      {andamento.quem_iniciou === 'CLIENTE' ? (
                        <User className="inline h-3 w-3" />
                      ) : (
                        <Briefcase className="inline h-3 w-3" />
                      )}
                      {' '}
                      {andamento.quem_iniciou === 'CLIENTE' ? 'Cliente' : 'Prestador'}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm text-gray-600">
                    {andamento.data_fim ? formatDate(andamento.data_fim) : '-'}
                  </div>
                  {andamento.quem_finalizou && (
                    <div className="text-xs text-gray-500 mt-1">
                      {andamento.quem_finalizou === 'CLIENTE' ? (
                        <User className="inline h-3 w-3" />
                      ) : (
                        <Briefcase className="inline h-3 w-3" />
                      )}
                      {' '}
                      {andamento.quem_finalizou === 'CLIENTE' ? 'Cliente' : 'Prestador'}
                    </div>
                  )}
                  {andamento.aguardando_liberacao && andamento.data_liberacao_prevista && (
                    <div className="text-xs text-orange-600 mt-1">
                      Liberação: {formatDate(andamento.data_liberacao_prevista)}
                    </div>
                  )}
                </td>
                <td className="py-4 px-4">
                  {andamento.pagamento ? (
                    <div>
                      {getPagamentoStatus(andamento.pagamento)}
                      {andamento.pagamento.liberado_por && (
                        <div className="text-xs text-gray-500 mt-1">
                          Por: {andamento.pagamento.liberado_por}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2">
                    {podeIniciar && (
                      <Button
                        onClick={() => handleIniciarClick(andamento.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-2"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {podeFinalizar && (
                      <Button
                        onClick={() => handleFinalizarClick(andamento.id, tipoUsuario)}
                        className="bg-orange-primary hover:bg-orange-dark text-white text-xs py-1 px-2"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Finalizar
                      </Button>
                    )}
                    {/* Botão de Disputa - aparece quando serviço está em execução ou concluído */}
                    {/* Pode abrir disputa se: serviço iniciado, pagamento pela plataforma, e não está cancelado */}
                    {andamento.data_inicio && 
                     andamento.status !== 'CANCELADO' && 
                     andamento.pagamento && 
                     (andamento.pagamento.status === 'PAGO' || 
                      andamento.pagamento.status === 'AGUARDANDO_LIBERACAO' || 
                      andamento.pagamento.status === 'LIBERADO') && (
                      <Button
                        onClick={() => handleAbrirDisputa(andamento.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Abrir Disputa
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Modais */}
      <ModalIniciarServico
        isOpen={modalIniciar.open}
        onClose={() => setModalIniciar({ open: false, contratoId: null })}
        onConfirm={handleIniciarConfirm}
        loading={loading}
      />

      <ModalFinalizarServico
        isOpen={modalFinalizar.open}
        onClose={() => setModalFinalizar({ open: false, contratoId: null, quemFinaliza: null })}
        onConfirm={handleFinalizarConfirm}
        loading={loading}
        quemFinaliza={modalFinalizar.quemFinaliza || 'PRESTADOR'}
      />

      <ModalAbrirDisputa
        isOpen={modalDisputa.open}
        onClose={() => setModalDisputa({ open: false, contratoId: null })}
        contratoId={modalDisputa.contratoId || ''}
        onSuccess={() => {
          setModalDisputa({ open: false, contratoId: null });
          onRefresh();
        }}
      />
    </div>
  );
}

