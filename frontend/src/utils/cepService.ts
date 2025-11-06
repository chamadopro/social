/**
 * Serviço para busca de endereço por CEP usando ViaCEP
 */

export interface Address {
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
  erro?: boolean;
}

/**
 * Buscar endereço por CEP usando ViaCEP
 */
export async function searchCEP(cep: string): Promise<Address | null> {
  try {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/[^\d]/g, '');
    
    // Verifica se tem 8 dígitos
    if (cleanCep.length !== 8) {
      return null;
    }
    
    // Busca na API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      return null;
    }
    
    const data: Address = await response.json();
    
    // Verifica se retornou erro
    if (data.erro) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

/**
 * Formatar endereço retornado pela ViaCEP para o formato do sistema
 */
export function formatAddressFromCEP(address: Address): {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
} {
  return {
    cep: address.cep,
    rua: address.logradouro || '',
    bairro: address.bairro || '',
    cidade: address.localidade || '',
    estado: address.uf || '',
  };
}

