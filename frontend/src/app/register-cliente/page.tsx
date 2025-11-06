'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card } from '@/components/ui/Card';
import { Toast, useToast } from '@/components/ui/Toast';
import { User, Camera, CameraOff, CheckCircle2, XCircle } from 'lucide-react';
import { formatPhone, formatDocument, validateDocument } from '@/utils/masks';
import { searchCEP, formatAddressFromCEP } from '@/utils/cepService';
import { api } from '@/services/api';

interface FormData {
  tipo_cliente: 'PF' | 'PJ';
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  cpf_cnpj: string;
  data_nascimento: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    estado: string;
    latitude: number;
    longitude: number;
  };
}

const ETAPAS = [
  { id: 1, title: 'Tipo de Conta', desc: 'PF ou PJ' },
  { id: 2, title: 'Dados Básicos', desc: 'Email, senha, etc' },
  { id: 3, title: 'Endereço & Foto', desc: 'Localização e identidade' },
  { id: 4, title: 'Finalizar', desc: 'Confirmar e criar' },
];

export default function RegisterClientePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get('tipo') as 'PF' | 'PJ' | null;

  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    tipo_cliente: tipoInicial || 'PF',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf_cnpj: '',
    data_nascimento: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      latitude: 0,
      longitude: 0,
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null);
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when tipo_cliente changes
  useEffect(() => {
    if (tipoInicial) {
      setFormData(prev => ({ ...prev, tipo_cliente: tipoInicial as 'PF' | 'PJ', cpf_cnpj: '' }));
    }
  }, [tipoInicial]);

  const nextStep = () => {
    if (validateStep(etapa)) {
      setEtapa(prev => Math.min(prev + 1, ETAPAS.length));
    }
  };

  const prevStep = () => {
    setEtapa(prev => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Etapa 1 validada - apenas seleção
      return true;
    }

    if (step === 2) {
      if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
      if (!formData.email) newErrors.email = 'Email é obrigatório';
      if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
      if (!formData.confirmarSenha) newErrors.confirmarSenha = 'Confirmação obrigatória';
      if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
    }

    if (step === 3) {
      if (!formData.endereco.cep) newErrors['endereco.cep'] = 'CEP obrigatório';
      if (!formData.endereco.rua) newErrors['endereco.rua'] = 'Rua obrigatória';
      if (!formData.endereco.numero) newErrors['endereco.numero'] = 'Número obrigatório';
      if (!formData.endereco.bairro) newErrors['endereco.bairro'] = 'Bairro obrigatório';
      if (!formData.endereco.cidade) newErrors['endereco.cidade'] = 'Cidade obrigatória';
      if (!formData.endereco.estado) newErrors['endereco.estado'] = 'Estado obrigatório';
      if (!fotoPerfil) newErrors.fotoPerfil = 'Foto de perfil obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(etapa)) {
      return;
    }

    if (!acceptedTerms) {
      addToast({
        type: 'error',
        title: 'Aceite os termos',
        description: 'Você precisa aceitar os termos de uso para continuar',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { confirmarSenha, ...registerData } = formData;

      const formDataToSend = new FormData();
      Object.entries(registerData).forEach(([key, value]) => {
        if (key === 'endereco') {
          formDataToSend.append('endereco', JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      formDataToSend.append('tipo', 'CLIENTE');
      formDataToSend.append('tipo_cliente', formData.tipo_cliente);
      if (fotoPerfil) {
        formDataToSend.append('foto_perfil', fotoPerfil);
      }

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta');
      }

      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
      }

      addToast({
        type: 'success',
        title: 'Conta criada com sucesso!',
        description: 'Verifique seu email para ativar a conta',
      });

      router.push('/verify');
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      addToast({
        type: 'error',
        title: 'Erro no registro',
        description: error.message || 'Erro ao criar conta',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cpf_cnpj') {
      const docType = formData.tipo_cliente === 'PJ' ? 'CNPJ' : 'CPF';
      formattedValue = formatDocument(value, docType);
    }
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: formattedValue }
      }));
    } else if (name === 'tipo_cliente') {
      setFormData(prev => ({
        ...prev,
        tipo_cliente: value as 'PF' | 'PJ',
        cpf_cnpj: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    }
  };

  const handleCEPBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length === 8) {
      try {
        const addressData = await searchCEP(cep);
        if (addressData) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              rua: addressData.logradouro || prev.endereco.rua,
              bairro: addressData.bairro || prev.endereco.bairro,
              cidade: addressData.localidade || prev.endereco.cidade,
              estado: addressData.uf || prev.endereco.estado,
            }
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleFotoPerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast({ type: 'error', title: 'Arquivo muito grande', description: 'Tamanho máximo 2MB' });
        return;
      }
      if (!file.type.startsWith('image/')) {
        addToast({ type: 'error', title: 'Formato inválido', description: 'Apenas imagens' });
        return;
      }
      setFotoPerfil(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPerfilPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const progresso = ((etapa - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sou Cliente</h1>
          <p className="text-gray-600">Passo {etapa} de {ETAPAS.length}</p>
        </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {ETAPAS.map((e, idx) => (
                <div key={e.id} className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    idx + 1 <= etapa ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {idx + 1 < etapa ? '✓' : e.id}
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{e.title}</p>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ETAPA 1: Tipo de Cliente */}
              {etapa === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Tipo de Conta</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="tipo_cliente"
                        value="PF"
                        checked={formData.tipo_cliente === 'PF'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tipo_cliente === 'PF' 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="text-center">
                          <User className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                          <div className="font-bold text-lg">Pessoa Física</div>
                          <div className="text-sm text-gray-500 mt-1">CPF</div>
                        </div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="tipo_cliente"
                        value="PJ"
                        checked={formData.tipo_cliente === 'PJ'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tipo_cliente === 'PJ' 
                          ? 'border-blue-500 bg-blue-50 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <div className="text-center">
                          <User className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                          <div className="font-bold text-lg">Pessoa Jurídica</div>
                          <div className="text-sm text-gray-500 mt-1">CNPJ</div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ETAPA 2: Dados Básicos */}
              {etapa === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Dados Básicos</h2>
                  
                  <Input
                    label={formData.tipo_cliente === 'PJ' ? 'Razão social' : 'Nome completo'}
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    error={errors.nome}
                    placeholder={formData.tipo_cliente === 'PJ' ? 'Razão social da empresa' : 'Seu nome completo'}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="seu@email.com"
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <PasswordInput
                      label="Senha"
                      name="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      error={errors.senha}
                      required
                    />
                    <PasswordInput
                      label="Confirmar senha"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      error={errors.confirmarSenha}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Telefone"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      error={errors.telefone}
                      placeholder="(11) 99999-9999"
                      required
                    />
                    <Input
                      label={formData.tipo_cliente === 'PJ' ? 'CNPJ' : 'CPF'}
                      name="cpf_cnpj"
                      value={formData.cpf_cnpj}
                      onChange={handleChange}
                      error={errors.cpf_cnpj}
                      placeholder={formData.tipo_cliente === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                      required
                    />
                  </div>

                  <Input
                    label="Data de nascimento"
                    type="date"
                    name="data_nascimento"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    error={errors.data_nascimento}
                    required
                  />
                </div>
              )}

              {/* ETAPA 3: Endereço e Foto */}
              {etapa === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Endereço e Identidade</h2>
                  
                  <Input
                    label="CEP"
                    name="endereco.cep"
                    value={formData.endereco.cep}
                    onChange={handleChange}
                    onBlur={handleCEPBlur}
                    error={errors['endereco.cep']}
                    placeholder="00000-000"
                    required
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input
                        label="Rua"
                        name="endereco.rua"
                        value={formData.endereco.rua}
                        onChange={handleChange}
                        error={errors['endereco.rua']}
                        placeholder="Nome da rua"
                        required
                      />
                    </div>
                    <Input
                      label="Número"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      error={errors['endereco.numero']}
                      placeholder="123"
                      required
                    />
                  </div>

                  <Input
                    label="Complemento (opcional)"
                    name="endereco.complemento"
                    value={formData.endereco.complemento}
                    onChange={handleChange}
                    error={errors['endereco.complemento']}
                    placeholder="Apto 10, Bloco A"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      error={errors['endereco.bairro']}
                      placeholder="Nome do bairro"
                      required
                    />
                    <Input
                      label="Cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      error={errors['endereco.cidade']}
                      placeholder="Nome da cidade"
                      required
                    />
                    <Input
                      label="Estado"
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      error={errors['endereco.estado']}
                      placeholder="SP"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil *
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoPerfilChange}
                          className="hidden"
                        />
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500 transition-colors">
                          {fotoPerfilPreview ? (
                            <img src={fotoPerfilPreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Camera className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Selecione uma foto de perfil</p>
                        <p className="text-xs text-gray-500 mt-1">Máximo 2MB. JPG, PNG ou WEBP</p>
                      </div>
                    </div>
                    {errors.fotoPerfil && (
                      <p className="text-sm text-red-600 mt-1">{errors.fotoPerfil}</p>
                    )}
                  </div>
                </div>
              )}

              {/* ETAPA 4: Finalizar */}
              {etapa === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Finalizar Cadastro</h2>
                  
                  <div>
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="mt-1 mr-3 h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-600">
                        Aceito os <Link href="/terms" className="text-blue-600 hover:underline">termos de uso</Link> e declaro que todas as informações enviadas são verdadeiras e corretas.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                  {etapa > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    ← Voltar
                  </Button>
                ) : (
                  <Link href="/register">
                    <Button type="button" variant="outline">
                      ← Voltar
                    </Button>
                  </Link>
                )}
                
                {etapa < ETAPAS.length ? (
                  <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Próximo →
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

