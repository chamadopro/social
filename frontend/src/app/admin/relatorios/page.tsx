'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Download,
  Calendar
} from 'lucide-react';

interface RelatorioData {
  tipo: string;
  periodo: string;
  dataInicio: string;
  dataFim: string;
  relatorio: any;
}

export default function AdminRelatoriosPage() {
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<RelatorioData | null>(null);
  const [tipoRelatorio, setTipoRelatorio] = useState('geral');
  const [periodo, setPeriodo] = useState('30');

  useEffect(() => {
    fetchRelatorio();
  }, [tipoRelatorio, periodo]);

  const fetchRelatorio = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/relatorios/avancados', {
        tipo: tipoRelatorio,
        periodo
      });

      if (response.success && response.data) {
        setRelatorio(response.data);
      }
    } catch (err: any) {
      console.error('Erro ao carregar relatório:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async (formato: 'csv' | 'json') => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/admin/exportar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            tipo: tipoRelatorio,
            formato
          })
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tipoRelatorio}_${new Date().toISOString().split('T')[0]}.${formato === 'csv' ? 'csv' : 'json'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const renderGraficoBarras = (dados: any[], labelKey: string, valueKey: string, title: string) => {
    if (!dados || dados.length === 0) return null;

    const maxValue = Math.max(...dados.map(d => d[valueKey]));
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="space-y-2">
          {dados.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-24 text-xs text-gray-600 truncate">{item[labelKey]}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">{item[valueKey]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGraficoLinha = (dados: any[], labelKey: string, valueKey: string, title: string) => {
    if (!dados || dados.length === 0) return null;

    const maxValue = Math.max(...dados.map(d => d[valueKey]));
    const minValue = Math.min(...dados.map(d => d[valueKey]));

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
        <div className="relative h-48 border-l-2 border-b-2 border-gray-300">
          {dados.map((item, index) => {
            const height = maxValue > 0 ? ((item[valueKey] - minValue) / (maxValue - minValue)) * 100 : 0;
            const width = 100 / dados.length;
            return (
              <div
                key={index}
                className="absolute bottom-0 bg-blue-500 rounded-t"
                style={{
                  left: `${index * width}%`,
                  width: `${width * 0.8}%`,
                  height: `${height}%`,
                  minHeight: '2px'
                }}
                title={`${item[labelKey]}: ${item[valueKey]}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{dados[0]?.[labelKey]}</span>
          <span>{dados[dados.length - 1]?.[labelKey]}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
          <p className="text-gray-600 mt-1">Análise detalhada do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExportar('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            onClick={() => handleExportar('json')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="geral">Geral</option>
              <option value="usuarios">Usuários</option>
              <option value="posts">Posts</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="180">Últimos 180 dias</option>
              <option value="365">Último ano</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Relatório */}
      {relatorio && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cards de Resumo */}
          <div className="space-y-4">
            {tipoRelatorio === 'geral' && (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuários Novos</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {relatorio.relatorio.usuariosNovos || 0}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Posts Novos</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {relatorio.relatorio.postsNovos || 0}
                      </p>
                    </div>
                    <FileText className="h-12 w-12 text-green-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Receitas</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        R$ {relatorio.relatorio.receitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-yellow-500" />
                  </div>
                </Card>
              </>
            )}

            {tipoRelatorio === 'usuarios' && (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuários Novos</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {relatorio.relatorio.totalNovos || 0}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {relatorio.relatorio.totalAtivos || 0}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-green-500" />
                  </div>
                </Card>

                {relatorio.relatorio.crescimento !== undefined && (
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Crescimento</p>
                        <p className={`text-2xl font-bold mt-2 ${
                          relatorio.relatorio.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {relatorio.relatorio.crescimento >= 0 ? '+' : ''}{relatorio.relatorio.crescimento.toFixed(1)}%
                        </p>
                      </div>
                      <TrendingUp className={`h-12 w-12 ${
                        relatorio.relatorio.crescimento >= 0 ? 'text-green-500' : 'text-red-500'
                      }`} />
                    </div>
                  </Card>
                )}
              </>
            )}

            {tipoRelatorio === 'financeiro' && (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Receitas</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        R$ {relatorio.relatorio.totalReceitas?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-500" />
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pagamentos</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {relatorio.relatorio.totalPagamentos || 0}
                      </p>
                    </div>
                    <DollarSign className="h-12 w-12 text-blue-500" />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* Gráficos */}
          <div className="space-y-4">
            {tipoRelatorio === 'usuarios' && relatorio.relatorio.porTipo && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Usuários por Tipo</h2>
                {renderGraficoBarras(relatorio.relatorio.porTipo, 'tipo', 'quantidade', '')}
              </Card>
            )}

            {tipoRelatorio === 'posts' && relatorio.relatorio.porCategoria && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Posts por Categoria</h2>
                {renderGraficoBarras(relatorio.relatorio.porCategoria, 'categoria', 'quantidade', '')}
              </Card>
            )}

            {tipoRelatorio === 'financeiro' && relatorio.relatorio.receitasPorDia && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Receitas por Dia</h2>
                {renderGraficoLinha(relatorio.relatorio.receitasPorDia, 'data', 'valor', '')}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

