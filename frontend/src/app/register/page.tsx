'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { UserPlus, Briefcase, ArrowRight } from 'lucide-react';

export default function RegisterSelectPage() {
  const router = useRouter();

  const handleSelect = (tipo: 'cliente' | 'prestador', pessoaTipo?: 'PF' | 'PJ') => {
    if (pessoaTipo) {
      router.push(`/register-${tipo}?tipo=${pessoaTipo}`);
    } else {
      router.push(`/register-${tipo}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo ao ChamadoPro
          </h1>
          <p className="text-xl text-gray-600">
            Como você deseja usar nossa plataforma?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cliente */}
          <Card className="p-0 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
            <div onClick={() => handleSelect('cliente')} className="p-8">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sou Cliente
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Quero contratar serviços profissionais na minha região
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-sm">Encontre prestadores próximos</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-sm">Receba orçamentos personalizados</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  <span className="text-sm">Compare preços e avalie profissionais</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                Começar Cadastro
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Para empresas e pessoas físicas
              </p>
            </div>
          </Card>

          {/* Prestador */}
          <Card className="p-0 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
            <div onClick={() => handleSelect('prestador')} className="p-8">
              <div className="flex items-start mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <Briefcase className="w-8 h-8 text-orange-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Sou Prestador
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Quero oferecer meus serviços e conquistar novos clientes
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-sm">Crie seu perfil profissional</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-sm">Receba solicitações da sua região</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                  <span className="text-sm">Aumente sua carteira de clientes</span>
                </div>
              </div>

              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center">
                Começar Cadastro
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Para MEI, empresas e profissionais autônomos
              </p>
            </div>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Já tem uma conta?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-700 font-semibold underline"
            >
              Entre aqui
            </button>
          </p>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
