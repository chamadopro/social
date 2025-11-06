'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Settings, Database, Bell, Shield, Mail } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const settingsSections = [
    {
      title: 'Configurações do Sistema',
      icon: Settings,
      items: [
        { label: 'Nome do Sistema', value: 'ChamadoPro' },
        { label: 'Versão', value: '1.0.0' },
        { label: 'Ambiente', value: process.env.NODE_ENV || 'development' },
      ]
    },
    {
      title: 'Banco de Dados',
      icon: Database,
      items: [
        { label: 'Tipo', value: 'PostgreSQL' },
        { label: 'Status', value: 'Conectado', status: 'success' },
      ]
    },
    {
      title: 'Notificações',
      icon: Bell,
      items: [
        { label: 'Email', value: 'Ativado', status: 'success' },
        { label: 'Push', value: 'Desativado', status: 'warning' },
      ]
    },
    {
      title: 'Segurança',
      icon: Shield,
      items: [
        { label: 'Autenticação', value: 'JWT' },
        { label: 'Rate Limiting', value: 'Ativo', status: 'success' },
        { label: 'CORS', value: 'Configurado', status: 'success' },
      ]
    },
    {
      title: 'Email',
      icon: Mail,
      items: [
        { label: 'SMTP', value: 'Configurado', status: 'success' },
        { label: 'Templates', value: 'Ativos', status: 'success' },
      ]
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie as configurações do sistema</p>
      </div>

      {/* Cards de Configuração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
              </div>

              <div className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Informações Adicionais */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Última atualização</p>
            <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status do Sistema</p>
            <p className="text-sm font-medium text-green-600">Operacional</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

