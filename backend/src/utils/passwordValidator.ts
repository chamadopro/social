export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  score: number; // 0-100
}

export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  forbiddenPatterns: string[];
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  forbiddenPatterns: [
    '12345678',
    'password',
    'senha123',
    'admin123',
    'qwerty123',
    'abc12345'
  ]
};

export class PasswordValidator {
  private requirements: PasswordRequirements;

  constructor(requirements: PasswordRequirements = DEFAULT_REQUIREMENTS) {
    this.requirements = requirements;
  }

  validate(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let score = 0;

    // Verificar comprimento mínimo
    if (password.length < this.requirements.minLength) {
      errors.push(`A senha deve ter pelo menos ${this.requirements.minLength} caracteres`);
    } else {
      score += 20;
    }

    // Verificar letra maiúscula
    if (this.requirements.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra maiúscula');
    } else if (this.requirements.requireUppercase) {
      score += 20;
    }

    // Verificar letra minúscula
    if (this.requirements.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('A senha deve conter pelo menos uma letra minúscula');
    } else if (this.requirements.requireLowercase) {
      score += 20;
    }

    // Verificar números
    if (this.requirements.requireNumbers && !/\d/.test(password)) {
      errors.push('A senha deve conter pelo menos um número');
    } else if (this.requirements.requireNumbers) {
      score += 20;
    }

    // Verificar símbolos
    if (this.requirements.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('A senha deve conter pelo menos um símbolo especial (!@#$%^&*...)');
    } else if (this.requirements.requireSymbols) {
      score += 20;
    }

    // Verificar padrões proibidos
    const lowerPassword = password.toLowerCase();
    for (const pattern of this.requirements.forbiddenPatterns) {
      if (lowerPassword.includes(pattern.toLowerCase())) {
        errors.push('A senha não pode conter sequências comuns ou palavras óbvias');
        break;
      }
    }

    // Bônus por complexidade
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?].*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 10; // Múltiplos símbolos
    }

    return {
      isValid: errors.length === 0,
      errors,
      score: Math.min(score, 100)
    };
  }

  getStrengthLevel(score: number): { level: string; color: string; description: string } {
    if (score < 30) {
      return { level: 'Muito Fraca', color: '#F44336', description: 'Senha muito fácil de quebrar' };
    } else if (score < 50) {
      return { level: 'Fraca', color: '#FF9800', description: 'Senha fraca, fácil de adivinhar' };
    } else if (score < 70) {
      return { level: 'Média', color: '#FFC107', description: 'Senha razoável, mas pode ser melhorada' };
    } else if (score < 90) {
      return { level: 'Forte', color: '#4CAF50', description: 'Senha forte e segura' };
    } else {
      return { level: 'Muito Forte', color: '#2196F3', description: 'Senha muito forte e segura' };
    }
  }

  generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = uppercase + lowercase + numbers + symbols;
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Preencher o resto aleatoriamente
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}

// Instância padrão
export const passwordValidator = new PasswordValidator();

