'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';

interface ModalAbrirDisputaProps {
  isOpen: boolean;
  onClose: () => void;
  contratoId: string;
  onSuccess: () => void;
}

const TIPOS_DISPUTA = [
  { value: 'SERVICO_INCOMPLETO', label: 'Serviço Incompleto' },
  { value: 'QUALIDADE_INFERIOR', label: 'Qualidade Inferior' },
  { value: 'MATERIAL_DIFERENTE', label: 'Material Diferente' },
  { value: 'ATRASO_EXCESSIVO', label: 'Atraso Excessivo' },
  { value: 'COMPORTAMENTO_INADEQUADO', label: 'Comportamento Inadequado' },
];

export function ModalAbrirDisputa({ isOpen, onClose, contratoId, onSuccess }: ModalAbrirDisputaProps) {
  const [tipo, setTipo] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setEvidencias((prev) => [...prev, result]);
          setPreviews((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeEvidencia = (index: number) => {
    setEvidencias((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!tipo) {
      addToast({
        type: 'error',
        message: 'Selecione o tipo de disputa'
      });
      return;
    }

    if (!descricao.trim() || descricao.trim().length < 10) {
      addToast({
        type: 'error',
        message: 'A descrição deve ter no mínimo 10 caracteres'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/disputas', {
        contrato_id: contratoId,
        tipo,
        descricao: descricao.trim(),
        evidencias
      });

      if (response.success) {
        addToast({
          type: 'success',
          message: 'Disputa aberta com sucesso. Nossa equipe irá analisar em breve.'
        });
        handleClose();
        onSuccess();
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao abrir disputa'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTipo('');
    setDescricao('');
    setEvidencias([]);
    setPreviews([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Abrir Disputa</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">⚠️ Atenção:</p>
              <p>A disputa só pode ser aberta se o pagamento foi feito pela plataforma ChamadoPro.</p>
              <p className="mt-1">Serviços fechados fora da plataforma não têm garantia da ChamadoPro.</p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Disputa *
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary"
          >
            <option value="">Selecione o tipo...</option>
            {TIPOS_DISPUTA.map((tipoOption) => (
              <option key={tipoOption.value} value={tipoOption.value}>
                {tipoOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Disputa * (mínimo 10 caracteres)
          </label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-orange-primary"
            placeholder="Descreva detalhadamente o problema encontrado..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {descricao.length} / 10 caracteres mínimos
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evidências (Fotos)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Evidências
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Adicione fotos que comprovem o problema
            </p>
          </div>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Evidência ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeEvidencia(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={loading || !tipo || descricao.trim().length < 10}
          >
            {loading ? 'Abrindo...' : 'Abrir Disputa'}
          </Button>
        </div>
      </div>
    </div>
  );
}

