'use client';

import React, { useEffect } from 'react';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Check, Trash2, CheckCheck, AlertCircle, Info, MessageSquare } from 'lucide-react';

export default function NotificacoesPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  useEffect(() => {
    loadNotifications(1, 50);
  }, [loadNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NOVO_ORCAMENTO':
      case 'ORCAMENTO_ACEITO':
        return <Bell className="h-5 w-5" />;
      case 'NOVA_MENSAGEM':
        return <MessageSquare className="h-5 w-5" />;
      case 'PAGAMENTO_CONFIRMADO':
        return <Check className="h-5 w-5" />;
      case 'DISPUTA_ABERTA':
      case 'DISPUTA_RESOLVIDA':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NOVO_ORCAMENTO':
        return 'bg-blue-100 text-blue-700';
      case 'ORCAMENTO_ACEITO':
        return 'bg-green-100 text-green-700';
      case 'NOVA_MENSAGEM':
        return 'bg-purple-100 text-purple-700';
      case 'PAGAMENTO_CONFIRMADO':
        return 'bg-emerald-100 text-emerald-700';
      case 'DISPUTA_ABERTA':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} h${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AuthenticatedLayout currentPath="/notificacoes">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Notificações
            </h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Todas as notificações foram lidas'}
            </p>
          </div>
          
          {notifications.length > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && notifications.length === 0 && (
          <div className="flex justify-center items-center py-12">
            <Loading size="lg" text="Carregando notificações..." />
          </div>
        )}

        {/* Lista de Notificações */}
        {!isLoading && notifications.length === 0 && (
          <Card className="p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-600">
              Você está em dia! Não há novas notificações.
            </p>
          </Card>
        )}

        {/* Notificações */}
        {notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`hover:shadow-md transition-all cursor-pointer ${
                  !(notification.lida || notification.read) ? 'bg-blue-50 border-blue-200' : 'bg-white'
                }`}
                onClick={() => !(notification.lida || notification.read) && markAsRead(notification.id)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.titulo || notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.mensagem || notification.message}
                          </p>
                        </div>
                        
                        {!(notification.lida || notification.read) && (
                          <Badge variant="secondary" className="ml-2 bg-blue-500 text-white">
                            Nova
                          </Badge>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.data_criacao || notification.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Marcar como lida
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

