'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/Toast';
import {
  CreditCard,
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Calendar,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ContaBancaria {
  id?: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: 'CORRENTE' | 'POUPANCA';
  titular: string;
  cpf_cnpj: string;
}

interface Cartao {
  id?: string;
  numero: string;
  nome_titular: string;
  validade: string;
  cvv: string;
  tipo: 'CREDITO' | 'DEBITO';
  bandeira?: string;
}

interface Movimentacao {
  id: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  descricao: string;
  status: 'PENDENTE' | 'APROVADO' | 'REJEITADO' | 'CANCELADO';
  data: string;
  categoria: string;
  referencia_id?: string;
}

export default function FinanceiroPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'movimentacoes' | 'contas' | 'cartoes' | 'moedas'>('overview');
  const [showBalance, setShowBalance] = useState(true);
  
  // Saldos
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [saldoPendente, setSaldoPendente] = useState(0);
  const [moedasChamadoPro, setMoedasChamadoPro] = useState(0);
  
  // Contas e cartões
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [cartoes, setCartoes] = useState<Cartao[]>([]);
  const [showFormConta, setShowFormConta] = useState(false);
  const [showFormCartao, setShowFormCartao] = useState(false);
  
  // Formulários
  const [formConta, setFormConta] = useState<ContaBancaria>({
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'CORRENTE',
    titular: '',
    cpf_cnpj: ''
  });
  
  const [formCartao, setFormCartao] = useState<Cartao>({
    numero: '',
    nome_titular: '',
    validade: '',
    cvv: '',
    tipo: 'CREDITO',
    bandeira: ''
  });
  
  // Movimentações
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [filtroMovimentacao, setFiltroMovimentacao] = useState<'all' | 'ENTRADA' | 'SAIDA'>('all');
  const [filtroStatus, setFiltroStatus] = useState<'all' | 'PENDENTE' | 'APROVADO' | 'REJEITADO'>('all');
  
  // Moedas
  const [showComprarMoedas, setShowComprarMoedas] = useState(false);
  const [valorComprarMoedas, setValorComprarMoedas] = useState('');
  
  // Estatísticas
  const [estatisticas, setEstatisticas] = useState({
    totalRecebido: 0,
    totalPago: 0,
    taxaPlataforma: 0,
    orcamentosAprovados: 0,
    orcamentosRejeitados: 0,
    moedasUsadas: 0,
    moedasCompradas: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    loadFinanceiro();
  }, [isAuthenticated, user]);

  const loadFinanceiro = async () => {
    try {
      // Carregar saldos
      const saldosResponse = await api.get('/financeiro/saldos');
      if (saldosResponse.data?.success) {
        setSaldoDisponivel(saldosResponse.data.data.saldoDisponivel || 0);
        setSaldoPendente(saldosResponse.data.data.saldoPendente || 0);
      }

      // Carregar moedas (do usuário)
      if (user?.saldo_moedas !== undefined) {
        setMoedasChamadoPro(user.saldo_moedas);
      }

      // Carregar movimentações
      const movResponse = await api.get('/financeiro/movimentacoes');
      if (movResponse.data?.success) {
        const movs = movResponse.data.data.movimentacoes || [];
        setMovimentacoes(movs.map((m: any) => ({
          id: m.id,
          tipo: m.tipo,
          valor: m.valor,
          descricao: m.descricao,
          status: m.status,
          data: m.data_movimentacao || m.data_criacao,
          categoria: m.categoria,
          referencia_id: m.referencia_id
        })));
      }

      // Carregar estatísticas
      const statsResponse = await api.get('/financeiro/estatisticas');
      if (statsResponse.data?.success) {
        const stats = statsResponse.data.data;
        setEstatisticas({
          totalRecebido: stats.totalRecebido || 0,
          totalPago: stats.totalPago || 0,
          taxaPlataforma: stats.taxaPlataforma || 0,
          orcamentosAprovados: stats.orcamentosAprovados || 0,
          orcamentosRejeitados: stats.orcamentosRejeitados || 0,
          moedasUsadas: stats.moedasUsadas || 0,
          moedasCompradas: stats.moedasCompradas || 0
        });
        if (stats.saldoMoedas !== undefined) {
          setMoedasChamadoPro(stats.saldoMoedas);
        }
      }

      // Carregar contas bancárias
      const contasResponse = await api.get('/financeiro/contas');
      if (contasResponse.data?.success) {
        const contas = contasResponse.data.data.contas || [];
        setContasBancarias(contas.map((c: any) => ({
          id: c.id,
          banco: c.banco,
          agencia: c.agencia,
          conta: c.conta,
          tipo: c.tipo,
          titular: c.titular,
          cpf_cnpj: c.cpf_cnpj
        })));
      }

      // Carregar cartões
      const cartoesResponse = await api.get('/financeiro/cartoes');
      if (cartoesResponse.data?.success) {
        const cartoes = cartoesResponse.data.data.cartoes || [];
        setCartoes(cartoes.map((c: any) => ({
          id: c.id,
          numero: `**** **** **** ${c.numero_hash}`,
          nome_titular: c.nome_titular,
          validade: c.validade,
          tipo: c.tipo,
          bandeira: c.bandeira
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      addToast({ type: 'error', title: 'Erro', description: 'Erro ao carregar dados financeiros' });
    }
  };

  const handleAddConta = async () => {
    try {
      const response = await api.post('/financeiro/contas', {
        ...formConta,
        principal: false
      });

      if (response.data?.success) {
        const novaConta = response.data.data.conta;
        setContasBancarias([...contasBancarias, {
          id: novaConta.id,
          banco: novaConta.banco,
          agencia: novaConta.agencia,
          conta: novaConta.conta,
          tipo: novaConta.tipo,
          titular: novaConta.titular,
          cpf_cnpj: novaConta.cpf_cnpj
        }]);
        setShowFormConta(false);
        setFormConta({
          banco: '',
          agencia: '',
          conta: '',
          tipo: 'CORRENTE',
          titular: '',
          cpf_cnpj: ''
        });
        addToast({ type: 'success', title: 'Sucesso', description: 'Conta bancária cadastrada com sucesso!' });
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar conta:', error);
      addToast({ 
        type: 'error', 
        title: 'Erro', 
        description: error.response?.data?.message || 'Erro ao cadastrar conta bancária' 
      });
    }
  };

  const handleAddCartao = async () => {
    try {
      const response = await api.post('/financeiro/cartoes', {
        ...formCartao,
        principal: false
      });

      if (response.data?.success) {
        const novoCartao = response.data.data.cartao;
        setCartoes([...cartoes, {
          id: novoCartao.id,
          numero: `**** **** **** ${novoCartao.numero_hash}`,
          nome_titular: novoCartao.nome_titular,
          validade: novoCartao.validade,
          tipo: novoCartao.tipo,
          bandeira: novoCartao.bandeira
        }]);
        setShowFormCartao(false);
        setFormCartao({
          numero: '',
          nome_titular: '',
          validade: '',
          cvv: '',
          tipo: 'CREDITO',
          bandeira: ''
        });
        addToast({ type: 'success', title: 'Sucesso', description: 'Cartão cadastrado com sucesso!' });
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar cartão:', error);
      addToast({ 
        type: 'error', 
        title: 'Erro', 
        description: error.response?.data?.message || 'Erro ao cadastrar cartão' 
      });
    }
  };

  const handleComprarMoedas = async () => {
    const valor = parseFloat(valorComprarMoedas);
    if (!valor || valor <= 0) {
      addToast({ type: 'error', title: 'Erro', description: 'Valor inválido' });
      return;
    }

    try {
      // TODO: Integrar com gateway de pagamento real
      // Por enquanto, simular compra de moedas
      // Criar movimentação financeira de saída
      await api.post('/financeiro/movimentacao', {
        tipo: 'SAIDA',
        valor: valor,
        descricao: `Compra de moedas ChamadoPro`,
        categoria: 'COMPRA_MOEDAS',
        referencia_tipo: 'COMPRA_MOEDAS'
      });

      // Calcular moedas (1 real = 10 moedas)
      const moedas = Math.floor(valor * 10);
      
      // TODO: Chamar endpoint de compra de moedas quando estiver implementado
      // Por enquanto, apenas atualizar o estado local
      // await api.post('/moedas/comprar', { valor, moedas });
      
      setMoedasChamadoPro(moedasChamadoPro + moedas);
      setShowComprarMoedas(false);
      setValorComprarMoedas('');
      addToast({ type: 'success', title: 'Sucesso', description: `${moedas} moedas adicionadas!` });
      
      // Recarregar dados financeiros
      loadFinanceiro();
    } catch (error: any) {
      console.error('Erro ao comprar moedas:', error);
      addToast({ 
        type: 'error', 
        title: 'Erro', 
        description: error.response?.data?.message || 'Erro ao comprar moedas' 
      });
    }
  };

  const filteredMovimentacoes = movimentacoes.filter(m => {
    if (filtroMovimentacao !== 'all' && m.tipo !== filtroMovimentacao) return false;
    if (filtroStatus !== 'all' && m.status !== filtroStatus) return false;
    return true;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'REJEITADO':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-600 mt-1">Gerencie suas finanças e pagamentos</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Extrato
        </Button>
      </div>

      {/* Saldos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Saldo Disponível</span>
            <button onClick={() => setShowBalance(!showBalance)}>
              {showBalance ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
            </button>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {showBalance ? formatCurrency(saldoDisponivel) : '••••••'}
          </p>
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <ArrowUpCircle className="h-3 w-3" />
            Disponível para saque
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Saldo Pendente</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {showBalance ? formatCurrency(saldoPendente) : '••••••'}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Aguardando aprovação
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Moedas ChamadoPro</span>
            <Coins className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {showBalance ? moedasChamadoPro.toLocaleString('pt-BR') : '••••'}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            onClick={() => setShowComprarMoedas(true)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Comprar Moedas
          </Button>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: TrendingUp },
            { id: 'movimentacoes', label: 'Movimentações', icon: ArrowDownCircle },
            { id: 'contas', label: 'Contas Bancárias', icon: Wallet },
            { id: 'cartoes', label: 'Cartões', icon: CreditCard },
            { id: 'moedas', label: 'Moedas', icon: Coins }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-orange-primary text-orange-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estatísticas */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Recebido</span>
                <span className="font-semibold text-green-600">{formatCurrency(estatisticas.totalRecebido)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Pago</span>
                <span className="font-semibold text-red-600">{formatCurrency(estatisticas.totalPago)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Taxa da Plataforma</span>
                <span className="font-semibold text-gray-900">{formatCurrency(estatisticas.taxaPlataforma)}</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600">Orçamentos Aprovados</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {estatisticas.orcamentosAprovados}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orçamentos Rejeitados</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {estatisticas.orcamentosRejeitados}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Resumo de Moedas */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Moedas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Moedas Compradas</span>
                <span className="font-semibold text-blue-600">{estatisticas.moedasCompradas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Moedas Usadas</span>
                <span className="font-semibold text-orange-600">{estatisticas.moedasUsadas}</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">
                  💡 Use moedas para criar posts, destacar ofertas e aumentar sua visibilidade na plataforma.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComprarMoedas(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Comprar Mais Moedas
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'movimentacoes' && (
        <div className="space-y-4">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filtroMovimentacao}
                  onChange={(e) => setFiltroMovimentacao(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">Todas as movimentações</option>
                  <option value="ENTRADA">Apenas entradas</option>
                  <option value="SAIDA">Apenas saídas</option>
                </select>
              </div>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADO">Aprovado</option>
                <option value="REJEITADO">Rejeitado</option>
              </select>
            </div>
          </Card>

          {/* Lista de Movimentações */}
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredMovimentacoes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  Nenhuma movimentação encontrada
                </div>
              ) : (
                filteredMovimentacoes.map((mov) => (
                  <div key={mov.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          mov.tipo === 'ENTRADA' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {mov.tipo === 'ENTRADA' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{mov.descricao}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(mov.data)}
                            <Badge variant="secondary" className="text-xs">
                              {mov.categoria.replace('_', ' ')}
                            </Badge>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(mov.status)}
                        <span className={`font-semibold ${
                          mov.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo === 'ENTRADA' ? '+' : '-'}{formatCurrency(mov.valor)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'contas' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Contas Bancárias</h2>
            <Button onClick={() => setShowFormConta(!showFormConta)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Conta
            </Button>
          </div>

          {showFormConta && (
            <Card className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Nova Conta Bancária</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Banco"
                  value={formConta.banco}
                  onChange={(e) => setFormConta({ ...formConta, banco: e.target.value })}
                  placeholder="Ex: Banco do Brasil"
                />
                <Input
                  label="Agência"
                  value={formConta.agencia}
                  onChange={(e) => setFormConta({ ...formConta, agencia: e.target.value })}
                  placeholder="0000-0"
                />
                <Input
                  label="Conta"
                  value={formConta.conta}
                  onChange={(e) => setFormConta({ ...formConta, conta: e.target.value })}
                  placeholder="00000-0"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formConta.tipo}
                    onChange={(e) => setFormConta({ ...formConta, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="CORRENTE">Conta Corrente</option>
                    <option value="POUPANCA">Conta Poupança</option>
                  </select>
                </div>
                <Input
                  label="Titular"
                  value={formConta.titular}
                  onChange={(e) => setFormConta({ ...formConta, titular: e.target.value })}
                  placeholder="Nome do titular"
                />
                <Input
                  label="CPF/CNPJ"
                  value={formConta.cpf_cnpj}
                  onChange={(e) => setFormConta({ ...formConta, cpf_cnpj: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowFormConta(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddConta}>
                  Salvar
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contasBancarias.length === 0 ? (
              <Card className="p-8 text-center col-span-2">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhuma conta bancária cadastrada</p>
                <Button onClick={() => setShowFormConta(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeira Conta
                </Button>
              </Card>
            ) : (
              contasBancarias.map((conta) => (
                <Card key={conta.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{conta.banco}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ag: {conta.agencia} | Conta: {conta.conta}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conta.tipo === 'CORRENTE' ? 'Conta Corrente' : 'Conta Poupança'}
                      </p>
                    </div>
                    <Badge variant="secondary">Principal</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'cartoes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Cartões Cadastrados</h2>
            <Button onClick={() => setShowFormCartao(!showFormCartao)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Cartão
            </Button>
          </div>

          {showFormCartao && (
            <Card className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Novo Cartão</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Número do Cartão"
                  value={formCartao.numero}
                  onChange={(e) => setFormCartao({ ...formCartao, numero: e.target.value })}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                />
                <Input
                  label="Nome do Titular"
                  value={formCartao.nome_titular}
                  onChange={(e) => setFormCartao({ ...formCartao, nome_titular: e.target.value })}
                  placeholder="NOME COMO NO CARTÃO"
                />
                <Input
                  label="Validade"
                  value={formCartao.validade}
                  onChange={(e) => setFormCartao({ ...formCartao, validade: e.target.value })}
                  placeholder="MM/AA"
                  maxLength={5}
                />
                <Input
                  label="CVV"
                  value={formCartao.cvv}
                  onChange={(e) => setFormCartao({ ...formCartao, cvv: e.target.value })}
                  placeholder="000"
                  maxLength={3}
                  type="password"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={formCartao.tipo}
                    onChange={(e) => setFormCartao({ ...formCartao, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="CREDITO">Cartão de Crédito</option>
                    <option value="DEBITO">Cartão de Débito</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowFormCartao(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCartao}>
                  Salvar
                </Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cartoes.length === 0 ? (
              <Card className="p-8 text-center col-span-2">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nenhum cartão cadastrado</p>
                <Button onClick={() => setShowFormCartao(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Cartão
                </Button>
              </Card>
            ) : (
              cartoes.map((cartao) => (
                <Card key={cartao.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-5 w-5 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          •••• •••• •••• {cartao.numero.slice(-4)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{cartao.nome_titular}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {cartao.tipo === 'CREDITO' ? 'Crédito' : 'Débito'} | Validade: {cartao.validade}
                      </p>
                    </div>
                    <Badge variant="secondary">Principal</Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'moedas' && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Moedas ChamadoPro</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Use moedas para criar posts, destacar ofertas e aumentar sua visibilidade
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-orange-600">
                  {moedasChamadoPro.toLocaleString('pt-BR')}
                </p>
                <p className="text-xs text-gray-500">moedas disponíveis</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => setShowComprarMoedas(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Comprar Moedas
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-md font-semibold text-gray-900 mb-4">Como Funciona</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Crie posts usando moedas (evita taxas adicionais)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Destaque seus serviços para maior visibilidade</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Negocie dentro da plataforma e garanta proteção</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Cliente e prestador têm garantias nas negociações</span>
              </li>
            </ul>
          </Card>
        </div>
      )}

      {/* Modal Comprar Moedas */}
      {showComprarMoedas && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Comprar Moedas ChamadoPro</h3>
                <button onClick={() => setShowComprarMoedas(false)}>
                  <XCircle className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor em R$ para comprar
                  </label>
                  <Input
                    type="number"
                    value={valorComprarMoedas}
                    onChange={(e) => setValorComprarMoedas(e.target.value)}
                    placeholder="0,00"
                    min="1"
                  />
                </div>
                {valorComprarMoedas && parseFloat(valorComprarMoedas) > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Você receberá: <span className="font-semibold text-blue-600">
                        {Math.floor(parseFloat(valorComprarMoedas) * 10).toLocaleString('pt-BR')} moedas
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Taxa de conversão: R$ 1,00 = 10 moedas
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowComprarMoedas(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleComprarMoedas}
                    disabled={!valorComprarMoedas || parseFloat(valorComprarMoedas) <= 0}
                  >
                    Comprar
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  return <AuthenticatedLayout>{content}</AuthenticatedLayout>;
}

