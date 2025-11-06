/**
 * Utilitários para formatação e máscaras de campos
 */

/**
 * Remove todos os caracteres não numéricos de uma string
 */
export function removeNonNumeric(value: string): string {
  return value.replace(/[^\d]/g, '');
}

/**
 * Formatar CPF (000.000.000-00)
 */
export function formatCPF(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
}

/**
 * Formatar CNPJ (00.000.000/0000-00)
 */
export function formatCNPJ(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  }
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  }
  
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
}

/**
 * Formatar telefone ((00) 00000-0000 ou (00) 0000-0000)
 */
export function formatPhone(value: string): string {
  const numbers = removeNonNumeric(value);
  
  // Remover zeros à esquerda se houver
  if (numbers.length === 0) return '';
  
  // Telefone celular (11 dígitos)
  if (numbers.length <= 2) {
    return `(${numbers}`;
  }
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  
  // Verificar se é celular (10 ou 11 dígitos)
  if (numbers.length <= 10) {
    // Telefone fixo
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    // Telefone celular
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
}

/**
 * Formatar CEP (00000-000)
 */
export function formatCEP(value: string): string {
  const numbers = removeNonNumeric(value);
  
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
}

/**
 * Validar CPF (apenas dígitos verificadores básicos)
 */
export function validateCPF(cpf: string): boolean {
  const numbers = removeNonNumeric(cpf);
  
  if (numbers.length !== 11) return false;
  
  // Verificar se não é sequência (111.111.111-11)
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  let remainder;
  
  // Primeiro dígito
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(9, 10))) return false;
  
  // Segundo dígito
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(numbers.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers.substring(10, 11))) return false;
  
  return true;
}

/**
 * Validar CNPJ (apenas dígitos verificadores básicos)
 * Mesmo algoritmo usado no backend
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = removeNonNumeric(cnpj);
  
  if (numbers.length !== 14 || /^(\d)\1{13}$/.test(numbers)) {
    return false;
  }
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers.charAt(12))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(numbers.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers.charAt(13))) return false;
  
  return true;
}

/**
 * Determinar automaticamente se é CPF ou CNPJ
 */
export function formatDocument(value: string, type?: 'CPF' | 'CNPJ'): string {
  if (type === 'CPF') return formatCPF(value);
  if (type === 'CNPJ') return formatCNPJ(value);
  
  const numbers = removeNonNumeric(value);
  
  // Se tem 11 ou menos dígitos, assume CPF
  if (numbers.length <= 11) return formatCPF(value);
  
  // Se tem mais de 11, assume CNPJ
  return formatCNPJ(value);
}

/**
 * Validar documento (CPF ou CNPJ)
 */
export function validateDocument(document: string, type?: 'CPF' | 'CNPJ'): boolean {
  if (type === 'CPF') return validateCPF(document);
  if (type === 'CNPJ') return validateCNPJ(document);
  
  const numbers = removeNonNumeric(document);
  
  // Se tem 11 dígitos, valida como CPF
  if (numbers.length === 11) return validateCPF(document);
  
  // Se tem 14 dígitos, valida como CNPJ
  if (numbers.length === 14) return validateCNPJ(document);
  
  return false;
}

