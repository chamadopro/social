import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOrcamentosStore } from '@/store/orcamentos';
import { useToast } from '@/components/ui/Toast';
import { DollarSign, Clock, FileText, Shield, Percent, Upload } from 'lucide-react';

interface CriarOrcamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitulo: string;
}

export const CriarOrcamentoModal: React.FC<CriarOrcamentoModalProps> = ({
  isOpen,
  onClose,
  postId,
  postTitulo,
}) => {
  const { createOrcamento, isLoading } = useOrcamentosStore();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    valor: '',
    descricao: '',
    prazo_execucao: '',
    condicoes_pagamento: '',
    garantia: '',
    desconto: '',
    fotos: [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.valor) {
      newErrors.valor = 'Valor é obrigatório';
    } else if (isNaN(Number(formData.valor)) || Number(formData.valor) <= 0) {
      newErrors.valor = 'Valor deve ser um número positivo';
    }

    if (!formData.descricao) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 10) {
      newErrors.descricao = 'Descrição deve ter pelo menos 10 caracteres';
    }

    if (!formData.prazo_execucao) {
      newErrors.prazo_execucao = 'Prazo de execução é obrigatório';
    } else if (isNaN(Number(formData.prazo_execucao)) || Number(formData.prazo_execucao) <= 0) {
      newErrors.prazo_execucao = 'Prazo deve ser um número positivo';
    }

    if (!formData.condicoes_pagamento) {
      newErrors.condicoes_pagamento = 'Condições de pagamento são obrigatórias';
    }

    if (formData.desconto && (isNaN(Number(formData.desconto)) || Number(formData.desconto) < 0 || Number(formData.desconto) > 100)) {
      newErrors.desconto = 'Desconto deve ser um número entre 0 e 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createOrcamento({
        post_id: postId,
        valor: Number(formData.valor),
        descricao: formData.descricao,
        prazo_execucao: Number(formData.prazo_execucao),
        condicoes_pagamento: formData.condicoes_pagamento,
        garantia: formData.garantia || undefined,
        desconto: formData.desconto ? Number(formData.desconto) : undefined,
        fotos: formData.fotos,
        pagamento_mock: true,
      });
      
      addToast({
        type: 'success',
        title: 'Orçamento enviado!',
        description: 'Seu orçamento foi enviado com sucesso',
      });
      
      onClose();
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar orçamento',
        description: error.message || 'Tente novamente',
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Implementar upload de arquivos
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Enviar Orçamento - ${postTitulo}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Valor */}
        <div>
          <Input
            label="Valor do serviço"
            type="number"
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            error={errors.valor}
            placeholder="0,00"
            required
            helperText="Digite o valor em reais"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição do serviço *
          </label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descreva detalhadamente o serviço que será prestado..."
            required
          />
          {errors.descricao && (
            <p className="text-sm text-red-500 mt-1">{errors.descricao}</p>
          )}
        </div>

        {/* Prazo e Condições */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prazo de execução (dias)"
            type="number"
            name="prazo_execucao"
            value={formData.prazo_execucao}
            onChange={handleChange}
            error={errors.prazo_execucao}
            placeholder="30"
            required
          />
          <Input
            label="Desconto (%)"
            type="number"
            name="desconto"
            value={formData.desconto}
            onChange={handleChange}
            error={errors.desconto}
            placeholder="0"
            min="0"
            max="100"
          />
        </div>

        {/* Condições de pagamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condições de pagamento *
          </label>
          <textarea
            name="condicoes_pagamento"
            value={formData.condicoes_pagamento}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 50% na contratação e 50% na conclusão do serviço"
            required
          />
          {errors.condicoes_pagamento && (
            <p className="text-sm text-red-500 mt-1">{errors.condicoes_pagamento}</p>
          )}
        </div>

        {/* Garantia */}
        <div>
          <Input
            label="Garantia"
            name="garantia"
            value={formData.garantia}
            onChange={handleChange}
            placeholder="Ex: 90 dias de garantia para defeitos de material"
            helperText="Opcional - Descreva a garantia oferecida"
          />
        </div>

        {/* Upload de fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos do serviço
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste e solte as fotos aqui ou clique para selecionar
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="foto-upload"
            />
            <label
              htmlFor="foto-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Selecionar Fotos
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Máximo 5 fotos, até 5MB cada
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            Enviar Orçamento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

