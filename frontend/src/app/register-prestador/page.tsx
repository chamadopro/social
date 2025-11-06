'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card } from '@/components/ui/Card';
import { Toast, useToast } from '@/components/ui/Toast';
import { User, Briefcase, Camera, FileText, CheckCircle2 } from 'lucide-react';
import { formatPhone, formatDocument } from '@/utils/masks';
import { searchCEP } from '@/utils/cepService';
import { api } from '@/services/api';

interface FormData {
  tipo_prestador: 'PF' | 'PJ';
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  cpf_cnpj: string;
  data_nascimento: string;
  descricao_profissional: string;
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
  { id: 4, title: 'Documentos', desc: 'Verificação' },
  { id: 5, title: 'Finalizar', desc: 'Confirmar e criar' },
];

export default function RegisterPrestadorPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const tipoInicial = searchParams.get('tipo') as 'PF' | 'PJ' | null;

  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    tipo_prestador: tipoInicial || 'PF',
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    telefone: '',
    cpf_cnpj: '',
    data_nascimento: '',
    descricao_profissional: '',
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
  const [documentoVerificacao, setDocumentoVerificacao] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tipoInicial) {
      setFormData(prev => ({ ...prev, tipo_prestador: tipoInicial as 'PF' | 'PJ', cpf_cnpj: '' }));
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
      return true;
    }

    if (step === 2) {
      if (!formData.nome) newErrors.nome = 'Nome é obrigatório';
      if (!formData.email) newErrors.email = 'Email é obrigatório';
      if (!formData.senha) newErrors.senha = 'Senha é obrigatória';
      if (formData.senha !== formData.confirmarSenha) newErrors.confirmarSenha = 'Senhas não coincidem';
      if (!formData.telefone) newErrors.telefone = 'Telefone é obrigatório';
      if (!formData.cpf_cnpj) newErrors.cpf_cnpj = 'CNPJ é obrigatório';
      if (!formData.data_nascimento) newErrors.data_nascimento = 'Data de nascimento é obrigatória';
    }

    if (step === 3) {
      if (!formData.endereco.cep) newErrors['endereco.cep'] = 'CEP obrigatório';
      if (!formData.endereco.rua) newErrors['endereco.rua'] = 'Rua obrigatória';
      if (!fotoPerfil) newErrors.fotoPerfil = 'Foto de perfil obrigatória';
    }

    if (step === 4) {
      if (!documentoVerificacao) {
        newErrors.documentoVerificacao = formData.tipo_prestador === 'PF' 
          ? 'Certidão de Antecedentes é obrigatória' 
          : 'Contrato Social ou MEI é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptedTerms) {
      addToast({ type: 'error', title: 'Aceite os termos', description: 'Você precisa aceitar os termos de uso' });
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

      formDataToSend.append('tipo', 'PRESTADOR');
      formDataToSend.append('tipo_prestador', formData.tipo_prestador);
      formDataToSend.append('descricao_profissional', formData.descricao_profissional);

      if (fotoPerfil) formDataToSend.append('foto_perfil', fotoPerfil);
      if (documentoVerificacao) formDataToSend.append('documento_verificacao', documentoVerificacao);

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
        description: 'Seu documento será analisado em breve. Verifique seu email.',
      });

      router.push('/verify');
    } catch (error: any) {
      addToast({ type: 'error', title: 'Erro no registro', description: error.message || 'Erro ao criar conta' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    
    if (name === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cpf_cnpj') {
      formattedValue = formatDocument(value, 'CNPJ');
    }
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        endereco: { ...prev.endereco, [field]: formattedValue }
      }));
    } else if (name === 'tipo_prestador') {
      setFormData(prev => ({
        ...prev,
        tipo_prestador: value as 'PF' | 'PJ',
        cpf_cnpj: ''
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast({ type: 'error', title: 'Arquivo muito grande', description: 'Máximo 2MB' });
        return;
      }
      setFotoPerfil(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoPerfilPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocumentoVerificacao(file);
    }
  };

  const progresso = ((etapa - 1) / (ETAPAS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastro de Prestador</h1>
            <p className="text-gray-600">Passo {etapa} de {ETAPAS.length}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {ETAPAS.map((e, idx) => (
                <div key={e.id} className="flex-1 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                    idx + 1 <= etapa ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {idx + 1 < etapa ? '✓' : e.id}
                  </div>
                  <p className="text-xs mt-2 text-gray-600">{e.title}</p>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progresso}%` }} />
            </div>
          </div>

          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ETAPA 1 */}
              {etapa === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Tipo de Conta</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="relative">
                      <input
                        type="radio"
                        name="tipo_prestador"
                        value="PF"
                        checked={formData.tipo_prestador === 'PF'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tipo_prestador === 'PF' 
                          ? 'border-orange-500 bg-orange-50 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <User className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                        <div className="font-bold text-lg text-center">Pessoa Física</div>
                        <div className="text-sm text-gray-500 text-center mt-1">CNPJ MEI</div>
                      </div>
                    </label>
                    <label className="relative">
                      <input
                        type="radio"
                        name="tipo_prestador"
                        value="PJ"
                        checked={formData.tipo_prestador === 'PJ'}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.tipo_prestador === 'PJ' 
                          ? 'border-orange-500 bg-orange-50 shadow-lg' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}>
                        <Briefcase className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                        <div className="font-bold text-lg text-center">Pessoa Jurídica</div>
                        <div className="text-sm text-gray-500 text-center mt-1">CNPJ</div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ETAPA 2 */}
              {etapa === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Dados Básicos</h2>
                  
                  <Input
                    label="Nome completo"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    error={errors.nome}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
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
                      required
                    />
                    <Input
                      label="CNPJ"
                      name="cpf_cnpj"
                      value={formData.cpf_cnpj}
                      onChange={handleChange}
                      error={errors.cpf_cnpj}
                      placeholder="00.000.000/0000-00"
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

              {/* ETAPA 3 */}
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
                        required
                      />
                    </div>
                    <Input
                      label="Número"
                      name="endereco.numero"
                      value={formData.endereco.numero}
                      onChange={handleChange}
                      error={errors['endereco.numero']}
                      required
                    />
                  </div>

                  <Input
                    label="Complemento (opcional)"
                    name="endereco.complemento"
                    value={formData.endereco.complemento}
                    onChange={handleChange}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Bairro"
                      name="endereco.bairro"
                      value={formData.endereco.bairro}
                      onChange={handleChange}
                      error={errors['endereco.bairro']}
                      required
                    />
                    <Input
                      label="Cidade"
                      name="endereco.cidade"
                      value={formData.endereco.cidade}
                      onChange={handleChange}
                      error={errors['endereco.cidade']}
                      required
                    />
                    <Input
                      label="Estado"
                      name="endereco.estado"
                      value={formData.endereco.estado}
                      onChange={handleChange}
                      error={errors['endereco.estado']}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto de perfil *
                    </label>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                      />
                      <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-orange-500 transition-colors">
                        {fotoPerfilPreview ? (
                          <img src={fotoPerfilPreview} alt="Preview" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </label>
                    {errors.fotoPerfil && <p className="text-sm text-red-600 mt-1">{errors.fotoPerfil}</p>}
                  </div>
                </div>
              )}

              {/* ETAPA 4 */}
              {etapa === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Documento de Verificação</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.tipo_prestador === 'PF' 
                        ? 'Certidão de Antecedentes Criminais' 
                        : 'Contrato Social ou CNPJ MEI'} *
                    </label>
                    
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleDocumentoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    
                    {documentoVerificacao && (
                      <div className="mt-2 flex items-center text-green-600">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        <span className="text-sm">{documentoVerificacao.name}</span>
                      </div>
                    )}
                    
                    {errors.documentoVerificacao && (
                      <p className="text-sm text-red-600 mt-1">{errors.documentoVerificacao}</p>
                    )}

                    <p className="text-sm text-gray-600 mt-3">
                      Seu documento será analisado e você será notificado via email sobre a aprovação.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição profissional (opcional)
                    </label>
                    <textarea
                      name="descricao_profissional"
                      value={formData.descricao_profissional}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Descreva seus serviços, experiência e áreas de atuação..."
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 5 */}
              {etapa === 5 && (
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
                        Aceito os <Link href="/terms" className="text-orange-600 hover:underline">termos de uso</Link> e declaro que todas as informações enviadas são verdadeiras e corretas.
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
                  <Button type="button" onClick={nextStep} className="bg-orange-500 hover:bg-orange-600">
                    Próximo →
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600">
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

