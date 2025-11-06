'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/components/ui/Toast';
import { api } from '@/services/api';
import { ArrowLeft, Upload, X, Mic, Square } from 'lucide-react';
import { ImageCropper } from '@/components/ImageCropper';
import { CategorySelector } from '@/components/CategorySelector';

type PostType = 'SOLICITACAO' | 'OFERTA' | 'VITRINE_PRESTADOR' | 'VITRINE_CLIENTE';

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, user, temClienteAssociado } = useAuthStore();
  const { addToast } = useToast();
  
  // Definir tipo padrão baseado no perfil do usuário
  const getDefaultTipo = (): PostType => {
    if (user?.tipo === 'CLIENTE') return 'SOLICITACAO';
    if (user?.tipo === 'PRESTADOR') return 'OFERTA';
    return 'VITRINE_CLIENTE';
  };

  const [tipoPost, setTipoPost] = useState<PostType>(getDefaultTipo());
  const isVitrine = tipoPost === 'VITRINE_PRESTADOR' || tipoPost === 'VITRINE_CLIENTE';
  const isHybrid = user?.tipo === 'PRESTADOR' && (temClienteAssociado || (user as any)?.temClienteAssociado);
  
  const [formData, setFormData] = useState({
    titulo: '',
    categoria: '',
    descricao: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    latitude: '',
    longitude: '',
    preco_estimado: '',
    prazo: '',
    urgencia: 'BAIXA' as 'BAIXA' | 'MEDIA' | 'ALTA',
    disponibilidade: '',
    fotos: [] as File[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [cropSrc, setCropSrc] = useState<string>('');
  const [pendingAfterCover, setPendingAfterCover] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState<number | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Speech-to-text (Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [supportsSpeech, setSupportsSpeech] = useState(false);
  const [speechFinished, setSpeechFinished] = useState(false);
  const [textConfirmed, setTextConfirmed] = useState(false);
  const recognitionRef = React.useRef<any>(null);
  const interimTextRef = React.useRef<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    // Atualizar tipo padrão se usuário mudar
    setTipoPost(getDefaultTipo());
  }, [isAuthenticated, user, router]);

  // Verificar suporte a Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      setSupportsSpeech(true);
    }
  }, []);

  // Função para garantir que o recognition está configurado
  function ensureRecognition() {
    if (recognitionRef.current) {
      return recognitionRef.current;
    }
    
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return null;
    }
    
    const r = new SpeechRecognition();
    r.lang = 'pt-BR';
    r.interimResults = true;
    r.continuous = false; // Mudado para false para melhor compatibilidade mobile
    
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
      setIsListening(false);
      
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
      setIsListening(false);
      // Adicionar qualquer texto final que possa ter ficado
      if (interimTextRef.current) {
        setFormData((prev) => ({ 
          ...prev, 
          descricao: (prev.descricao + ' ' + interimTextRef.current).trim() 
        }));
        interimTextRef.current = '';
      }
      setSpeechFinished(true);
      setTextConfirmed(false);
    };
    
    recognitionRef.current = r;
    return r;
  }

  const toggleListening = async () => {
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
    
    if (isListening) {
      try {
        r.stop();
        setIsListening(false);
        addToast({ 
          type: 'success', 
          title: 'Ditado finalizado', 
          description: 'Texto adicionado à descrição.' 
        });
      } catch (error) {
        console.error('Erro ao parar:', error);
        setIsListening(false);
      }
    } else {
      let mediaStream: MediaStream | null = null;
      
      try {
        // Solicitar permissão de microfone primeiro (isso vai mostrar o popup do navegador)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            // Esta chamada vai mostrar o popup de permissão do navegador
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
              } 
            });
            
            // Fechar o stream imediatamente - só precisamos da permissão, não do stream
            // O Speech Recognition vai usar sua própria conexão
            if (mediaStream) {
              mediaStream.getTracks().forEach(track => track.stop());
            }
            
            addToast({ 
              type: 'success', 
              title: 'Permissão concedida', 
              description: 'Iniciando gravação...' 
            });
          } catch (permError: any) {
            console.error('Erro ao solicitar permissão:', permError);
            
            let errorMessage = 'Não foi possível acessar o microfone.';
            let errorTitle = 'Erro de permissão';
            
            if (permError.name === 'NotAllowedError' || permError.name === 'PermissionDeniedError') {
              errorTitle = 'Permissão negada';
              errorMessage = 'Você negou o acesso ao microfone. Para usar o ditado por voz:\n\n' +
                '1. Clique no ícone de cadeado na barra de endereço\n' +
                '2. Permita o acesso ao microfone\n' +
                '3. Recarregue a página e tente novamente';
            } else if (permError.name === 'NotFoundError' || permError.name === 'DevicesNotFoundError') {
              errorTitle = 'Microfone não encontrado';
              errorMessage = 'Nenhum microfone foi detectado. Verifique se há um microfone conectado.';
            } else if (permError.name === 'NotReadableError' || permError.name === 'TrackStartError') {
              errorTitle = 'Microfone em uso';
              errorMessage = 'O microfone está sendo usado por outro aplicativo. Feche outros aplicativos e tente novamente.';
            } else if (permError.name === 'OverconstrainedError' || permError.name === 'ConstraintNotSatisfiedError') {
              errorTitle = 'Configuração não suportada';
              errorMessage = 'Seu microfone não suporta as configurações necessárias.';
            }
            
            addToast({ 
              type: 'error', 
              title: errorTitle, 
              description: errorMessage 
            });
            return;
          }
        } else {
          // Navegador não suporta getUserMedia
          addToast({ 
            type: 'error', 
            title: 'Navegador não suportado', 
            description: 'Seu navegador não suporta acesso ao microfone. Use Chrome, Edge ou Firefox atualizado.' 
          });
          return;
        }
        
        // Iniciar Speech Recognition após permissão concedida
        try {
          r.start();
          setIsListening(true);
          setSpeechFinished(false);
          setTextConfirmed(false);
          addToast({ 
            type: 'success', 
            title: 'Gravando…', 
            description: 'Fale agora! O texto aparecerá na descrição em tempo real.' 
          });
        } catch (startError: any) {
          console.error('Erro ao iniciar Speech Recognition:', startError);
          setIsListening(false);
          
          addToast({ 
            type: 'error', 
            title: 'Erro ao iniciar gravação', 
            description: 'Não foi possível iniciar o reconhecimento de voz. Tente novamente.' 
          });
        }
      } catch (error: any) {
        console.error('Erro geral:', error);
        setIsListening(false);
        
        // Garantir que o stream seja fechado em caso de erro
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
        }
        
        addToast({ 
          type: 'error', 
          title: 'Erro inesperado', 
          description: 'Ocorreu um erro ao tentar usar o microfone. Tente novamente ou recarregue a página.' 
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'descricao' && speechFinished) setTextConfirmed(false);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (formData.fotos.length === 0) {
      const [first, ...rest] = files;
      const src = URL.createObjectURL(first);
      setCropSrc(src);
      setPendingAfterCover(rest);
      setShowCropper(true);
      return;
    }

    setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...files] }));
  };

  const handleCoverCropped = (file: File) => {
    if (cropIndex !== null) {
      setFormData(prev => {
        const updated = [...prev.fotos];
        updated[cropIndex] = file;
        return { ...prev, fotos: updated };
      });
      setCropIndex(null);
    } else {
      setFormData(prev => ({ ...prev, fotos: [file, ...pendingAfterCover] }));
      setPendingAfterCover([]);
    }
    setShowCropper(false);
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc('');
  };

  const openCropForIndex = (index: number) => {
    const target = formData.fotos[index];
    if (!target) return;
    const src = URL.createObjectURL(target);
    setCropSrc(src);
    setCropIndex(index);
    setShowCropper(true);
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Título e Categoria obrigatórios apenas para SOLICITACAO e OFERTA
    if (!isVitrine) {
      if (!formData.titulo.trim()) newErrors.titulo = 'Título é obrigatório';
      if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    }
    
    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    
    // Localização obrigatória apenas para SOLICITACAO e OFERTA
    if (!isVitrine) {
      if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
      if (!formData.rua.trim()) newErrors.rua = 'Rua é obrigatória';
      if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
      if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
      if (!formData.cidade.trim()) newErrors.cidade = 'Cidade é obrigatória';
      if (!formData.estado.trim()) newErrors.estado = 'Estado é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      addToast({ type: 'error', title: 'Erro de validação', description: 'Por favor, preencha todos os campos obrigatórios' });
      return;
    }

    if (speechFinished && !textConfirmed) {
      addToast({ type: 'error', title: 'Confirmação necessária', description: 'Revise o texto ditado e clique em "Confirmar texto".' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData: any = {
        tipo: tipoPost,
        descricao: formData.descricao,
        preco_estimado: formData.preco_estimado ? parseFloat(formData.preco_estimado) : null,
        prazo: formData.prazo || null,
        fotos: formData.fotos.map(f => URL.createObjectURL(f)),
      };

      // Título e Categoria apenas para SOLICITACAO e OFERTA
      if (!isVitrine) {
        postData.titulo = formData.titulo;
        postData.categoria = formData.categoria;
      } else {
        // Para Vitrine, título e categoria podem ser vazios
        if (formData.titulo.trim()) postData.titulo = formData.titulo.trim();
        if (formData.categoria) postData.categoria = formData.categoria;
      }

      // Menções desativadas (MentionsInput removido)

      // Localização apenas para SOLICITACAO e OFERTA
      if (!isVitrine) {
        postData.localizacao = {
          endereco: `${formData.rua}, ${formData.numero} - ${formData.bairro}`,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
        };
        postData.urgencia = tipoPost === 'SOLICITACAO' ? formData.urgencia : undefined;
        postData.disponibilidade = tipoPost === 'OFERTA' ? formData.disponibilidade || null : null;
      }

      const response = await api.post('/posts', postData);
      
      if (response.success) {
        addToast({ type: 'success', title: 'Sucesso!', description: 'Post criado com sucesso!' });
        router.push('/');
      }
    } catch (error) {
      console.error('Erro ao criar post:', error);
      addToast({ type: 'error', title: 'Erro', description: 'Erro ao criar post. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTipoTitle = () => {
    switch (tipoPost) {
      case 'SOLICITACAO': return 'Criar Solicitação';
      case 'OFERTA': return 'Criar Oferta';
      case 'VITRINE_CLIENTE': return 'Criar Vitrine (Cliente)';
      case 'VITRINE_PRESTADOR': return 'Criar Vitrine (Prestador)';
      default: return 'Criar Post';
    }
  };

  const getTipoDescription = () => {
    switch (tipoPost) {
      case 'SOLICITACAO': return 'Publique sua necessidade de serviço';
      case 'OFERTA': return 'Divulgue seus serviços';
      case 'VITRINE_CLIENTE': return 'Apresente-se como cliente (portfólio e preferências)';
      case 'VITRINE_PRESTADOR': return 'Apresente sua vitrine de serviços como prestador';
      default: return '';
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-0">
        {/* Header */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {getTipoTitle()}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {getTipoDescription()}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Seletor de Tipo de Post */}
            <div className="border-b pb-4 sm:pb-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Tipo de Post</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Botão Solicitação de Serviço (Laranja) - Cliente e Híbrido */}
                {(user?.tipo === 'CLIENTE' || isHybrid) && (
                  <button
                    type="button"
                    onClick={() => setTipoPost('SOLICITACAO')}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all touch-manipulation ${
                      tipoPost === 'SOLICITACAO'
                        ? 'bg-orange-600 text-white shadow-lg'
                        : 'bg-orange-50 text-orange-700 border-2 border-orange-200 hover:bg-orange-100'
                    }`}
                  >
                    <span className="block sm:hidden">Solicitar</span>
                    <span className="hidden sm:block">Solicitação de Serviço</span>
                  </button>
                )}

                {/* Botão Oferta de Serviço (Azul) - Prestador (inclui híbrido) */}
                {user?.tipo === 'PRESTADOR' && (
                  <button
                    type="button"
                    onClick={() => setTipoPost('OFERTA')}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all touch-manipulation ${
                      tipoPost === 'OFERTA'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <span className="block sm:hidden">Ofertar</span>
                    <span className="hidden sm:block">Oferta de Serviço</span>
                  </button>
                )}

                {/* Botão Vitrine Cliente (sempre disponível) */}
                <button
                  type="button"
                  onClick={() => setTipoPost('VITRINE_CLIENTE')}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all touch-manipulation ${
                    tipoPost === 'VITRINE_CLIENTE'
                      ? 'bg-violet-700 text-white shadow-lg'
                      : 'bg-violet-50 text-violet-700 border-2 border-violet-200 hover:bg-violet-100'
                  }`}
                >
                  <span className="block sm:hidden">Vitrine Cliente</span>
                  <span className="hidden sm:block">Vitrine Cliente</span>
                </button>

                {/* Botão Vitrine Prestador (sempre disponível) */}
                <button
                  type="button"
                  onClick={() => setTipoPost('VITRINE_PRESTADOR')}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all touch-manipulation ${
                    tipoPost === 'VITRINE_PRESTADOR'
                      ? 'bg-emerald-700 text-white shadow-lg'
                      : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="block sm:hidden">Vitrine Prestador</span>
                  <span className="hidden sm:block">Vitrine Prestador</span>
                </button>
              </div>
            </div>

            {/* Informações Básicas */}
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Informações Básicas</h2>
              
              <div className="space-y-4">
                {/* Categoria primeiro (botão que abre modal) - apenas para SOLICITACAO e OFERTA */}
                {!isVitrine && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {formData.categoria ? (
                        <span className="inline-flex items-center gap-2 text-gray-800">
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{formData.categoria}</span>
                          <span className="text-xs text-gray-500">(alterar)</span>
                        </span>
                      ) : (
                        <span className="text-gray-500">Selecionar categoria…</span>
                      )}
                    </button>
                    {errors.categoria && (
                      <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
                    )}
                  </div>
                )}

                {/* Título - Apenas para SOLICITACAO e OFERTA */}
                {!isVitrine && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <Input
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleChange}
                      placeholder="Ex: Preciso de encanador"
                      error={errors.titulo}
                    />
                  </div>
                )}

                <div className={`grid gap-4 ${isVitrine ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
                  {tipoPost === 'SOLICITACAO' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urgência
                      </label>
                      <select
                        name="urgencia"
                        value={formData.urgencia}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="BAIXA">Baixa</option>
                        <option value="MEDIA">Média</option>
                        <option value="ALTA">Alta</option>
                      </select>
                    </div>
                  )}

                  {tipoPost === 'OFERTA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Disponibilidade
                      </label>
                      <select
                        name="disponibilidade"
                        value={formData.disponibilidade}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        <option value="COMERCIAL_8_5">Comercial (8h às 17h)</option>
                        <option value="FLEXIVEL">Flexível</option>
                        <option value="FINAL_SEMANA">Finais de semana</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Descrição *
                    </label>
                    {supportsSpeech && (
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`relative px-3 sm:px-4 py-2 rounded-lg border flex items-center gap-2 transition-all touch-manipulation ${
                          isListening 
                            ? 'bg-red-600 text-white border-red-700 shadow-lg' 
                            : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                        title={isListening ? 'Parar gravação' : 'Iniciar ditado por voz (pt-BR)'}
                      >
                        {isListening ? (
                          <>
                            {/* Indicador de gravação animado */}
                            <span className="absolute left-1.5 top-1.5 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                            <Square className="h-4 w-4 relative z-10" />
                          </>
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                          {isListening ? 'Parar' : 'Ditado'}
                        </span>
                        {isListening && (
                          <span className="text-xs font-medium sm:hidden">Parar</span>
                        )}
                      </button>
                    )}
                  </div>
                  <textarea
                    name="descricao"
                    value={formData.descricao + (isListening && interimTextRef.current ? ' ' + interimTextRef.current : '')}
                    onChange={(e) => {
                      // Remover texto temporário se estiver editando manualmente
                      const value = e.target.value.replace(interimTextRef.current, '');
                      setFormData(prev => ({ ...prev, descricao: value }));
                      if (speechFinished) setTextConfirmed(false);
                      if (errors.descricao) setErrors(prev => ({ ...prev, descricao: '' }));
                    }}
                    placeholder={isListening ? "Fale agora... (o texto aparecerá aqui)" : "Descreva detalhadamente..."}
                    rows={5}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      isListening ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.descricao && (
                    <p className="text-sm text-red-600 mt-1">{errors.descricao}</p>
                  )}
                  {speechFinished && !textConfirmed && (
                    <div className="mt-2 text-sm bg-yellow-50 text-yellow-800 border border-yellow-200 rounded px-3 py-2 flex items-center justify-between">
                      <span>Ditado finalizado. Revise o texto acima e confirme se está correto.</span>
                      <button type="button" className="ml-3 px-2 py-1 text-xs border rounded" onClick={() => setTextConfirmed(true)}>Confirmar texto</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Localização - Apenas para SOLICITACAO e OFERTA */}
            {!isVitrine && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Localização</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP *
                    </label>
                    <Input
                      name="cep"
                      value={formData.cep}
                      onChange={handleChange}
                      placeholder="00000-000"
                      error={errors.cep}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <Input
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      placeholder="SP"
                      error={errors.estado}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <Input
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="São Paulo"
                      error={errors.cidade}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua *
                    </label>
                    <Input
                      name="rua"
                      value={formData.rua}
                      onChange={handleChange}
                      placeholder="Nome da rua"
                      error={errors.rua}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número *
                    </label>
                    <Input
                      name="numero"
                      value={formData.numero}
                      onChange={handleChange}
                      placeholder="123"
                      error={errors.numero}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <Input
                      name="bairro"
                      value={formData.bairro}
                      onChange={handleChange}
                      placeholder="Nome do bairro"
                      error={errors.bairro}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Detalhes Opcionais */}
            {!isVitrine && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes Opcionais</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tipoPost === 'OFERTA' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Preço Estimado (R$)
                      </label>
                      <Input
                        name="preco_estimado"
                        type="number"
                        value={formData.preco_estimado}
                        onChange={handleChange}
                        placeholder="0,00"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prazo Desejado
                    </label>
                    <Input
                      name="prazo"
                      type="date"
                      value={formData.prazo}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Fotos */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Fotos</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700">
                      Clique para adicionar fotos
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Máximo 10 fotos
                  </p>
                </div>

                {formData.fotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.fotos.map((foto, index) => (
                      <div key={index} className="relative">
                        <div className="relative w-full rounded-lg overflow-hidden pb-[56.25%] bg-gray-100">
                          <img
                            src={URL.createObjectURL(foto)}
                            alt={`Foto ${index + 1}`}
                            className={`absolute inset-0 w-full h-full object-cover ${index === 0 ? 'ring-2 ring-blue-500' : ''}`}
                          />
                          {index === 0 && (
                            <span className="absolute bottom-2 left-2 text-[10px] uppercase bg-blue-600 text-white px-2 py-0.5 rounded">Capa (16:9)</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openCropForIndex(index)}
                          className="absolute bottom-2 right-2 bg-white/90 text-gray-800 text-[11px] px-2 py-1 rounded border hover:bg-white"
                          title="Recortar"
                        >
                          Recortar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  tipoPost === 'SOLICITACAO' ? 'bg-orange-600 hover:bg-orange-700' :
                  tipoPost === 'OFERTA' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {isSubmitting ? 'Publicando...' : 'Publicar Post'}
              </Button>
            </div>
          </Card>
        </form>
      </div>
      {showCropper && cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          aspect={16/9}
          onCancel={() => {
            setShowCropper(false);
            setPendingAfterCover([]);
            if (cropSrc) URL.revokeObjectURL(cropSrc);
            setCropSrc('');
          }}
          onConfirm={handleCoverCropped}
        />
      )}
      {/* Modal de Categoria (seleção única) */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Selecionar Categoria</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowCategoryModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <CategorySelector
              value={formData.categoria}
              onChange={(v) => setFormData(prev => ({ ...prev, categoria: v as string }))}
              disabledOptions={tipoPost === 'SOLICITACAO' ? (user?.areas_atuacao || []) : []}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded border"
                onClick={() => setShowCategoryModal(false)}
              >
                Fechar
              </button>
              <button
                type="button"
                className="px-3 py-2 rounded bg-blue-600 text-white"
                onClick={() => setShowCategoryModal(false)}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthenticatedLayout>
  );
}
