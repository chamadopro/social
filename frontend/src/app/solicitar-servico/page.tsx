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
import { ArrowLeft, Mic, Square, Upload } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

export default function SolicitarServicoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToast();
  
  const postId = searchParams?.get('post');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    endereco: '',
    prazo: '',
    valor_estimado: '',
    fotos: [] as File[],
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        fotos: [...prev.fotos, ...newFiles].slice(0, 5), // Máximo 5 fotos
      }));
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    } else if (formData.descricao.length < 20) {
      newErrors.descricao = 'Descrição deve ter pelo menos 20 caracteres';
    }

    if (!formData.endereco.trim()) {
      newErrors.endereco = 'Endereço é obrigatório';
    }

    if (!formData.prazo.trim()) {
      newErrors.prazo = 'Prazo é obrigatório';
    }

    if (formData.valor_estimado && (isNaN(Number(formData.valor_estimado)) || Number(formData.valor_estimado) <= 0)) {
      newErrors.valor_estimado = 'Valor estimado inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Se não autenticado, solicitar login/cadastro
    if (!isAuthenticated) {
      // Salvar dados no localStorage temporariamente
      localStorage.setItem('pendingServiceRequest', JSON.stringify(formData));
      localStorage.setItem('targetPostId', postId || '');
      
      addToast({
        type: 'info',
        title: 'Login necessário',
        description: 'Você precisa fazer login para enviar a solicitação',
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
        description: 'Dados insuficientes para enviar a solicitação',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const solicitacaoData = {
        post_id: postId,
        prestador_id: post.usuario_id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        endereco: formData.endereco,
        prazo: formData.prazo,
        valor_estimado: formData.valor_estimado || undefined,
        pagamento_mock: true,
      };

      const response = await api.post('/solicitacoes', solicitacaoData);
      if (!response.success) {
        throw new Error(response.message || 'Falha ao criar solicitação');
      }

      addToast({
        type: 'success',
        title: 'Solicitação enviada!',
        description: 'O prestador foi notificado e entrará em contato em breve.',
      });

      setShowPaymentModal(false);
      router.push('/');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar solicitação',
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
                Solicitar Serviço
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Preencha os dados abaixo para solicitar um serviço
              </p>
            </div>
          </div>
        </div>

        {/* Card do Prestador (se houver post) */}
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
                    Prestador de Serviços
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
                <p className="text-xs text-gray-500 mb-1">Está solicitando serviço para:</p>
                <p className="font-medium text-gray-900">{post.titulo}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <Input
                label="Título da solicitação"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                error={errors.titulo}
                placeholder="Ex: Reparo urgente de vazamento"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                <span>Descrição detalhada do serviço *</span>
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
                placeholder="Descreva detalhadamente o serviço necessário, incluindo características, dimensões, problemas específicos, etc."
                required
              />
              {errors.descricao && (
                <p className="text-sm text-red-500 mt-1">{errors.descricao}</p>
              )}
            </div>

            {/* Endereço */}
            <div>
              <Input
                label="Endereço onde será realizado o serviço"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                error={errors.endereco}
                placeholder="Rua, número, bairro - Cidade/Estado"
                required
              />
            </div>

            {/* Prazo e Valor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Prazo desejado"
                  name="prazo"
                  value={formData.prazo}
                  onChange={handleChange}
                  error={errors.prazo}
                  placeholder="Ex: 7 dias, 1 semana"
                  required
                />
              </div>
              <div>
                <Input
                  label="Valor estimado (opcional)"
                  name="valor_estimado"
                  value={formData.valor_estimado}
                  onChange={handleChange}
                  error={errors.valor_estimado}
                  placeholder="0,00"
                  type="number"
                />
              </div>
            </div>

            {/* Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos do problema/serviço
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="foto-upload"
                />
                <label
                  htmlFor="foto-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Clique para adicionar fotos ou arraste e solte
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo 5 fotos (JPG, PNG)
                  </p>
                </label>
              </div>

              {/* Fotos pré-visualização */}
              {formData.fotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {formData.fotos.map((foto, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(foto)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Modal de Pagamento */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Taxa de Lead Quente"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Para enviar esta solicitação de orçamento, é necessário pagar uma taxa de <strong>R$ 15,00</strong>.
          </p>
          <p className="text-sm text-gray-600">
            Esta taxa é aplicada porque você está solicitando um orçamento diretamente ao prestador, caracterizando um <strong>lead quente</strong> com alta probabilidade de conversão.
          </p>
          
          {/* Mensagem de orientação sobre transações na plataforma */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              💡 Importante:
            </p>
            <p className="text-sm text-blue-800">
              Para garantir sua segurança e a do prestador, <strong>realize toda a transação comercial pela plataforma ChamadoPro</strong>. 
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

