import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { unprocessableEntity } from './errorHandler';
import { logger } from '../utils/logger';

// Função para validar dados com Joi
export const validate = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      logger.warn('Validation error:', {
        error: errorMessage,
        data: req[property],
        url: req.url,
        method: req.method,
      });
      
      throw unprocessableEntity(`Dados inválidos: ${errorMessage}`);
    }

    // Substituir os dados originais pelos dados validados
    req[property] = value;
    next();
  };
};

// Schemas de validação para autenticação
export const authSchemas = {
  register: Joi.object({
    tipo: Joi.string().valid('CLIENTE', 'PRESTADOR').required(),
    nome: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    senha: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
      .messages({
        'string.pattern.base': 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 símbolo'
      }),
    telefone: Joi.string().pattern(/^\d{10,11}$/).required()
      .messages({
        'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos (apenas números)'
      }),
    cpf_cnpj: Joi.string().required(),
    data_nascimento: Joi.date().max('now').required(),
    endereco: Joi.object({
      cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).required(),
      rua: Joi.string().min(2).max(200).required(),
      numero: Joi.string().min(1).max(10).required(),
      bairro: Joi.string().min(2).max(100).required(),
      cidade: Joi.string().min(2).max(100).required(),
      estado: Joi.string().length(2).required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).required(),
    foto_perfil: Joi.string().uri().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    senha: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    senha: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
      .messages({
        'string.pattern.base': 'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 símbolo'
      }),
  }),
};

// Schemas de validação para posts
export const postSchemas = {
  create: Joi.object({
    tipo: Joi.string().valid('SOLICITACAO', 'OFERTA').required(),
    titulo: Joi.string().min(5).max(200).required(),
    categoria: Joi.string().min(2).max(50).required(),
    descricao: Joi.string().min(10).max(2000).required(),
    localizacao: Joi.object({
      endereco: Joi.string().min(10).max(300).required(),
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
    }).required(),
    preco_estimado: Joi.number().min(0).optional(),
    prazo: Joi.date().min('now').optional(),
    fotos: Joi.array().items(Joi.string().uri()).max(10).optional(),
    urgencia: Joi.string().valid('BAIXA', 'MEDIA', 'ALTA').default('BAIXA'),
    disponibilidade: Joi.string().valid('COMERCIAL_24_7', 'COMERCIAL_8_5', 'COMERCIAL_8_7').optional(),
  }),

  update: Joi.object({
    titulo: Joi.string().min(5).max(200).optional(),
    descricao: Joi.string().min(10).max(2000).optional(),
    preco_estimado: Joi.number().min(0).optional(),
    prazo: Joi.date().min('now').optional(),
    fotos: Joi.array().items(Joi.string().uri()).max(10).optional(),
    urgencia: Joi.string().valid('BAIXA', 'MEDIA', 'ALTA').optional(),
    disponibilidade: Joi.string().valid('COMERCIAL_24_7', 'COMERCIAL_8_5', 'COMERCIAL_8_7').optional(),
  }),
};

// Schemas de validação para orçamentos
export const orcamentoSchemas = {
  create: Joi.object({
    post_id: Joi.string().uuid().required(),
    prestador_id: Joi.string().uuid().required(),
    cliente_id: Joi.string().uuid().required(),
    valor: Joi.number().min(0.01).required(),
    descricao: Joi.string().min(10).max(1000).required(),
    prazo_execucao: Joi.number().min(1).max(365).required(),
    condicoes_pagamento: Joi.string().min(5).max(500).required(),
    fotos: Joi.array().items(Joi.string().uri()).max(10).optional(),
    garantia: Joi.string().max(200).optional(),
    desconto: Joi.number().min(0).max(100).optional(),
    observacoes: Joi.string().max(500).optional(),
    // Mock de pagamento da taxa do orçamento
    pagamento_mock: Joi.boolean().valid(true).required(),
  }),

  update: Joi.object({
    valor: Joi.number().min(0.01).optional(),
    descricao: Joi.string().min(10).max(1000).optional(),
    prazo_execucao: Joi.number().min(1).max(365).optional(),
    condicoes_pagamento: Joi.string().min(5).max(500).optional(),
    fotos: Joi.array().items(Joi.string().uri()).max(10).optional(),
    garantia: Joi.string().max(200).optional(),
    desconto: Joi.number().min(0).max(100).optional(),
    observacoes: Joi.string().max(500).optional(),
  }),

  responder: Joi.object({
    status: Joi.string().valid('ACEITO', 'REJEITADO').required(),
    observacoes: Joi.string().max(500).optional(),
  }),

  negociacao: Joi.object({
    orcamento_id: Joi.string().uuid().required(),
    tipo: Joi.string().valid('PROPOSTA', 'CONTRAPROPOSTA', 'ACEITE', 'REJEICAO', 'PERGUNTA').required(),
    valor: Joi.number().positive().optional(),
    prazo: Joi.number().integer().min(1).max(365).optional(),
    descricao: Joi.string().min(5).max(1000).required(),
  }),

  finalizarNegociacao: Joi.object({
    status: Joi.string().valid('ACEITO', 'REJEITADO').required(),
  }),
};

// Schemas de validação para contratos
export const contratoSchemas = {
  update: Joi.object({
    status: Joi.string().valid('ATIVO', 'CONCLUIDO', 'CANCELADO', 'DISPUTADO').optional(),
  }),
};

