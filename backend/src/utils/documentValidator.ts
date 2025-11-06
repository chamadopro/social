import { validateCPF, validateCNPJ } from '../middleware/validation';

export interface DocumentValidationResult {
  isValid: boolean;
  formatted: string;
  type: 'CPF' | 'CNPJ' | 'INVALID';
  errors: string[];
}

export class DocumentValidator {
  // Validar e formatar CPF
  public static validateCPF(cpf: string): DocumentValidationResult {
    const errors: string[] = [];
    
    // Remover caracteres não numéricos
    const cleanCpf = cpf.replace(/[^\d]/g, '');
    
    // Verificar se tem 11 dígitos
    if (cleanCpf.length !== 11) {
      errors.push('CPF deve ter 11 dígitos');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    // Verificar se não é sequência (111.111.111-11)
    if (/^(\d)\1{10}$/.test(cleanCpf)) {
      errors.push('CPF não pode ser uma sequência de números iguais');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar dígitos verificadores
    if (!validateCPF(cleanCpf)) {
      errors.push('CPF inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cpf,
        type: 'INVALID',
        errors
      };
    }
    
    // Formatar CPF (000.000.000-00)
    const formatted = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    return {
      isValid: true,
      formatted,
      type: 'CPF',
      errors: []
    };
  }
  
  // Validar e formatar CNPJ
  public static validateCNPJ(cnpj: string): DocumentValidationResult {
    const errors: string[] = [];
    
    // Remover caracteres não numéricos
    const cleanCnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verificar se tem 14 dígitos
    if (cleanCnpj.length !== 14) {
      errors.push('CNPJ deve ter 14 dígitos');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    // Verificar se não é sequência (11.111.111/1111-11)
    if (/^(\d)\1{13}$/.test(cleanCnpj)) {
      errors.push('CNPJ não pode ser uma sequência de números iguais');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    // Validar dígitos verificadores
    if (!validateCNPJ(cleanCnpj)) {
      errors.push('CNPJ inválido - dígitos verificadores incorretos');
      return {
        isValid: false,
        formatted: cnpj,
        type: 'INVALID',
        errors
      };
    }
    
    // Formatar CNPJ (00.000.000/0000-00)
    const formatted = cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    return {
      isValid: true,
      formatted,
      type: 'CNPJ',
      errors: []
    };
  }
  
  // Validar documento (CPF ou CNPJ) baseado no tamanho
  public static validateDocument(document: string): DocumentValidationResult {
    const cleanDocument = document.replace(/[^\d]/g, '');
    
    if (cleanDocument.length === 11) {
      return this.validateCPF(document);
    } else if (cleanDocument.length === 14) {
      return this.validateCNPJ(document);
    } else {
      return {
        isValid: false,
        formatted: document,
        type: 'INVALID',
        errors: ['Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)']
      };
    }
  }
  
  // Verificar se é CPF
  public static isCPF(document: string): boolean {
    const cleanDocument = document.replace(/[^\d]/g, '');
    return cleanDocument.length === 11;
  }
  
  // Verificar se é CNPJ
  public static isCNPJ(document: string): boolean {
    const cleanDocument = document.replace(/[^\d]/g, '');
    return cleanDocument.length === 14;
  }
  
  // Gerar CPF válido para testes (apenas para desenvolvimento)
  public static generateValidCPF(): string {
    // Gerar 9 primeiros dígitos aleatórios
    let cpf = '';
    for (let i = 0; i < 9; i++) {
      cpf += Math.floor(Math.random() * 10);
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    // Calcular segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    cpf += remainder;
    
    return cpf;
  }
  
  // Gerar CNPJ válido para testes (apenas para desenvolvimento)
  public static generateValidCNPJ(): string {
    // Gerar 12 primeiros dígitos aleatórios
    let cnpj = '';
    for (let i = 0; i < 12; i++) {
      cnpj += Math.floor(Math.random() * 10);
    }
    
    // Calcular primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    cnpj += digit1;
    
    // Calcular segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cnpj.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    cnpj += digit2;
    
    return cnpj;
  }
}

// Instância padrão
export const documentValidator = DocumentValidator;


