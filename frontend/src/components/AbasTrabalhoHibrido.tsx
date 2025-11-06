'use client';

import React from 'react';
import { Briefcase, User } from 'lucide-react';

interface AbasTrabalhoHibridoProps {
  abaAtiva: 'PRESTADOR' | 'CLIENTE';
  onAbaChange: (aba: 'PRESTADOR' | 'CLIENTE') => void;
}

export function AbasTrabalhoHibrido({ abaAtiva, onAbaChange }: AbasTrabalhoHibridoProps) {
  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      <button
        onClick={() => onAbaChange('PRESTADOR')}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
          abaAtiva === 'PRESTADOR'
            ? 'border-orange-primary text-orange-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        <Briefcase className="h-4 w-4" />
        Trabalho como Prestador
      </button>
      <button
        onClick={() => onAbaChange('CLIENTE')}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
          abaAtiva === 'CLIENTE'
            ? 'border-orange-primary text-orange-primary'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        <User className="h-4 w-4" />
        Trabalho como Cliente
      </button>
    </div>
  );
}

