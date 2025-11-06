// ========================================
// TIPOS PRINCIPAIS
// ========================================

export interface Usuario {
  id: string;
  tipo: 'CLIENTE' | 'PRESTADOR' | 'MODERADOR' | 'ADMIN';
  nome: string;
  email: string;
  telefone: string;
  cpf_cnpj: string;
  data_nascimento: string;
  endereco: Endereco;
  foto_perfil?: string;
  ativo: boolean;
  verificado: boolean;
  reputacao: number;
  pontos_penalidade: number;
  data_cadastro: string;
  data_atualizacao: string;
  areas_atuacao?: string[];
  temClienteAssociado?: boolean;
}

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export interface Post {
  id: string;
  usuario_id: string;
  tipo: 'SOLICITACAO' | 'OFERTA' | 'VITRINE_PRESTADOR' | 'VITRINE_CLIENTE';
  titulo: string;
  categoria: string;
  descricao: string;
  localizacao: Localizacao;
  preco_estimado?: number;
  valor_por_hora?: number;
  prazo?: string;
  fotos: string[];
  urgencia: 'BAIXA' | 'MEDIA' | 'ALTA';
  disponibilidade?: 'COMERCIAL_24_7' | 'COMERCIAL_8_5' | 'COMERCIAL_8_7';
  status: 'ATIVO' | 'ORCAMENTO_ACEITO' | 'TRABALHO_CONCLUIDO' | 'INATIVO' | 'FINALIZADO' | 'CANCELADO' | 'ARQUIVADO';
  is_apresentacao: boolean;
  data_criacao: string;
  data_atualizacao: string;
  usuario?: Usuario;
  _count?: {
    orcamentos: number;
    curtidas: number;
    comentarios: number;
  };
}

