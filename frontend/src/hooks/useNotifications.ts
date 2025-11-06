'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/auth';
import { socketManager, getApiUrl } from '@/utils/socket';
import { Socket } from 'socket.io-client';

export interface Notification {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
}

export interface NotificationStats {
  unreadCount: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuthStore();
  const { toast } = useToast();

  // Conectar ao serviço de notificações via Socket.IO
  useEffect(() => {
    if (!token || !user) {
      return;
    }

    // Conectar ao Socket.IO
    const socket = socketManager.connect({
      token,
      userId: user.id,
      transports: ['websocket', 'polling'], // Suporte mobile
    });

    // Escutar eventos de notificação
    const handleNotification = (notification: any) => {
      // Mapear formato do backend para o frontend
      const mappedNotification: Notification = {
        id: notification.id,
        usuario_id: notification.usuario_id || notification.userId || '',
        tipo: notification.tipo || notification.type || '',
        titulo: notification.titulo || notification.title || '',
        mensagem: notification.mensagem || notification.message || '',
        lida: notification.lida || notification.read || false,
        data_criacao: notification.data_criacao || notification.createdAt || new Date().toISOString(),
      };

      setNotifications(prev => [mappedNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Mostrar toast para notificações importantes
      if (['POST_LIKED', 'POST_COMMENTED', 'ORCAMENTO_RECEIVED', 'MESSAGE_RECEIVED'].includes(mappedNotification.tipo)) {
        toast({
          title: mappedNotification.titulo,
          description: mappedNotification.mensagem,
          duration: 5000,
        });
      }
    };

    // Escutar evento 'notification' do Socket.IO
    socket.on('notification', handleNotification);

    // Atualizar status de conexão
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Cleanup
    return () => {
      socket.off('notification', handleNotification);
      socket.off('connect');
      socket.off('disconnect');
      // Não desconectar completamente, pode ser usado por outros componentes
      // socketManager.disconnect();
    };
  }, [token, user, toast]);

  // Carregar notificações iniciais
  const loadNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/notificacoes?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const notifications = data.data.notifications || data.data || [];
        const unreadCountValue = data.data.unreadCount || 0;
        
        // Mapear campos do banco para o formato do frontend
        const mappedNotifications = notifications.map((n: any) => ({
          id: n.id,
          usuario_id: n.usuario_id,
          tipo: n.tipo,
          titulo: n.titulo,
          mensagem: n.mensagem,
          lida: n.lida,
          data_criacao: n.data_criacao,
          // Aliases para compatibilidade
          userId: n.usuario_id,
          type: n.tipo,
          title: n.titulo,
          message: n.mensagem,
          read: n.lida,
          createdAt: n.data_criacao
        }));
        
        setNotifications(mappedNotifications);
        setUnreadCount(unreadCountValue);
      } else {
        throw new Error(data.message || 'Erro ao carregar notificações');
      }
    } catch (error: any) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token, toast]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!token) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/notificacoes/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, lida: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  }, [token]);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/notificacoes/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, lida: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, [token]);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!token) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/notificacoes/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Verificar se era uma notificação não lida ANTES de remover
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.lida) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  }, [token, notifications]);

  // Obter contagem de não lidas
  const getUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/notificacoes/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Erro ao obter contagem de não lidas:', error);
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
  };
};


