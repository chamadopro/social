'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/use-toast';
import { Star, ThumbsUp, Clock, DollarSign, MessageCircle, Award } from 'lucide-react';

interface AvaliacaoFormProps {
  contratoId: string;
  avaliadoId: string;
  avaliadoNome: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AvaliacaoForm: React.FC<AvaliacaoFormProps> = ({
  contratoId,
  avaliadoId,
  avaliadoNome,
  onSuccess,
  onCancel
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [aspectos, setAspectos] = useState({
    pontualidade: 0,
    qualidade: 0,
    comunicacao: 0,
    preco: 0,
    limpeza: 0,
    profissionalismo: 0
  });

  const aspectosLabels = {
    pontualidade: 'Pontualidade',
    qualidade: 'Qualidade do Serviço',
    comunicacao: 'Comunicação',
    preco: 'Relação Preço/Qualidade',
    limpeza: 'Limpeza',
    profissionalismo: 'Profissionalismo'
  };

  const handleNotaChange = (novaNota: number) => {
    setNota(novaNota);
  };

  const handleAspectoChange = (aspecto: string, valor: number) => {
    setAspectos(prev => ({
      ...prev,
      [aspecto]: valor
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nota === 0) {
      toast({
        title: 'Nota Obrigatória',
        description: 'Por favor, selecione uma nota de 1 a 5 estrelas.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          avaliado_id: avaliadoId,
          contrato_id: contratoId,
          nota,
          comentario: comentario.trim() || undefined,
          aspectos: Object.keys(aspectos).reduce((acc, key) => {
            if (aspectos[key as keyof typeof aspectos] > 0) {
              acc[key] = aspectos[key as keyof typeof aspectos];
            }
            return acc;
          }, {} as Record<string, number>)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao enviar avaliação');
      }

      toast({
        title: 'Avaliação Enviada!',
        description: 'Sua avaliação foi registrada com sucesso.',
      });

      onSuccess?.();

    } catch (error: any) {
      toast({
        title: 'Erro ao Enviar Avaliação',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StarRating = ({ value, onChange, size = 'md' }: { 
    value: number; 
    onChange: (value: number) => void; 
    size?: 'sm' | 'md' | 'lg' 
  }) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8'
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${sizeClasses[size]} transition-colors ${
              star <= value 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className="h-full w-full" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Avaliar {avaliadoNome}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Sua avaliação ajuda outros usuários a conhecer a qualidade do serviço.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nota Geral */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nota Geral *
            </label>
            <div className="flex items-center gap-4">
              <StarRating value={nota} onChange={handleNotaChange} size="lg" />
              <span className="text-lg font-semibold text-gray-700">
                {nota > 0 ? `${nota} estrela${nota > 1 ? 's' : ''}` : 'Selecione uma nota'}
              </span>
            </div>
          </div>

          {/* Aspectos Específicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Aspectos Específicos (Opcional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(aspectosLabels).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm text-gray-600">{label}</label>
                  <StarRating 
                    value={aspectos[key as keyof typeof aspectos]} 
                    onChange={(value) => handleAspectoChange(key, value)} 
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Comentário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentário (Opcional)
            </label>
            <Textarea
              value={comentario}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComentario(e.target.value)}
              placeholder="Conte sua experiência com este profissional..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comentario.length}/500 caracteres
            </p>
          </div>

          {/* Dicas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Dicas para uma boa avaliação:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Seja específico sobre o que gostou ou não gostou</li>
              <li>• Mencione aspectos como pontualidade, qualidade e comunicação</li>
              <li>• Evite comentários pessoais ou ofensivos</li>
              <li>• Sua avaliação será pública e visível para outros usuários</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || nota === 0}
              className="min-w-[120px]"
            >
              {isLoading ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AvaliacaoForm;