export interface Localizacao {
  endereco: string;
  latitude: number;
  longitude: number;
  cep?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface Orcamento {
  id: string;
  post_id: string;
  prestador_id: string;
  cliente_id: string;
  valor: number;
  descricao: string;
  prazo_execucao: number;
  condicoes_pagamento: string;
  fotos: string[];
  garantia?: string;
  desconto?: number;
  status: 'PENDENTE' | 'ACEITO' | 'RECUSADO' | 'CANCELADO' | 'EXPIRADO';
  data_criacao: string;
  data_atualizacao: string;
  post?: Post;
  prestador?: Usuario;
  cliente?: Usuario;
}

export interface Contrato {
  id: string;
  orcamento_id: string;
  cliente_id: string;
  prestador_id: string;
  valor: number;
  prazo: string;
  condicoes: string;
  garantias: string;
  status: 'ATIVO' | 'CONCLUIDO' | 'CANCELADO' | 'DISPUTADO';
  data_criacao: string;
  data_atualizacao: string;
  orcamento?: Orcamento;
  prestador?: Usuario;
  cliente?: Usuario;
  pagamento?: Pagamento;
  mensagens?: Mensagem[];
  avaliacoes?: Avaliacao[];
  disputa?: Disputa;
  _count?: {
    mensagens: number;
    avaliacoes: number;
  };
}

export interface Pagamento {
  id: string;
  contrato_id: string;
  valor: number;
  metodo: 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'BOLETO' | 'TRANSFERENCIA';
  status: 'PENDENTE' | 'PAGO' | 'LIBERADO' | 'REEMBOLSADO' | 'DISPUTADO';
  transacao_id?: string;
  data_pagamento?: string;
  data_liberacao?: string;
  taxa_plataforma: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Avaliacao {
  id: string;
  avaliador_id: string;
  avaliado_id: string;
  contrato_id: string;
  nota: number;
  comentario: string;
  aspectos: AspectosAvaliacao;
  data_criacao: string;
  avaliador?: Usuario;
  avaliado?: Usuario;
  contrato?: Contrato;
}

export interface AspectosAvaliacao {
  competencia: number;
  pontualidade: number;
  atendimento: number;
  preco_qualidade: number;
}

export interface Disputa {
  id: string;
  contrato_id: string;
  cliente_id: string;
  prestador_id: string;
  moderador_id?: string;
  tipo: 'SERVICO_INCOMPLETO' | 'QUALIDADE_INFERIOR' | 'MATERIAL_DIFERENTE' | 'ATRASO_EXCESSIVO' | 'COMPORTAMENTO_INADEQUADO';
  descricao: string;
  evidencias: string[];
  status: 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | 'CANCELADA';
  decisao?: string;
  data_criacao: string;
  data_resolucao?: string;
  contrato?: Contrato;
  cliente?: Usuario;
  prestador?: Usuario;
  moderador?: Usuario;
}

export interface Mensagem {
  id: string;
  contrato_id: string;
  usuario_id: string;
  conteudo: string;
  tipo: 'TEXTO' | 'IMAGEM' | 'ARQUIVO' | 'SISTEMA';
  anexo_url?: string;
  bloqueada: boolean;
  motivo_bloqueio?: string;
  data_criacao: string;
  usuario?: Usuario;
}

export interface Curtida {
  id: string;
  post_id: string;
  usuario_id: string;
  data_criacao: string;
  usuario?: Usuario;
}

export interface Comentario {
  id: string;
  post_id: string;
  usuario_id: string;
  conteudo: string;
  data_criacao: string;
  usuario?: Usuario;
}

export interface Notificacao {
  id: string;
  usuario_id: string;
  tipo: 'NOVO_ORCAMENTO' | 'ORCAMENTO_ACEITO' | 'ORCAMENTO_RECUSADO' | 'NOVA_MENSAGEM' | 'PAGAMENTO_CONFIRMADO' | 'SERVICO_CONCLUIDO' | 'DISPUTA_ABERTA' | 'DISPUTA_RESOLVIDA' | 'LEMBRETE_PRAZO' | 'PROMOCAO';
  titulo: string;
  mensagem: string;
  lida: boolean;
  data_criacao: string;
}

// ========================================
// TIPOS DE FORMULÁRIOS
// ========================================

export interface LoginForm {
  email: string;
  senha: string;
}

export interface RegisterForm {
  tipo: 'CLIENTE' | 'PRESTADOR';
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf_cnpj: string;
  data_nascimento: string;
  endereco: Endereco;
  foto_perfil?: string;
}

export interface PostForm {
  tipo: 'SOLICITACAO' | 'OFERTA' | 'VITRINE_PRESTADOR' | 'VITRINE_CLIENTE';
  titulo: string;
  categoria: string;
  descricao: string;
  localizacao: Localizacao;
  preco_estimado?: number;
  prazo?: string;
  fotos: string[];
  urgencia: 'BAIXA' | 'MEDIA' | 'ALTA';
}

export interface OrcamentoForm {
  post_id: string;
  valor: number;
  descricao: string;
  prazo_execucao: number;
  condicoes_pagamento: string;
  fotos: string[];
  garantia?: string;
  desconto?: number;
}

export interface AvaliacaoForm {
  contrato_id: string;
  nota: number;
  comentario: string;
  aspectos: AspectosAvaliacao;
}

export interface DisputaForm {
  contrato_id: string;
  tipo: 'SERVICO_INCOMPLETO' | 'QUALIDADE_INFERIOR' | 'MATERIAL_DIFERENTE' | 'ATRASO_EXCESSIVO' | 'COMPORTAMENTO_INADEQUADO';
  descricao: string;
  evidencias: string[];
}

// ========================================
// TIPOS DE RESPOSTA DA API
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// ========================================
// TIPOS DE FILTROS E BUSCA
// ========================================

export interface FiltrosBusca {
  q?: string;
  categoria?: string; // pode ser múltipla (join por vírgula)
  localizacao?: {
    latitude: number;
    longitude: number;
    raio?: number;
  };
  preco_min?: number;
  preco_max?: number;
  avaliacao_min?: number;
  tipo?: 'SOLICITACAO' | 'OFERTA' | 'VITRINE_PRESTADOR' | 'VITRINE_CLIENTE';
  is_apresentacao?: boolean;
  page?: number;
  limit?: number;
}

export interface FiltrosOrcamentos {
  status?: string;
  tipo?: 'enviados' | 'recebidos' | 'all';
  page?: number;
  limit?: number;
}

export interface FiltrosContratos {
  status?: string;
  tipo?: 'cliente' | 'prestador' | 'all';
  page?: number;
  limit?: number;
}

// ========================================
// TIPOS DE ESTADO
// ========================================

export interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  notifications: Notificacao[];
  unreadNotifications: number;
}

// ========================================
// TIPOS DE CONTEXTO
// ========================================

export interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterForm) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => Promise<void>;
}

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  joinContract: (contratoId: string) => void;
  leaveContract: (contratoId: string) => void;
  sendMessage: (data: any) => void;
  onMessage: (callback: (message: Mensagem) => void) => void;
  onError: (callback: (error: any) => void) => void;
}

// ========================================
// TIPOS DE COMPONENTES
// ========================================

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface CardProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// ========================================
// TIPOS DE UTILITÁRIOS
// ========================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Distance {
  value: number;
  unit: 'km' | 'm';
}

export interface FileUpload {
  file: File;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

