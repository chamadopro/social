'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  showStrength?: boolean;
  className?: string;
}

interface PasswordRequirement {
  text: string;
  isValid: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder = "Sua senha",
  required = false,
  showStrength = true,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([]);
  const [strength, setStrength] = useState({ level: '', color: '', score: 0 });

  const validatePassword = (password: string) => {
    const reqs: PasswordRequirement[] = [
      {
        text: 'Pelo menos 8 caracteres',
        isValid: password.length >= 8
      },
      {
        text: 'Pelo menos uma letra maiúscula',
        isValid: /[A-Z]/.test(password)
      },
      {
        text: 'Pelo menos uma letra minúscula',
        isValid: /[a-z]/.test(password)
      },
      {
        text: 'Pelo menos um número',
        isValid: /\d/.test(password)
      },
      {
        text: 'Pelo menos um símbolo especial',
        isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      },
      {
        text: 'Não conter sequências comuns',
        isValid: !['12345678', 'password', 'senha123', 'admin123', 'qwerty123', 'abc12345'].some(pattern => 
          password.toLowerCase().includes(pattern.toLowerCase())
        )
      }
    ];

    setRequirements(reqs);

    // Calcular força da senha
    let score = 0;
    const validReqs = reqs.filter(req => req.isValid).length;
    score = (validReqs / reqs.length) * 100;

    // Bônus por comprimento
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Bônus por múltiplos símbolos
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 10;
    }

    score = Math.min(score, 100);

    let level = '';
    let color = '';
    
    if (score < 30) {
      level = 'Muito Fraca';
      color = '#F44336';
    } else if (score < 50) {
      level = 'Fraca';
      color = '#FF9800';
    } else if (score < 70) {
      level = 'Média';
      color = '#FFC107';
    } else if (score < 90) {
      level = 'Forte';
      color = '#4CAF50';
    } else {
      level = 'Muito Forte';
      color = '#2196F3';
    }

    setStrength({ level, color, score });
  };

  useEffect(() => {
    if (value) {
      validatePassword(value);
    } else {
      setRequirements([]);
      setStrength({ level: '', color: '', score: 0 });
    }
  }, [value]);

  const isPasswordValid = requirements.length > 0 && requirements.every(req => req.isValid);

  return (
    <div className={`space-y-2 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : isPasswordValid ? 'border-green-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {showStrength && value && (
        <div className="space-y-2">
          {/* Barra de força da senha */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Força da senha:</span>
              <span style={{ color: strength.color }}>{strength.level}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${strength.score}%`,
                  backgroundColor: strength.color
                }}
              />
            </div>
          </div>

          {/* Lista de requisitos */}
          <div className="space-y-1">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-xs">
                {req.isValid ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className={req.isValid ? 'text-green-600' : 'text-red-600'}>
                  {req.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

