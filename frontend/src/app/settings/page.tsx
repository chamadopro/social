'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Eye, 
  EyeOff,
  Save,
  Camera,
  Trash2,
  Download,
  Upload,
  Settings as SettingsIcon,
  Key,
  Smartphone,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, updateUser } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguranca' | 'notificacoes' | 'privacidade'>('perfil');
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    },
    foto_perfil: '',
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: ''
  });

  const [notificacoes, setNotificacoes] = useState({
    email: true,
    push: true,
    sms: false,
    novos_orcamentos: true,
    respostas_orcamentos: true,
    mensagens: true,
    lembretes: true,
    promocoes: false
  });

  const [privacidade, setPrivacidade] = useState({
    perfil_publico: true,
    mostrar_telefone: false,
    mostrar_email: false,
    mostrar_endereco: false,
    permitir_mensagens_diretas: true,
    mostrar_avaliacoes: true,
    mostrar_servicos_concluidos: true
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        endereco: {
          cep: user.endereco?.cep || '',
          rua: user.endereco?.rua || '',
          numero: user.endereco?.numero || '',
          bairro: user.endereco?.bairro || '',
          cidade: user.endereco?.cidade || '',
          estado: user.endereco?.estado || ''
        },
        foto_perfil: user.foto_perfil || '',
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
      });
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/users/${user?.id}`, {
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco
      });

      updateUser(response.data.data.user);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.nova_senha !== formData.confirmar_senha) {
      alert('As senhas não coincidem');
      return;
    }

    if (formData.nova_senha.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${user?.id}/password`, {
        senha_atual: formData.senha_atual,
        nova_senha: formData.nova_senha
      });

      alert('Senha alterada com sucesso!');
      setFormData(prev => ({
        ...prev,
        senha_atual: '',
        nova_senha: '',
        confirmar_senha: ''
      }));
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      alert('Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simular upload de foto
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFormData(prev => ({ ...prev, foto_perfil: result }));
    };
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'privacidade', label: 'Privacidade', icon: Eye }
  ];

  const content = (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Gerencie suas preferências e informações pessoais</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Perfil */}
          {activeTab === 'perfil' && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={formData.foto_perfil}
                      name={formData.nome}
                      size="xl"
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{formData.nome}</h3>
                    <p className="text-gray-600">{formData.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {user?.tipo === 'CLIENTE' ? 'Cliente' : 'Prestador'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
                    </label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <Input
                      value={formData.endereco.cep}
                      onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua
                    </label>
                    <Input
                      value={formData.endereco.rua}
                      onChange={(e) => handleInputChange('endereco.rua', e.target.value)}
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <Input
                      value={formData.endereco.numero}
                      onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    <Input
                      value={formData.endereco.bairro}
                      onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <Input
                      value={formData.endereco.cidade}
                      onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                      placeholder="Nome da cidade"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <Input
                      value={formData.endereco.estado}
                      onChange={(e) => handleInputChange('endereco.estado', e.target.value)}
                      placeholder="SP"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>

                  {user?.tipo === 'PRESTADOR' && (
                    <Button
                      type="button"
                      onClick={() => router.push('/settings/areas-atuacao')}
                      variant="outline"
                    >
                      Gerenciar Áreas de Atuação
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Segurança */}
          {activeTab === 'seguranca' && (
            <Card className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Alterar Senha</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha Atual
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={formData.senha_atual}
                        onChange={(e) => handleInputChange('senha_atual', e.target.value)}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.nova_senha}
                        onChange={(e) => handleInputChange('nova_senha', e.target.value)}
                        placeholder="Digite sua nova senha"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nova Senha
                    </label>
                    <Input
                      type="password"
                      value={formData.confirmar_senha}
                      onChange={(e) => handleInputChange('confirmar_senha', e.target.value)}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={saving || !formData.senha_atual || !formData.nova_senha || !formData.confirmar_senha}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Key className="h-4 w-4 mr-2" />
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </Button>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">Sessões Ativas</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium text-gray-900">Chrome - Windows</p>
                          <p className="text-sm text-gray-600">Sessão atual</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notificações */}
          {activeTab === 'notificacoes' && (
            <Card className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">Receber notificações por email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoes.email}
                        onChange={(e) => setNotificacoes(prev => ({ ...prev, email: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-600">Receber notificações no navegador</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoes.push}
                        onChange={(e) => setNotificacoes(prev => ({ ...prev, push: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Novos Orçamentos</p>
                      <p className="text-sm text-gray-600">Notificar sobre novos orçamentos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoes.novos_orcamentos}
                        onChange={(e) => setNotificacoes(prev => ({ ...prev, novos_orcamentos: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Mensagens</p>
                      <p className="text-sm text-gray-600">Notificar sobre novas mensagens</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificacoes.mensagens}
                        onChange={(e) => setNotificacoes(prev => ({ ...prev, mensagens: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Privacidade */}
          {activeTab === 'privacidade' && (
            <Card className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Configurações de Privacidade</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Perfil Público</p>
                      <p className="text-sm text-gray-600">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacidade.perfil_publico}
                        onChange={(e) => setPrivacidade(prev => ({ ...prev, perfil_publico: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Mostrar Telefone</p>
                      <p className="text-sm text-gray-600">Exibir telefone no perfil público</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacidade.mostrar_telefone}
                        onChange={(e) => setPrivacidade(prev => ({ ...prev, mostrar_telefone: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Permitir Mensagens Diretas</p>
                      <p className="text-sm text-gray-600">Permitir que outros usuários enviem mensagens</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacidade.permitir_mensagens_diretas}
                        onChange={(e) => setPrivacidade(prev => ({ ...prev, permitir_mensagens_diretas: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Mostrar Avaliações</p>
                      <p className="text-sm text-gray-600">Exibir avaliações recebidas no perfil</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacidade.mostrar_avaliacoes}
                        onChange={(e) => setPrivacidade(prev => ({ ...prev, mostrar_avaliacoes: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="text-md font-semibold text-red-600 mb-4">Zona de Perigo</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}