// Schemas de validação para pagamentos
export const pagamentoSchemas = {
  create: Joi.object({
    contrato_id: Joi.string().uuid().required(),
    metodo: Joi.string().valid('CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'TRANSFERENCIA').required(),
  }),
};

// Schemas de validação para mensagens
export const mensagemSchemas = {
  create: Joi.object({
    contrato_id: Joi.string().uuid().required(),
    conteudo: Joi.string().min(1).max(1000).required(),
    tipo: Joi.string().valid('TEXTO', 'IMAGEM', 'ARQUIVO').default('TEXTO'),
    anexo_url: Joi.string().uri().optional(),
  }),
};

// Schemas de validação para avaliações
export const avaliacaoSchemas = {
  create: Joi.object({
    avaliado_id: Joi.string().uuid().required(),
    contrato_id: Joi.string().uuid().required(),
    nota: Joi.number().min(1).max(5).required(),
    comentario: Joi.string().max(500).optional(),
    tipo: Joi.string().valid('SERVICO', 'CLIENTE').default('SERVICO'),
    aspectos: Joi.object({
      pontualidade: Joi.number().min(1).max(5).optional(),
      qualidade: Joi.number().min(1).max(5).optional(),
      comunicacao: Joi.number().min(1).max(5).optional(),
      preco: Joi.number().min(1).max(5).optional(),
      limpeza: Joi.number().min(1).max(5).optional(),
      profissionalismo: Joi.number().min(1).max(5).optional()
    }).optional()
  }),

  update: Joi.object({
    nota: Joi.number().min(1).max(5).optional(),
    comentario: Joi.string().max(500).optional(),
    aspectos: Joi.object({
      pontualidade: Joi.number().min(1).max(5).optional(),
      qualidade: Joi.number().min(1).max(5).optional(),
      comunicacao: Joi.number().min(1).max(5).optional(),
      preco: Joi.number().min(1).max(5).optional(),
      limpeza: Joi.number().min(1).max(5).optional(),
      profissionalismo: Joi.number().min(1).max(5).optional()
    }).optional()
  }),
};

// Schemas de validação para disputas
export const disputaSchemas = {
  create: Joi.object({
    contrato_id: Joi.string().uuid().required(),
    tipo: Joi.string().valid(
      'SERVICO_INCOMPLETO',
      'QUALIDADE_INFERIOR',
      'MATERIAL_DIFERENTE',
      'ATRASO_EXCESSIVO',
      'COMPORTAMENTO_INADEQUADO'
    ).required(),
    descricao: Joi.string().min(10).max(1000).required(),
    evidencias: Joi.array().items(Joi.string().uri()).max(10).optional(),
  }),

  update: Joi.object({
    status: Joi.string().valid('ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'CANCELADA').optional(),
    decisao: Joi.string().max(1000).optional(),
  }),
};

// Schemas de validação para busca
export const buscaSchemas = {
  search: Joi.object({
    q: Joi.string().min(2).max(100).optional(),
    categoria: Joi.string().max(50).optional(),
    localizacao: Joi.object({
      latitude: Joi.number().min(-90).max(90).required(),
      longitude: Joi.number().min(-180).max(180).required(),
      raio: Joi.number().min(1).max(100).default(10),
    }).optional(),
    preco_min: Joi.number().min(0).optional(),
    preco_max: Joi.number().min(0).optional(),
    avaliacao_min: Joi.number().min(1).max(5).optional(),
    tipo: Joi.string().valid('SOLICITACAO', 'OFERTA').optional(),
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(20),
  }),
};

// Schemas de validação para upload
export const uploadSchemas = {
  foto: Joi.object({
    tipo: Joi.string().valid('perfil', 'post', 'evidencia').required(),
    contrato_id: Joi.string().uuid().optional(),
  }),
};

// Schemas de validação para usuários
export const userSchemas = {
  update: Joi.object({
    nome: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    telefone: Joi.string().pattern(/^\d{10,11}$/).optional()
      .messages({
        'string.pattern.base': 'Telefone deve ter 10 ou 11 dígitos (apenas números)'
      }),
    cpf_cnpj: Joi.string().optional(),
    data_nascimento: Joi.date().max('now').optional(),
    endereco: Joi.object({
      cep: Joi.string().pattern(/^\d{5}-?\d{3}$/).optional(),
      rua: Joi.string().min(2).max(200).optional(),
      numero: Joi.string().min(1).max(10).optional(),
      bairro: Joi.string().min(2).max(100).optional(),
      cidade: Joi.string().min(2).max(100).optional(),
      estado: Joi.string().length(2).optional(),
      latitude: Joi.number().min(-90).max(90).optional(),
      longitude: Joi.number().min(-180).max(180).optional(),
    }).optional(),
    foto_perfil: Joi.string().uri().optional(),
  }),

  addPenalty: Joi.object({
    pontos: Joi.number().min(1).max(100).required(),
    motivo: Joi.string().min(5).max(500).required(),
  }),
};

// Função para validar CPF
export const validateCPF = (cpf: string): boolean => {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

// Função para validar CNPJ
export const validateCNPJ = (cnpj: string): boolean => {
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(cnpj.charAt(13))) return false;

  return true;
};
