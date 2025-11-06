import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui/Loading';
import { formatRelativeTime } from '@/utils/format';
import { Send, Paperclip, Smile, MoreVertical, AlertTriangle } from 'lucide-react';

interface ChatProps {
  contratoId: string;
  onClose?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ contratoId, onClose }) => {
  const { user } = useAuthStore();
  const { 
    mensagens, 
    isLoading, 
    error, 
    isConnected,
    connect, 
    disconnect, 
    sendMessage, 
    fetchMessages 
  } = useChatStore();
  
  const [novaMensagem, setNovaMensagem] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (contratoId) {
      connect(contratoId);
      fetchMessages(contratoId);
    }

    return () => {
      disconnect();
    };
  }, [contratoId, connect, disconnect, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaMensagem.trim() || isLoading) return;

    const conteudo = novaMensagem.trim();
    setNovaMensagem('');
    
    try {
      await sendMessage(conteudo);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const isMyMessage = (mensagem: any) => {
    return mensagem.usuario_id === user?.id;
  };

  const getMessageStatus = (mensagem: any) => {
    if (mensagem.bloqueada) {
      return 'bloqueada';
    }
    if (mensagem.isModerated) {
      return 'moderada';
    }
    return 'normal';
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-medium text-gray-900">Chat do Contrato</h3>
        </div>
        <div className="flex items-center space-x-2">
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && mensagens.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <Loading size="md" text="Carregando mensagens..." />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMessages(contratoId)}
              className="mt-2"
            >
              Tentar Novamente
            </Button>
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma mensagem ainda</p>
            <p className="text-sm">Inicie a conversa enviando uma mensagem</p>
          </div>
        ) : (
          mensagens.map((mensagem) => {
            const isMine = isMyMessage(mensagem);
            const status = getMessageStatus(mensagem);
            
            return (
              <div
                key={mensagem.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isMine ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isMine && (
                    <Avatar
                      src={mensagem.usuario?.foto_perfil}
                      name={mensagem.usuario?.nome}
                      size="sm"
                    />
                  )}
                  
                  <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isMine
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } ${
                        status === 'bloqueada' 
                          ? 'opacity-50 bg-red-100 text-red-600' 
                          : status === 'moderada'
                          ? 'opacity-75 bg-yellow-100 text-yellow-800'
                          : ''
                      }`}
                    >
                      {mensagem.tipo === 'TEXTO' ? (
                        <p className="text-sm whitespace-pre-wrap">{mensagem.conteudo}</p>
                      ) : mensagem.tipo === 'IMAGEM' ? (
                        <div>
                          <img
                            src={mensagem.anexo_url}
                            alt="Imagem"
                            className="max-w-full h-auto rounded"
                          />
                          {mensagem.conteudo && (
                            <p className="text-sm mt-2">{mensagem.conteudo}</p>
                          )}
                        </div>
                      ) : mensagem.tipo === 'ARQUIVO' ? (
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{mensagem.conteudo}</span>
                        </div>
                      ) : (
                        <p className="text-sm italic">{mensagem.conteudo}</p>
                      )}
                      
                      {mensagem.bloqueada && (
                        <div className="mt-1 text-xs">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          {mensagem.motivo_bloqueio || 'Mensagem bloqueada pela moderação'}
                        </div>
                      )}
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                      {formatRelativeTime(mensagem.data_criacao)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <Avatar size="sm" />
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              disabled={isLoading || !isConnected}
            />
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading || !isConnected}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading || !isConnected}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            <Button
              type="submit"
              size="sm"
              disabled={!novaMensagem.trim() || isLoading || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Conectando ao chat...
          </p>
        )}
      </div>
    </div>
  );
};

