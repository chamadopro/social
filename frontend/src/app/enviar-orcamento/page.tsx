'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Mic, Square } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function EnviarOrcamentoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToast();
  
  const postId = searchParams?.get('post');
  
  const [formData, setFormData] = useState({
    valor: '',
    prazo_execucao: '',
    descricao: '',
    condicoes_pagamento: '',
    garantia: '',
    desconto: '',
    observacoes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  // Ditado por voz
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const interimTextRef = useRef<string>('');

  function ensureRecognition() {
    if (recognitionRef.current) return recognitionRef.current;
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    
    const r = new SpeechRecognition();
    r.lang = 'pt-BR';
    r.interimResults = true;
    r.continuous = false; // Mudado para false - melhor para mobile
    
    r.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      
      // Atualizar texto final
      if (finalTranscript) {
        setFormData((prev) => ({ 
          ...prev, 
          descricao: (prev.descricao + ' ' + finalTranscript).trim() 
        }));
      }
      
      // Mostrar texto temporário (opcional)
      interimTextRef.current = interim;
    };
    
    r.onerror = (event: any) => {
      console.error('Erro no reconhecimento de voz:', event.error);
      setIsRecording(false);
      
      let errorMessage = 'Erro ao usar o microfone.';
      if (event.error === 'no-speech') {
        errorMessage = 'Nenhuma fala detectada. Tente novamente.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Não foi possível acessar o microfone. Verifique as permissões.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Permissão de microfone negada. Ative nas configurações do navegador.';
      } else if (event.error === 'aborted') {
        // Ignorar aborted - pode ser normal
        return;
      }
      
      addToast({ 
        type: 'error', 
        title: 'Erro no ditado', 
        description: errorMessage 
      });
    };
    
    r.onend = () => {
      setIsRecording(false);
      // Adicionar qualquer texto final que possa ter ficado
      if (interimTextRef.current) {
        setFormData((prev) => ({ 
          ...prev, 
          descricao: (prev.descricao + ' ' + interimTextRef.current).trim() 
        }));
        interimTextRef.current = '';
      }
    };
    
    recognitionRef.current = r;
    return r;
  }

  const startStopDictation = async () => {
    // Verificar se o navegador suporta
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast({ 
        type: 'info', 
        title: 'Ditado por voz', 
        description: 'Seu navegador não suporta ditado por voz. Use Chrome ou Edge.' 
      });
      return;
    }
    
    const r = ensureRecognition();
    if (!r) return;
    
    if (isRecording) {
      try {
        r.stop();
        setIsRecording(false);
        addToast({ 
          type: 'success', 
          title: 'Ditado finalizado', 
          description: 'Texto adicionado à descrição.' 
        });
      } catch (error) {
        console.error('Erro ao parar:', error);
        setIsRecording(false);
      }
    } else {
      try {
        // Solicitar permissão de microfone primeiro
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (permError: any) {
            if (permError.name === 'NotAllowedError') {
              addToast({ 
                type: 'error', 
                title: 'Permissão negada', 
                description: 'Ative o acesso ao microfone nas configurações do navegador.' 
              });
              return;
            }
          }
        }
        
        r.start();
        setIsRecording(true);
        addToast({ 
          type: 'success', 
          title: 'Gravando…', 
          description: 'Fale e o texto aparecerá na descrição.' 
        });
      } catch (error: any) {
        console.error('Erro ao iniciar:', error);
        setIsRecording(false);
        
        if (error.name === 'NotAllowedError') {
          addToast({ 
            type: 'error', 
            title: 'Permissão negada', 
            description: 'Ative o acesso ao microfone nas configurações do navegador.' 
          });
        } else {
          addToast({ 
            type: 'error', 
            title: 'Erro ao iniciar', 
            description: 'Não foi possível iniciar o ditado. Tente novamente.' 
          });
        }
      }
    }
  };

  useEffect(() => {
    // Carregar dados salvos do localStorage (se houver)
    const savedData = localStorage.getItem('pendingOrcamentoData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
      localStorage.removeItem('pendingOrcamentoData');
    }

    // Carregar dados do post se fornecido
    const loadPost = async () => {
      if (postId) {
        setIsLoadingPost(true);
        try {
          const response = await api.get<{ post: Post }>(`/posts/${postId}`);
          if (response.success && response.data) {
            setPost(response.data.post);
          }
        } catch (error) {
          console.error('Erro ao carregar post:', error);
        } finally {
          setIsLoadingPost(false);
        }
      }
    };

    loadPost();
  }, [postId]);

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

    if (!formData.valor.trim()) {
      newErrors.valor = 'Valor é obrigatório';
    } else if (isNaN(Number(formData.valor)) || Number(formData.valor) <= 0) {
      newErrors.valor = 'Valor inválido';
    }

    if (!formData.prazo_execucao.trim()) {
      newErrors.prazo_execucao = 'Prazo de execução é obrigatório';
    } else if (isNaN(Number(formData.prazo_execucao)) || Number(formData.prazo_execucao) <= 0) {
      newErrors.prazo_execucao = 'Prazo inválido (em dias)';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 20) {
      newErrors.descricao = 'Descrição deve ter pelo menos 20 caracteres';
    }

    if (!formData.condicoes_pagamento.trim()) {
      newErrors.condicoes_pagamento = 'Condições de pagamento são obrigatórias';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Se não autenticado, salvar dados e solicitar login
    if (!isAuthenticated) {
      localStorage.setItem('pendingOrcamentoData', JSON.stringify(formData));
      localStorage.setItem('pendingOrcamentoPostId', postId || '');
      
      addToast({
        type: 'info',
        title: 'Login necessário',
        description: 'Você precisa fazer login para enviar o orçamento',
      });
      
      router.push('/login');
      return;
    }

    // Se autenticado, mostrar modal de pagamento
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!postId || !post || !user) {
      addToast({
        type: 'error',
        title: 'Erro',
        description: 'Dados insuficientes para enviar o orçamento',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Calcular cliente_id do post
      const cliente_id = post.usuario_id;

      const orcamentoData = {
        post_id: postId,
        prestador_id: user.id,
        cliente_id,
        valor: Number(formData.valor),
        descricao: formData.descricao,
        prazo_execucao: Number(formData.prazo_execucao),
        condicoes_pagamento: formData.condicoes_pagamento,
        garantia: formData.garantia || undefined,
        desconto: formData.desconto ? Number(formData.desconto) : undefined,
        observacoes: formData.observacoes || undefined,
        pagamento_mock: true,
      };

      // Chamada real para criação de orçamento (com mock de pagamento)
      const response = await api.post('/orcamentos', orcamentoData);
      if (!response.success) {
        throw new Error(response.message || 'Falha ao criar orçamento');
      }

      addToast({
        type: 'success',
        title: 'Orçamento enviado!',
        description: 'Seu orçamento foi enviado com sucesso',
      });

      setShowPaymentModal(false);
      router.push('/');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar orçamento',
        description: error.message || 'Tente novamente',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Enviar Orçamento
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Preencha os dados do orçamento abaixo
              </p>
            </div>
          </div>
        </div>

        {/* Card do Cliente (se houver post) */}
        {post && post.usuario && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-orange-50 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  src={post.usuario.foto_perfil}
                  name={post.usuario.nome}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.usuario.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Cliente
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" size="sm">
                      {post.categoria}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {post.titulo}
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-gray-500 mb-1">Enviando orçamento para:</p>
                <p className="font-medium text-gray-900">{post.titulo}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Valor e Prazo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Valor do orçamento"
                  name="valor"
                  value={formData.valor}
                  onChange={handleChange}
                  error={errors.valor}
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Input
                  label="Prazo de execução (dias)"
                  name="prazo_execucao"
                  value={formData.prazo_execucao}
                  onChange={handleChange}
                  error={errors.prazo_execucao}
                  placeholder="Ex: 7"
                  type="number"
                  required
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
              <span>Descrição detalhada do orçamento *</span>
              <button
                type="button"
                onClick={startStopDictation}
                className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium ${isRecording ? 'text-red-600' : 'text-gray-600'} hover:text-gray-900`}
                title={isRecording ? 'Parar ditado' : 'Ditado por voz'}
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? 'Parar' : 'Ditado'}
              </button>
            </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                placeholder="Descreva detalhadamente o que será realizado, materiais que serão utilizados, metodologia de trabalho, etc."
                required
              />
              {errors.descricao && (
                <p className="text-sm text-red-500 mt-1">{errors.descricao}</p>
              )}
            </div>

            {/* Condições de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condições de pagamento *
              </label>
              <textarea
                name="condicoes_pagamento"
                value={formData.condicoes_pagamento}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                placeholder="Ex: 50% no início + 50% na conclusão"
                required
              />
              {errors.condicoes_pagamento && (
                <p className="text-sm text-red-500 mt-1">{errors.condicoes_pagamento}</p>
              )}
            </div>

            {/* Garantia e Desconto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Garantia (opcional)"
                  name="garantia"
                  value={formData.garantia}
                  onChange={handleChange}
                  error={errors.garantia}
                  placeholder="Ex: 90 dias"
                />
              </div>
              <div>
                <Input
                  label="Desconto % (opcional)"
                  name="desconto"
                  value={formData.desconto}
                  onChange={handleChange}
                  error={errors.desconto}
                  placeholder="Ex: 10"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações adicionais (opcional)
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                placeholder="Informações adicionais, restrições, horários preferenciais, etc."
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="sm:flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Orçamento'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Modal de Pagamento */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Taxa de envio de orçamento"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Para enviar este orçamento, é necessário pagar uma taxa de <strong>R$ 10,00</strong>.
          </p>
          <p className="text-sm text-gray-600">
            Esta taxa garante que apenas propostas sérias sejam enviadas aos clientes.
          </p>
          
          {/* Mensagem de orientação sobre transações na plataforma */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              💡 Importante:
            </p>
            <p className="text-sm text-blue-800">
              Para garantir sua segurança e a do cliente, <strong>realize toda a transação comercial pela plataforma ChamadoPro</strong>. 
              Isso inclui pagamentos, contratos e comunicação, garantindo proteção e rastreabilidade para ambas as partes.
            </p>
          </div>

          {/* TODO: Integrar com gateway de pagamento */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>Nota:</strong> A integração com o gateway de pagamento será implementada em breve. 
              Por enquanto, o pagamento será simulado.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handlePayment}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Processando...' : 'Pagar e Enviar'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

