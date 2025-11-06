'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Star, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface FinalizarTrabalhoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
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
  }) => void;
  prestadorNome: string;
  postTitulo: string;
}

export const FinalizarTrabalhoModal: React.FC<FinalizarTrabalhoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  prestadorNome,
  postTitulo
}) => {
  const [manterPublicado, setManterPublicado] = useState(true);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [aspectos, setAspectos] = useState({
    competencia: 0,
    pontualidade: 0,
    atendimento: 0,
    preco_qualidade: 0
  });
  const [mostrarAspectos, setMostrarAspectos] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (nota === 0) {
      setError('Por favor, avalie o prestador com pelo menos 1 estrela');
      return;
    }

    if (!comentario.trim()) {
      setError('Por favor, deixe um comentário sobre o serviço');
      return;
    }

    onConfirm({
      manterPublicado,
      avaliacao: {
        nota,
        comentario: comentario.trim(),
        aspectos: mostrarAspectos ? aspectos : undefined
      }
    });
  };

  const handleReset = () => {
    setNota(0);
    setComentario('');
    setAspectos({
      competencia: 0,
      pontualidade: 0,
      atendimento: 0,
      preco_qualidade: 0
    });
    setError('');
  };

  const handleClose = () => {
    handleReset();
    setManterPublicado(true);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Trabalho Concluído!</h2>
          </div>
          <p className="text-gray-600">
            O prestador <strong>{prestadorNome}</strong> marcou o serviço <strong>"{postTitulo}"</strong> como concluído.
            Confirme a conclusão e avalie o serviço.
          </p>
        </div>

        {/* Avaliação */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Avalie o prestador</h3>
          
          {/* Nota Geral */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nota Geral *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setNota(star);
                    setError('');
                  }}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= nota
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {nota > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {nota === 1 && 'Muito ruim'}
                {nota === 2 && 'Ruim'}
                {nota === 3 && 'Regular'}
                {nota === 4 && 'Bom'}
                {nota === 5 && 'Excelente'}
              </p>
            )}
          </div>

          {/* Comentário */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário *
            </label>
            <textarea
              value={comentario}
              onChange={(e) => {
                setComentario(e.target.value);
                setError('');
              }}
              rows={4}
              placeholder="Compartilhe sua experiência com este serviço..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Avaliação Detalhada (Opcional) */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setMostrarAspectos(!mostrarAspectos)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {mostrarAspectos ? 'Ocultar' : 'Mostrar'} avaliação detalhada (opcional)
            </button>

            {mostrarAspectos && (
              <div className="mt-3 space-y-3 p-3 bg-gray-50 rounded-lg">
                {[
                  { key: 'competencia', label: 'Competência Técnica' },
                  { key: 'pontualidade', label: 'Pontualidade' },
                  { key: 'atendimento', label: 'Atendimento' },
                  { key: 'preco_qualidade', label: 'Relação Preço/Qualidade' }
                ].map((aspect) => (
                  <div key={aspect.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {aspect.label}
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            setAspectos({
                              ...aspectos,
                              [aspect.key]: star
                            });
                          }}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= aspectos[aspect.key as keyof typeof aspectos]
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Opção de Visibilidade */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Visibilidade do Post</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibilidade"
                checked={manterPublicado}
                onChange={() => setManterPublicado(true)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Manter publicado</p>
                <p className="text-sm text-gray-600">
                  O post aparecerá em "Serviços Concluídos" com sua avaliação e comentário
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibilidade"
                checked={!manterPublicado}
                onChange={() => setManterPublicado(false)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900">Não manter publicado</p>
                <p className="text-sm text-gray-600">
                  O post será arquivado e não aparecerá publicamente, mas permanecerá no seu histórico
                </p>
              </div>
            </label>
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={nota === 0 || !comentario.trim()}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Conclusão
          </Button>
        </div>
      </div>
    </Modal>
  );
};
