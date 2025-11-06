'use client';

import React, { useState, useMemo } from 'react';
import { Input } from './Input';
import { CheckCircle, XCircle, Phone } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  showValidation?: boolean;
}

// Validação de telefone brasileiro (frontend)
const validatePhone = (phone: string) => {
  const errors: string[] = [];
  let isValid = true;

  // Limpar o telefone
  const clean = phone.replace(/\D/g, '');

  // Verificar se tem pelo menos 10 dígitos
  if (clean.length < 10) {
    isValid = false;
    errors.push('Telefone deve ter pelo menos 10 dígitos');
  }

  // Verificar se tem no máximo 11 dígitos
  if (clean.length > 11) {
    isValid = false;
    errors.push('Telefone deve ter no máximo 11 dígitos');
  }

  // Se tem 11 dígitos, verificar se começa com 9 (celular)
  if (clean.length === 11 && !clean.startsWith('9')) {
    isValid = false;
    errors.push('Celular deve começar com 9');
  }

  // Se tem 10 dígitos, verificar se não começa com 9 (fixo)
  if (clean.length === 10 && clean.startsWith('9')) {
    isValid = false;
    errors.push('Telefone fixo não pode começar com 9');
  }

  // Extrair DDD e número
  let ddd = '';
  let number = '';

  if (clean.length >= 10) {
    ddd = clean.substring(0, 2);
    number = clean.substring(2);
  }

  // DDDs válidos do Brasil
  const validDDDs = [
    '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
    '21', '22', '24', // RJ
    '27', '28', // ES
    '31', '32', '33', '34', '35', '37', '38', // MG
    '41', '42', '43', '44', '45', '46', // PR
    '47', '48', '49', // SC
    '51', '53', '54', '55', // RS
    '61', // DF
    '62', '64', // GO
    '63', // TO
    '65', '66', // MT
    '67', // MS
    '68', // AC
    '69', // RO
    '71', '73', '74', '75', '77', // BA
    '79', // SE
    '81', '87', // PE
    '82', // AL
    '83', // PB
    '84', // RN
    '85', '88', // CE
    '86', '89', // PI
    '91', '93', '94', // PA
    '92', '97', // AM
    '95', // RR
    '96', // AP
    '98', '99' // MA
  ];

  // Verificar DDD válido
  if (ddd && !validDDDs.includes(ddd)) {
    isValid = false;
    errors.push(`DDD ${ddd} não é válido`);
  }

  // Verificar formato do número
  let type: 'mobile' | 'landline' | 'invalid' = 'invalid';

  if (number.length === 9 && /^9\d{8}$/.test(number)) {
    type = 'mobile';
  } else if (number.length === 8 && /^[2-5]\d{7}$/.test(number)) {
    type = 'landline';
  } else if (number.length > 0) {
    isValid = false;
    if (number.length === 9) {
      errors.push('Número de celular inválido');
    } else if (number.length === 8) {
      errors.push('Número de telefone fixo inválido');
    }
  }

  // Formatar telefone
  let formatted = '';
  if (isValid && ddd && number) {
    if (type === 'mobile') {
      formatted = `(${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
    } else if (type === 'landline') {
      formatted = `(${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`;
    }
  }

  return {
    isValid,
    formatted,
    clean,
    ddd,
    number,
    type,
    errors
  };
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = '11941774092',
  showValidation = false,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const validation = useMemo(() => validatePhone(value), [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remover caracteres não numéricos (permite apenas números)
    const cleanValue = inputValue.replace(/\D/g, '');
    
    // Limitar a 11 dígitos
    const limitedValue = cleanValue.substring(0, 11);
    
    // Criar evento com valor limpo (sem formatação)
    const cleanEvent = {
      ...e,
      target: {
        ...e.target,
        value: limitedValue
      }
    };

    onChange(cleanEvent);
  };

  const getTypeLabel = () => {
    if (validation.type === 'mobile') return 'Celular';
    if (validation.type === 'landline') return 'Fixo';
    return '';
  };

  const getTypeColor = () => {
    if (validation.type === 'mobile') return 'text-green-600';
    if (validation.type === 'landline') return 'text-blue-600';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          {...props}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            validation.isValid && !error && "border-green-500 focus:border-green-500 focus:ring-green-500"
          )}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {validation.isValid && !error && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {error && (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Feedback de validação */}
      {showValidation && value && (
        <div className="space-y-1">
          {/* Tipo de telefone */}
          {validation.type !== 'invalid' && (
            <div className={cn("text-sm font-medium", getTypeColor())}>
              {getTypeLabel()}
            </div>
          )}

          {/* Erros de validação */}
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-600 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  {error}
                </div>
              ))}
            </div>
          )}

          {/* Formato válido */}
          {validation.isValid && validation.formatted && (
            <div className="text-sm text-green-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Formato válido: {validation.formatted}
            </div>
          )}
        </div>
      )}

      {/* Erro do formulário */}
      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <XCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      {/* Dica de formato */}
      {!value && !error && (
        <p className="text-sm text-gray-500">
          Digite apenas os números do telefone com DDD. Ex: 11941774092
        </p>
      )}
    </div>
  );
};


