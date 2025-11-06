'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DocumentInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

interface DocumentValidationResult {
  isValid: boolean;
  formatted: string;
  type: 'CPF' | 'CNPJ' | 'INVALID';
  errors: string[];
}

export const DocumentInput: React.FC<DocumentInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = "000.000.000-00",
  required = false,
  className = ""
}) => {
  const [validation, setValidation] = useState<DocumentValidationResult>({
    isValid: false,
    formatted: '',
    type: 'INVALID',
    errors: []
  });
  const [isValidating, setIsValidating] = useState(false);

  // Função para validar CPF
  const validateCPF = (cpf: string): DocumentValidationResult => {
    const errors: string[] = [];
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    
    if (cleanCpf.length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      errors.push('CPF não pode ser uma sequência de números iguais');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) {
      errors.push('CPF inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) {
      errors.push('CPF inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    const formatted = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    return {
      isValid: true,
      formatted,
      type: 'CPF',
      errors: []
    };
  };

  // Função para validar CNPJ
  const validateCNPJ = (cnpj: string): DocumentValidationResult => {
    const errors: string[] = [];
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    
    if (cleanCnpj.length !== 14) {
      errors.push('CNPJ deve ter 14 dígitos');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      errors.push('CNPJ não pode ser uma sequência de números iguais');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cleanCnpj.charAt(12))) {
      errors.push('CNPJ inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cleanCnpj.charAt(13))) {
      errors.push('CNPJ inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    const formatted = cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    return {
      isValid: true,
      formatted,
      type: 'CNPJ',
      errors: []
    };
  };

  // Função para formatar documento enquanto digita
  const formatDocument = (input: string): string => {
    const clean = input.replace(/[^\d]/g, '');
    
    if (clean.length <= 11) {
      // Formatar como CPF
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formatar como CNPJ
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  // Validar documento
  const validateDocument = (document: string): DocumentValidationResult => {
    const clean = document.replace(/[^\d]/g, '');
    
    if (clean.length === 11) {
      return validateCPF(document);
    } else if (clean.length === 14) {
      return validateCNPJ(document);
    } else {
      return {
        isValid: false,
        formatted: document,
        type: 'INVALID',
        errors: ['Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)']
      };
    }
  };

  // Validar documento quando o valor muda
  useEffect(() => {
    if (value && value.length > 0) {
      setIsValidating(true);
      
      // Debounce para evitar validações excessivas
      const timeout = setTimeout(() => {
        const result = validateDocument(value);
        setValidation(result);
        setIsValidating(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    } else {
      setValidation({
        isValid: false,
        formatted: '',
        type: 'INVALID',
        errors: []
      });
    }
  }, [value]);

  // Manipular mudança no input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/[^\d]/g, '');
    
    // Limitar tamanho baseado no tipo
    if (cleanValue.length > 14) return;
    
    // Formatar enquanto digita
    const formatted = formatDocument(cleanValue);
    
    // Criar evento com valor formatado
    const formattedEvent = {
      ...e,
      target: {
        ...e.target,
        value: formatted
      }
    };
    
    onChange(formattedEvent);
  };

  const getStatusIcon = () => {
    if (isValidating) {
      return <AlertCircle className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
    
    if (validation.isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    
    if (validation.errors.length > 0) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    return null;
  };

  const getStatusColor = () => {
    if (isValidating) return 'border-yellow-300';
    if (validation.isValid) return 'border-green-500';
    if (validation.errors.length > 0) return 'border-red-500';
    return 'border-gray-300';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor()} ${
            error ? 'border-red-500' : ''
          }`}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {validation.errors.length > 0 && !error && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}

      {validation.isValid && (
        <div className="flex items-center space-x-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{validation.type} válido</span>
        </div>
      )}
    </div>
  );
};


