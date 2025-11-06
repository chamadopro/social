'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  RefreshCw,
  AlertCircle,
  Info,
  CheckCircle,
  Star,
  MessageCircle,
  DollarSign,
  FileText,
  Shield
} from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'POST_LIKED':
      case 'POST_COMMENTED':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'ORCAMENTO_RECEIVED':
      case 'ORCAMENTO_ACCEPTED':
      case 'ORCAMENTO_REJECTED':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'CONTRATO_CREATED':
      case 'CONTRATO_ACCEPTED':
      case 'CONTRATO_COMPLETED':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'MESSAGE_RECEIVED':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'AVALIACAO_RECEIVED':
        return <Star className="h-4 w-4 text-orange-500" />;
      case 'DISPUTA_CREATED':
      case 'DISPUTA_RESOLVED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'SYSTEM_MAINTENANCE':
      case 'SYSTEM_UPDATE':
        return <Shield className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'POST_LIKED':
      case 'POST_COMMENTED':
        return 'bg-yellow-50 border-yellow-200';
      case 'ORCAMENTO_RECEIVED':
      case 'ORCAMENTO_ACCEPTED':
        return 'bg-green-50 border-green-200';
      case 'ORCAMENTO_REJECTED':
        return 'bg-red-50 border-red-200';
      case 'CONTRATO_CREATED':
      case 'CONTRATO_ACCEPTED':
      case 'CONTRATO_COMPLETED':
        return 'bg-blue-50 border-blue-200';
      case 'MESSAGE_RECEIVED':
        return 'bg-purple-50 border-purple-200';
      case 'AVALIACAO_RECEIVED':
        return 'bg-orange-50 border-orange-200';
      case 'DISPUTA_CREATED':
      case 'DISPUTA_RESOLVED':
        return 'bg-red-50 border-red-200';
      case 'SYSTEM_MAINTENANCE':
      case 'SYSTEM_UPDATE':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`;
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.lida)
    : notifications;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Notificações</h2>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadNotifications()}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="border-b p-4">
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter('unread')}
              >
                Não lidas ({unreadCount})
              </Button>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                <Bell className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhuma notificação</p>
                <p className="text-sm">
                  {filter === 'unread' 
                    ? 'Você não tem notificações não lidas'
                    : 'Você não tem notificações ainda'
                  }
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      !notification.lida ? 'ring-2 ring-blue-200' : ''
                    } ${getNotificationColor(notification.tipo)}`}
                    onClick={() => !notification.lida && markAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.lida ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.titulo}
                            </h4>
                            <div className="flex items-center gap-1 ml-2">
                              {!notification.lida && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <span className="text-xs text-gray-500">
                                {formatDate(notification.data_criacao)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.mensagem}
                          </p>
                          
                          {/* Dados extras não disponíveis na interface atual */}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;


