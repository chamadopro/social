import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/chat';
import { useAuthStore } from '@/store/auth';
import { socketManager } from '@/utils/socket';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAuthStore();
  const { addMessage, setConnected } = useChatStore();

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    // Conectar ao Socket.IO
    const socket = socketManager.connect({
      token,
      userId: user.id,
      transports: ['websocket', 'polling'], // Suporte mobile
    });

    socketRef.current = socket;

    // Eventos de conexão
    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Escutar novas mensagens
    socket.on('new_message', (data: any) => {
      if (data.mensagem || data.message) {
        const mensagem = data.mensagem || data.message;
        addMessage({
          id: mensagem.id,
          contrato_id: mensagem.contrato_id,
          usuario_id: mensagem.usuario_id,
          conteudo: mensagem.conteudo,
          tipo: mensagem.tipo || 'TEXTO',
          bloqueada: mensagem.bloqueada || false,
          data_criacao: mensagem.data_criacao || new Date().toISOString(),
          usuario: mensagem.usuario,
        });
      }
    });

    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_message');
      // Não desconectar completamente, pode ser usado por outros componentes
      // socketManager.disconnect();
    };
  }, [user, token, addMessage, setConnected]);

  const joinContract = (contratoId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_contract', contratoId);
    }
  };

  const leaveContract = (contratoId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_contract', contratoId);
    }
  };

  const sendMessage = (data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', data);
    }
  };

  return {
    joinContract,
    leaveContract,
    sendMessage,
    isConnected: socketRef.current?.connected || false,
  };
};

