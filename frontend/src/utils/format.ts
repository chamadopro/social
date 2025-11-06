import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Formatação de moeda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatação de data
export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
}

// Formatação de data relativa
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { 
    addSuffix: true, 
    locale: ptBR 
  });
}

// Formatação de telefone
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Formatação de CPF
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
  }
  return cpf;
}

// Formatação de CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/);
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
  }
  return cnpj;
}

// Formatação de CEP
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{5})(\d{3})$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  return cep;
}

// Formatação de distância
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance.toFixed(1)}km`;
}

// Formatação de avaliação
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

// Formatação de porcentagem
export function formatPercentage(value: number): string {
  return `${value}%`;
}

// Formatação de número
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

// Formatação de texto truncado
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Formatação de inicials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Formatação de status
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'ATIVO': 'Ativo',
    'INATIVO': 'Inativo',
    'PENDENTE': 'Pendente',
    'ACEITO': 'Aceito',
    'RECUSADO': 'Recusado',
    'CANCELADO': 'Cancelado',
    'FINALIZADO': 'Finalizado',
    'CONCLUIDO': 'Concluído',
    'DISPUTADO': 'Disputado',
    'PAGO': 'Pago',
    'LIBERADO': 'Liberado',
    'REEMBOLSADO': 'Reembolsado',
    'ABERTA': 'Aberta',
    'EM_ANALISE': 'Em Análise',
    'RESOLVIDA': 'Resolvida',
    'BAIXA': 'Baixa',
    'MEDIA': 'Média',
    'ALTA': 'Alta',
  };
  
  return statusMap[status] || status;
}

// Formatação de tipo de usuário
export function formatUserType(type: string): string {
  const typeMap: Record<string, string> = {
    'CLIENTE': 'Cliente',
    'PRESTADOR': 'Prestador',
    'MODERADOR': 'Moderador',
    'ADMIN': 'Administrador',
  };
  
  return typeMap[type] || type;
}

// Formatação de categoria
export function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'Encanamento': 'Encanamento',
    'Eletricidade': 'Eletricidade',
    'Pintura': 'Pintura',
    'Limpeza': 'Limpeza',
    'Jardinagem': 'Jardinagem',
    'Reformas': 'Reformas',
    'Montagem': 'Montagem',
    'Transporte': 'Transporte',
    'Tecnologia': 'Tecnologia',
    'Consultoria': 'Consultoria',
  };
  
  return categoryMap[category] || category;
}

// Formatação de urgência
export function formatUrgencia(urgencia: string): string {
  const urgenciaMap: Record<string, string> = {
    'BAIXA': 'Baixa',
    'MEDIA': 'Média',
    'ALTA': 'Alta',
  };
  
  return urgenciaMap[urgencia] || urgencia;
}

// Formatação de disponibilidade (para prestadores)
export function formatDisponibilidade(disponibilidade: string): string {
  const disponibilidadeMap: Record<string, string> = {
    'COMERCIAL_24_7': '24x7',
    'COMERCIAL_8_5': '8x5',
    'COMERCIAL_8_7': '8x7',
  };
  
  return disponibilidadeMap[disponibilidade] || disponibilidade;
}

