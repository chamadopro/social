'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Input } from './Input';
import { CheckCircle, XCircle, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CEPInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddressFound?: (address: any) => void;
  error?: string;
  placeholder?: string;
  showValidation?: boolean;
}

// Validação de CEP (frontend)
const validateCEPFormat = (cep: string) => {
  const errors: string[] = [];
  let isValid = true;

  // Limpar CEP
  const clean = cep.replace(/\D/g, '');

  // Verificar se tem 8 dígitos
  if (clean.length !== 8) {
    isValid = false;
    errors.push('CEP deve ter exatamente 8 dígitos');
  }

  // Verificar se não são todos iguais
  if (clean.length === 8 && /^(\d)\1{7}$/.test(clean)) {
    isValid = false;
    errors.push('CEP não pode ter todos os dígitos iguais');
  }

  return { isValid, errors, clean };
};

export const CEPInput: React.FC<CEPInputProps> = ({
  label,
  name,
  value,
  onChange,
  onAddressFound,
  error,
  placeholder = '00000-000',
  showValidation = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [address, setAddress] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');

  const validation = useMemo(() => validateCEPFormat(value), [value]);

  // Buscar CEP na API ViaCEP
  const fetchCEP = useCallback(async (cep: string) => {
    if (!validation.isValid) return;

    setIsLoading(true);
    setApiError('');

    try {
      const clean = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data = await response.json();

      if (data.erro) {
        setApiError('CEP não encontrado');
        setAddress(null);
      } else {
        const addressData = {
          cep: data.cep,
          logradouro: data.logradouro,
          complemento: data.complemento,
          bairro: data.bairro,
          localidade: data.localidade,
          uf: data.uf,
          ibge: data.ibge,
          gia: data.gia,
          ddd: data.ddd,
          siafi: data.siafi
        };

        setAddress(addressData);
        setApiError('');

        // Chamar callback se fornecido
        if (onAddressFound) {
          onAddressFound(addressData);
        }
      }
    } catch (error) {
      setApiError('Erro de conexão ao consultar CEP');
      setAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, [validation.isValid, onAddressFound]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remover caracteres não numéricos
    const cleanValue = inputValue.replace(/\D/g, '');
    
    // Aplicar máscara
    let maskedValue = '';
    if (cleanValue.length <= 5) {
      maskedValue = cleanValue;
    } else if (cleanValue.length <= 8) {
      maskedValue = `${cleanValue.substring(0, 5)}-${cleanValue.substring(5)}`;
    } else {
      // Limitar a 8 dígitos
      const limitedValue = cleanValue.substring(0, 8);
      maskedValue = `${limitedValue.substring(0, 5)}-${limitedValue.substring(5)}`;
    }

    // Criar evento com valor mascarado
    const maskedEvent = {
      ...e,
      target: {
        ...e.target,
        value: maskedValue
      }
    };

    onChange(maskedEvent);

    // Buscar CEP automaticamente quando tiver 8 dígitos
    if (cleanValue.length === 8) {
      fetchCEP(maskedValue);
    } else {
      // Limpar dados quando CEP for alterado
      setAddress(null);
      setApiError('');
    }
  };

  const handleBlur = () => {
    // Buscar CEP quando sair do campo se tiver 8 dígitos
    if (validation.isValid && validation.clean.length === 8) {
      fetchCEP(value);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
    }
    
    if (address && !apiError) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    if (apiError || error) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    
    return <MapPin className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <Input
          {...props}
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pl-10 pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            address && !apiError && !error && "border-green-500 focus:border-green-500 focus:ring-green-500"
          )}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {getStatusIcon()}
        </div>
      </div>

      {/* Feedback de validação */}
      {showValidation && value && (
        <div className="space-y-2">
          {/* Erros de formato */}
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

          {/* Erro da API */}
          {apiError && (
            <div className="text-sm text-red-600 flex items-center">
              <XCircle className="h-4 w-4 mr-1" />
              {apiError}
            </div>
          )}

          {/* Endereço encontrado */}
          {address && !apiError && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm text-green-800 font-medium mb-1">
                Endereço encontrado:
              </div>
              <div className="text-sm text-green-700">
                <div>{address.logradouro}</div>
                {address.complemento && <div>{address.complemento}</div>}
                <div>{address.bairro} - {address.localidade}/{address.uf}</div>
                <div>CEP: {address.cep}</div>
              </div>
            </div>
          )}

          {/* Formato válido mas sem busca */}
          {validation.isValid && !address && !apiError && !isLoading && (
            <div className="text-sm text-blue-600 flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Formato válido. Digite o CEP completo para buscar o endereço.
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
          Digite o CEP para buscar o endereço automaticamente
        </p>
      )}
    </div>
  );
};


