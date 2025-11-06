export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string;
  clean: string;
  ddd: string;
  number: string;
  type: 'mobile' | 'landline' | 'invalid';
  errors: string[];
}

// DDDs válidos do Brasil
const VALID_DDDS = [
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

// Números de celular válidos (9 dígitos)
const MOBILE_PATTERN = /^9\d{8}$/;
// Números de telefone fixo válidos (8 dígitos)
const LANDLINE_PATTERN = /^[2-5]\d{7}$/;

export const phoneValidator = {
  // Validar e formatar telefone brasileiro
  validate: (phone: string): PhoneValidationResult => {
    const errors: string[] = [];
    let isValid = true;

    // Limpar o telefone (remover tudo exceto números)
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

    // Se tem 11 dígitos, verificar se o número do celular começa com 9
    if (clean.length === 11) {
      const number = clean.substring(2);
      if (!number.startsWith('9')) {
        isValid = false;
        errors.push('Celular deve começar com 9');
      }
    }

    // Se tem 10 dígitos, verificar se não começa com 9 (fixo)
    if (clean.length === 10) {
      const number = clean.substring(2);
      if (number.startsWith('9')) {
        isValid = false;
        errors.push('Telefone fixo não pode começar com 9');
      }
    }

    // Extrair DDD e número
    let ddd = '';
    let number = '';

    if (clean.length >= 2) {
      ddd = clean.substring(0, 2);
      number = clean.substring(2);
    }

    // Verificar DDD válido
    if (ddd && !VALID_DDDS.includes(ddd)) {
      isValid = false;
      errors.push(`DDD ${ddd} não é válido`);
    }

    // Verificar formato do número
    let type: 'mobile' | 'landline' | 'invalid' = 'invalid';

    if (number.length === 9 && MOBILE_PATTERN.test(number)) {
      type = 'mobile';
    } else if (number.length === 8 && LANDLINE_PATTERN.test(number)) {
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
  },

  // Formatar telefone sem validar
  format: (phone: string): string => {
    const clean = phone.replace(/\D/g, '');
    
    if (clean.length === 11) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
    } else if (clean.length === 10) {
      return `(${clean.substring(0, 2)}) ${clean.substring(2, 6)}-${clean.substring(6)}`;
    }
    
    return phone;
  },

  // Limpar telefone (apenas números)
  clean: (phone: string): string => {
    return phone.replace(/\D/g, '');
  },

  // Verificar se é celular
  isMobile: (phone: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 11 && clean.startsWith('9');
  },

  // Verificar se é telefone fixo
  isLandline: (phone: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 10 && !clean.startsWith('9');
  },

  // Gerar telefone válido para teste
  generate: (type: 'mobile' | 'landline' = 'mobile', ddd?: string): string => {
    const validDDD = ddd || VALID_DDDS[Math.floor(Math.random() * VALID_DDDS.length)];
    
    if (type === 'mobile') {
      // Gerar número de celular válido (9XXXXXXXX)
      const firstDigit = '9';
      const remainingDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
      const number = firstDigit + remainingDigits;
      return `(${validDDD}) ${number.substring(0, 5)}-${number.substring(5)}`;
    } else {
      // Gerar número de telefone fixo válido (2XXXXXXX ou 3XXXXXXX ou 4XXXXXXX ou 5XXXXXXX)
      const firstDigit = ['2', '3', '4', '5'][Math.floor(Math.random() * 4)];
      const remainingDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      const number = firstDigit + remainingDigits;
      return `(${validDDD}) ${number.substring(0, 4)}-${number.substring(4)}`;
    }
  },

  // Validar DDD
  validateDDD: (ddd: string): boolean => {
    return VALID_DDDS.includes(ddd);
  },

  // Obter lista de DDDs válidos
  getValidDDDs: (): string[] => {
    return [...VALID_DDDS];
  },

  // Verificar se telefone está em formato brasileiro
  isBrazilianFormat: (phone: string): boolean => {
    const clean = phone.replace(/\D/g, '');
    return clean.length === 10 || clean.length === 11;
  }
};


