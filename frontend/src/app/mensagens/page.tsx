'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  Smile,
  MoreVertical,
  Search,
  Filter,
  Archive,
  Trash2,
  Phone,
  Video,
  Info
} from 'lucide-react';

interface Conversa {
  id: string;
  usuario: {
    id: string;
    nome: string;
    foto_perfil?: string;
    tipo: string;
  };
  ultimaMensagem: {
    conteudo: string;
    data_criacao: string;
    lida: boolean;
  };
  naoLidas: number;
  post?: {
    id: string;
    titulo: string;
    categoria: string;
  };
  orcamento?: {
    id: string;
    status: string;
  };
}

interface Mensagem {
  id: string;
  conteudo: string;
  data_criacao: string;
  lida: boolean;
  remetente: {
    id: string;
    nome: string;
    foto_perfil?: string;
  };
}

export default function MensagensPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [conversaSelecionada, setConversaSelecionada] = useState<Conversa | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadConversas();
  }, [isAuthenticated, user]);

  const loadConversas = async () => {
    setLoading(true);
    try {
      // Simular dados de conversas
      const mockConversas: Conversa[] = [
        {
          id: '1',
          usuario: {
            id: '2',
            nome: 'João Silva',
            foto_perfil: undefined,
            tipo: 'PRESTADOR'
          },
          ultimaMensagem: {
            conteudo: 'Olá! Posso ajudar com seu problema de encanamento.',
            data_criacao: '2024-01-20T10:30:00Z',
            lida: false
          },
          naoLidas: 2,
          post: {
            id: '1',
            titulo: 'Reparo de torneira',
            categoria: 'Encanamento'
          },
          orcamento: {
            id: '1',
            status: 'PENDENTE'
          }
        },
        {
          id: '2',
          usuario: {
            id: '3',
            nome: 'Maria Santos',
            foto_perfil: undefined,
            tipo: 'CLIENTE'
          },
          ultimaMensagem: {
            conteudo: 'Obrigada pelo orçamento! Vou analisar.',
            data_criacao: '2024-01-19T15:45:00Z',
            lida: true
          },
          naoLidas: 0,
          post: {
            id: '2',
            titulo: 'Instalação de chuveiro',
            categoria: 'Encanamento'
          },
          orcamento: {
            id: '2',
            status: 'ACEITO'
          }
        }
      ];

      setConversas(mockConversas);
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMensagens = async (conversaId: string) => {
    try {
      // Simular carregamento de mensagens
      const mockMensagens: Mensagem[] = [
        {
          id: '1',
          conteudo: 'Olá! Vi sua solicitação de reparo de torneira.',
          data_criacao: '2024-01-20T10:00:00Z',
          lida: true,
          remetente: {
            id: '2',
            nome: 'João Silva',
            foto_perfil: undefined
          }
        },
        {
          id: '2',
          conteudo: 'Olá João! Sim, preciso de ajuda com uma torneira que está vazando.',
          data_criacao: '2024-01-20T10:15:00Z',
          lida: true,
          remetente: {
            id: user?.id!,
            nome: user?.nome!,
            foto_perfil: user?.foto_perfil
          }
        },
        {
          id: '3',
          conteudo: 'Posso ajudar! Qual o problema específico?',
          data_criacao: '2024-01-20T10:30:00Z',
          lida: false,
          remetente: {
            id: '2',
            nome: 'João Silva',
            foto_perfil: undefined
          }
        }
      ];

      setMensagens(mockMensagens);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  const handleSelecionarConversa = (conversa: Conversa) => {
    setConversaSelecionada(conversa);
    loadMensagens(conversa.id);
  };

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !conversaSelecionada) return;

    setEnviandoMensagem(true);
    try {
      // Simular envio de mensagem
      const novaMsg: Mensagem = {
        id: Date.now().toString(),
        conteudo: novaMensagem,
        data_criacao: new Date().toISOString(),
        lida: false,
        remetente: {
          id: user?.id!,
          nome: user?.nome!,
          foto_perfil: user?.foto_perfil
        }
      };

      setMensagens([...mensagens, novaMsg]);
      setNovaMensagem('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setEnviandoMensagem(false);
    }
  };

  const formatarData = (data: string) => {
    const agora = new Date();
    const dataMsg = new Date(data);
    const diffMs = agora.getTime() - dataMsg.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffMin < 1) return 'Agora';
    if (diffMin < 60) return `${diffMin}min`;
    if (diffHoras < 24) return `${diffHoras}h`;
    if (diffDias < 7) return `${diffDias}d`;
    return dataMsg.toLocaleDateString();
  };

  const content = (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Mensagens</h1>
          <p className="text-sm text-gray-600">
            {conversas.length} conversa{conversas.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversas */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : conversas.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma conversa encontrada</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversas.map((conversa) => (
                <div
                  key={conversa.id}
                  onClick={() => handleSelecionarConversa(conversa)}
                  className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                    conversaSelecionada?.id === conversa.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar
                        src={conversa.usuario.foto_perfil}
                        name={conversa.usuario.nome}
                        size="md"
                      />
                      {conversa.naoLidas > 0 && (
                        <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                          {conversa.naoLidas}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversa.usuario.nome}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatarData(conversa.ultimaMensagem.data_criacao)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversa.ultimaMensagem.conteudo}
                      </p>
                      
                      {conversa.post && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {conversa.post.categoria}
                          </Badge>
                          <span className="text-xs text-gray-500 truncate">
                            {conversa.post.titulo}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 flex flex-col">
          {conversaSelecionada ? (
            <>
              {/* Header da Conversa */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={conversaSelecionada.usuario.foto_perfil}
                      name={conversaSelecionada.usuario.nome}
                      size="md"
                    />
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {conversaSelecionada.usuario.nome}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {conversaSelecionada.usuario.tipo === 'CLIENTE' ? 'Cliente' : 'Prestador'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagens.map((mensagem) => (
                  <div
                    key={mensagem.id}
                    className={`flex ${mensagem.remetente.id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-xs lg:max-w-md ${mensagem.remetente.id === user?.id ? 'flex-row-reverse' : ''}`}>
                      <Avatar
                        src={mensagem.remetente.foto_perfil}
                        name={mensagem.remetente.nome}
                        size="sm"
                      />
                      <div className={`rounded-lg px-3 py-2 ${
                        mensagem.remetente.id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{mensagem.conteudo}</p>
                        <p className={`text-xs mt-1 ${
                          mensagem.remetente.id === user?.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatarData(mensagem.data_criacao)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input de Mensagem */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={handleEnviarMensagem}
                      disabled={!novaMensagem.trim() || enviandoMensagem}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-600">
                  Escolha uma conversa para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}
