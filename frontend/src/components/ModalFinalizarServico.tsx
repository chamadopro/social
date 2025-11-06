'use client';

import React, { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ModalFinalizarServicoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (fotos: string[]) => void;
  loading?: boolean;
  quemFinaliza: 'CLIENTE' | 'PRESTADOR';
}

export function ModalFinalizarServico({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading,
  quemFinaliza 
}: ModalFinalizarServicoProps) {
  const [fotos, setFotos] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFotos((prev) => [...prev, result]);
          setPreviews((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    onConfirm(fotos);
    setFotos([]);
    setPreviews([]);
  };

  const handleClose = () => {
    setFotos([]);
    setPreviews([]);
    onClose();
  };

  const mensagemLiberacao = quemFinaliza === 'CLIENTE'
    ? '✅ O pagamento será liberado IMEDIATAMENTE para o prestador.'
    : '⏰ O pagamento será liberado após o período configurado (padrão: 24h).';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Finalizar Serviço</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {mensagemLiberacao}
          </p>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            📸 <strong>Importante:</strong> Tire fotos do estado FINAL do serviço após concluído.
            Essas fotos são essenciais para comprovar a conclusão e para possíveis disputas.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos do Estado Final (Depois)
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
              Adicionar Fotos
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Você pode adicionar múltiplas fotos
            </p>
          </div>

          {previews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFoto(index)}
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
            onClick={handleConfirm}
            className="bg-orange-primary hover:bg-orange-dark text-white"
            disabled={loading}
          >
            {loading ? 'Finalizando...' : 'Confirmar Finalização'}
          </Button>
        </div>
      </div>
    </div>
  );
}

