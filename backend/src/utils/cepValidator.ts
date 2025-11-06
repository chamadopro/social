export interface CEPValidationResult {
  isValid: boolean;
  formatted: string;
  clean: string;
  address?: {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
  };
  errors: string[];
}

export interface CEPAddress {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
}

export const cepValidator = {
  // Validar formato de CEP
  validateFormat: (cep: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    let isValid = true;

    // Limpar CEP (remover tudo exceto números)
    const clean = cep.replace(/\D/g, '');

    // Verificar se tem 8 dígitos
    if (clean.length !== 8) {
      isValid = false;
      errors.push('CEP deve ter exatamente 8 dígitos');
    }

    // Verificar se não são todos iguais (ex: 00000000, 11111111)
    if (clean.length === 8 && /^(\d)\1{7}$/.test(clean)) {
      isValid = false;
      errors.push('CEP não pode ter todos os dígitos iguais');
    }

    return { isValid, errors };
  },

  // Buscar CEP na API ViaCEP
  async fetchCEP(cep: string): Promise<{ success: boolean; data?: CEPAddress; error?: string }> {
    try {
      const clean = cep.replace(/\D/g, '');
      
      if (clean.length !== 8) {
        return { success: false, error: 'CEP deve ter 8 dígitos' };
      }

      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      
      if (!response.ok) {
        return { success: false, error: 'Erro ao consultar CEP' };
      }

      const data = await response.json() as any;

      // Verificar se CEP foi encontrado
      if (data.erro) {
        return { success: false, error: 'CEP não encontrado' };
      }

      return {
        success: true,
        data: {
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
        }
      };

    } catch (error) {
      return { 
        success: false, 
        error: 'Erro de conexão ao consultar CEP' 
      };
    }
  },

  // Validar CEP completo (formato + API)
  async validate(cep: string): Promise<CEPValidationResult> {
    const errors: string[] = [];
    let isValid = true;

    // Limpar CEP
    const clean = cep.replace(/\D/g, '');

    // Validar formato
    const formatValidation = this.validateFormat(cep);
    if (!formatValidation.isValid) {
      isValid = false;
      errors.push(...formatValidation.errors);
    }

    // Se formato é válido, buscar na API
    let address: CEPAddress | undefined;
    if (formatValidation.isValid) {
      const apiResult = await this.fetchCEP(clean);
      if (!apiResult.success) {
        isValid = false;
        errors.push(apiResult.error || 'Erro ao consultar CEP');
      } else {
        address = apiResult.data;
      }
    }

    // Formatar CEP
    let formatted = cep;
    if (clean.length === 8) {
      formatted = `${clean.substring(0, 5)}-${clean.substring(5)}`;
    }

    return {
      isValid,
      formatted,
      clean,
      address,
      errors
    };
  },

  // Formatar CEP sem validar
  format: (cep: string): string => {
    const clean = cep.replace(/\D/g, '');
    
    if (clean.length === 8) {
      return `${clean.substring(0, 5)}-${clean.substring(5)}`;
    }
    
    return cep;
  },

  // Limpar CEP (apenas números)
  clean: (cep: string): string => {
    return cep.replace(/\D/g, '');
  },

  // Verificar se CEP está em formato brasileiro
  isBrazilianFormat: (cep: string): boolean => {
    const clean = cep.replace(/\D/g, '');
    return clean.length === 8;
  },

  // Gerar CEP válido para teste (usando CEPs conhecidos)
  generate: (): string => {
    const knownCEPs = [
      '01310-100', // Av. Paulista, São Paulo
      '20040-020', // Rua da Carioca, Rio de Janeiro
      '30112-000', // Rua da Bahia, Belo Horizonte
      '40070-110', // Rua Chile, Salvador
      '50030-230', // Rua do Bom Jesus, Recife
      '60060-170', // Rua Barão do Rio Branco, Fortaleza
      '70040-010', // Esplanada dos Ministérios, Brasília
      '80020-030', // Rua XV de Novembro, Curitiba
      '90020-004', // Rua dos Andradas, Porto Alegre
      '01001-000'  // Praça da Sé, São Paulo
    ];

    return knownCEPs[Math.floor(Math.random() * knownCEPs.length)];
  },

  // Validar UF
  validateUF: (uf: string): boolean => {
    const validUFs = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
    return validUFs.includes(uf.toUpperCase());
  },

  // Obter lista de UFs válidas
  getValidUFs: (): string[] => {
    return [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
  }
};
