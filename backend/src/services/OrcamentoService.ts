import { config } from '../config/database';
import { logger } from '../utils/logger';
import { notificationService } from './NotificationService';

export interface CreateOrcamentoData {
  post_id: string;
  prestador_id: string;
  cliente_id: string;
  valor: number;
  descricao: string;
  prazo_execucao: number;
  condicoes_pagamento: string;
  fotos?: string[];
  garantia?: string;
  desconto?: number;
  observacoes?: string;
}

export interface UpdateOrcamentoData {
  valor?: number;
  descricao?: string;
  prazo_execucao?: number;
  condicoes_pagamento?: string;
  fotos?: string[];
  garantia?: string;
  desconto?: number;
  observacoes?: string;
}

export interface CreateNegociacaoData {
  orcamento_id: string;
  autor_id: string;
  tipo: 'PROPOSTA' | 'CONTRAPROPOSTA' | 'ACEITE' | 'REJEICAO' | 'PERGUNTA';
  valor?: number;
  prazo?: number;
  descricao: string;
}

export interface OrcamentoFilters {
  post_id?: string;
  prestador_id?: string;
  cliente_id?: string;
  status?: string;
  valor_min?: number;
  valor_max?: number;
  data_inicio?: Date;
  data_fim?: Date;
  page?: number;
  limit?: number;
}

class OrcamentoService {
  // Criar orçamento
  public async createOrcamento(data: CreateOrcamentoData): Promise<any> {
    try {
      // Verificar se o post existe e está ativo
      const post = await config.prisma.post.findUnique({
        where: { id: data.post_id },
        include: { usuario: true }
      });

      if (!post) {
        throw new Error('Post não encontrado');
      }

      if (post.status !== 'ATIVO') {
        throw new Error('Post não está ativo para receber orçamentos');
      }

      // Verificar se o prestador já enviou orçamento para este post
      const existingOrcamento = await config.prisma.orcamento.findFirst({
        where: {
          post_id: data.post_id,
          prestador_id: data.prestador_id
        }
      });

      if (existingOrcamento) {
        throw new Error('Você já enviou um orçamento para este post');
      }

      // Criar orçamento
      const orcamento = await config.prisma.orcamento.create({
        data: {
          ...data,
          valor_original: data.valor,
          prazo_original: data.prazo_execucao,
          data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
        },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true
        }
      });

      // Enviar notificação para o cliente
      await notificationService.createNotification(
        data.cliente_id,
        'ORCAMENTO_RECEIVED' as any,
        'Novo orçamento recebido',
        `Você recebeu um novo orçamento de R$ ${data.valor.toFixed(2)} para o post "${post.titulo}"`,
        { link: `/orcamentos/${orcamento.id}` }
      );

      logger.info(`Orçamento criado: ${orcamento.id} para post ${data.post_id}`);
      return orcamento;

    } catch (error) {
      logger.error('Erro ao criar orçamento:', error);
      throw error;
    }
  }

  // Buscar orçamentos com filtros
  public async getOrcamentos(filters: OrcamentoFilters = {}): Promise<any> {
    try {
      const {
        post_id,
        prestador_id,
        cliente_id,
        status,
        valor_min,
        valor_max,
        data_inicio,
        data_fim,
        page = 1,
        limit = 20
      } = filters;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (post_id) where.post_id = post_id;
      if (prestador_id) where.prestador_id = prestador_id;
      if (cliente_id) where.cliente_id = cliente_id;
      if (status) where.status = status;

      if (valor_min !== undefined || valor_max !== undefined) {
        where.valor = {};
        if (valor_min !== undefined) where.valor.gte = valor_min;
        if (valor_max !== undefined) where.valor.lte = valor_max;
      }

      if (data_inicio || data_fim) {
        where.data_criacao = {};
        if (data_inicio) where.data_criacao.gte = data_inicio;
        if (data_fim) where.data_criacao.lte = data_fim;
      }

      const [orcamentos, total] = await Promise.all([
        config.prisma.orcamento.findMany({
          where,
          include: {
            post: {
              include: { usuario: true }
            },
            prestador: true,
            cliente: true,
            negociacoes: {
              include: { autor: true },
              orderBy: { data_criacao: 'desc' }
            }
          },
          orderBy: { data_criacao: 'desc' },
          skip,
          take: limit
        }),
        config.prisma.orcamento.count({ where })
      ]);

      return {
        data: orcamentos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      logger.error('Erro ao buscar orçamentos:', error);
      throw error;
    }
  }

  // Buscar orçamento por ID
  public async getOrcamentoById(id: string): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true,
          negociacoes: {
            include: { autor: true },
            orderBy: { data_criacao: 'desc' }
          }
        }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      return orcamento;

    } catch (error) {
      logger.error('Erro ao buscar orçamento:', error);
      throw error;
    }
  }

  // Atualizar orçamento
  public async updateOrcamento(id: string, data: UpdateOrcamentoData, userId: string): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id },
        include: { prestador: true, cliente: true }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode editar o orçamento
      if (orcamento.prestador_id !== userId) {
        throw new Error('Você não tem permissão para editar este orçamento');
      }

      if (orcamento.status !== 'PENDENTE') {
        throw new Error('Orçamento não pode ser editado neste status');
      }

      const updatedOrcamento = await config.prisma.orcamento.update({
        where: { id },
        data: {
          ...data,
          data_atualizacao: new Date()
        },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true,
          negociacoes: {
            include: { autor: true },
            orderBy: { data_criacao: 'desc' }
          }
        }
      });

      // Enviar notificação para o cliente
      await notificationService.createNotification(
        orcamento.cliente_id,
        'ORCAMENTO_UPDATED' as any,
        'Orçamento atualizado',
        `O orçamento foi atualizado pelo prestador ${orcamento.prestador.nome}`,
        { link: `/orcamentos/${id}` }
      );

      logger.info(`Orçamento atualizado: ${id}`);
      return updatedOrcamento;

    } catch (error) {
      logger.error('Erro ao atualizar orçamento:', error);
      throw error;
    }
  }

  // Responder orçamento (aceitar/rejeitar)
  public async responderOrcamento(id: string, status: 'ACEITO' | 'RECUSADO', userId: string, observacoes?: string): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id },
        include: { prestador: true, cliente: true, post: true }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode responder o orçamento
      if (orcamento.cliente_id !== userId) {
        throw new Error('Você não tem permissão para responder este orçamento');
      }

      if (orcamento.status !== 'PENDENTE') {
        throw new Error('Orçamento já foi respondido');
      }

      const updatedOrcamento = await config.prisma.orcamento.update({
        where: { id },
        data: {
          status,
          observacoes
        },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true,
          negociacoes: {
            include: { autor: true },
            orderBy: { data_criacao: 'desc' }
          }
        }
      });

      // Enviar notificação para o prestador
      await notificationService.createNotification(
        orcamento.prestador_id,
        status === 'ACEITO' ? 'ORCAMENTO_ACCEPTED' as any : 'ORCAMENTO_REJECTED' as any,
        status === 'ACEITO' ? 'Orçamento aceito!' : 'Orçamento rejeitado',
        status === 'ACEITO' 
          ? `Seu orçamento de R$ ${orcamento.valor.toFixed(2)} foi aceito!`
          : `Seu orçamento de R$ ${orcamento.valor.toFixed(2)} foi rejeitado.`,
        { link: `/orcamentos/${id}` }
      );

      logger.info(`Orçamento ${status.toLowerCase()}: ${id}`);
      return updatedOrcamento;

    } catch (error) {
      logger.error('Erro ao responder orçamento:', error);
      throw error;
    }
  }

  // Iniciar negociação
  public async iniciarNegociacao(id: string, userId: string): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id },
        include: { prestador: true, cliente: true }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode iniciar negociação
      if (orcamento.prestador_id !== userId && orcamento.cliente_id !== userId) {
        throw new Error('Você não tem permissão para iniciar negociação neste orçamento');
      }

      if (orcamento.status !== 'PENDENTE') {
        throw new Error('Negociação só pode ser iniciada em orçamentos pendentes');
      }

      const updatedOrcamento = await config.prisma.orcamento.update({
        where: { id },
        data: {
          status: 'PENDENTE',
          ultima_negociacao: new Date()
        },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true,
          negociacoes: {
            include: { autor: true },
            orderBy: { data_criacao: 'desc' }
          }
        }
      });

      // Enviar notificação para a outra parte
      const notificacaoUserId = orcamento.prestador_id === userId ? orcamento.cliente_id : orcamento.prestador_id;
      await notificationService.createNotification(
        notificacaoUserId,
        'ORCAMENTO_UPDATED' as any,
        'Negociação iniciada',
        'Uma negociação foi iniciada para este orçamento',
        { link: `/orcamentos/${id}` }
      );

      logger.info(`Negociação iniciada para orçamento: ${id}`);
      return updatedOrcamento;

    } catch (error) {
      logger.error('Erro ao iniciar negociação:', error);
      throw error;
    }
  }

  // Criar negociação
  public async createNegociacao(data: CreateNegociacaoData): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id: data.orcamento_id },
        include: { prestador: true, cliente: true }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode criar negociação
      if (orcamento.prestador_id !== data.autor_id && orcamento.cliente_id !== data.autor_id) {
        throw new Error('Você não tem permissão para negociar este orçamento');
      }

      if (orcamento.status !== 'PENDENTE') {
        throw new Error('Orçamento não está em negociação');
      }

      // Criar negociação
      const negociacao = await config.prisma.negociacaoOrcamento.create({
        data,
        include: {
          autor: true,
          orcamento: {
            include: {
              post: { include: { usuario: true } },
              prestador: true,
              cliente: true
            }
          }
        }
      });

      // Atualizar contador de contrapropostas se for contraproposta
      if (data.tipo === 'CONTRAPROPOSTA') {
        await config.prisma.orcamento.update({
          where: { id: data.orcamento_id },
          data: {
            contrapropostas: { increment: 1 },
            ultima_negociacao: new Date()
          }
        });
      }

      // Enviar notificação para a outra parte
      const notificacaoUserId = orcamento.prestador_id === data.autor_id ? orcamento.cliente_id : orcamento.prestador_id;
      await notificationService.createNotification(
        notificacaoUserId,
        'ORCAMENTO_UPDATED' as any,
        'Nova negociação',
        `Nova ${data.tipo.toLowerCase()} recebida no orçamento`,
        { link: `/orcamentos/${data.orcamento_id}` }
      );

      logger.info(`Negociação criada: ${negociacao.id} para orçamento ${data.orcamento_id}`);
      return negociacao;

    } catch (error) {
      logger.error('Erro ao criar negociação:', error);
      throw error;
    }
  }

  // Finalizar negociação
  public async finalizarNegociacao(id: string, status: 'ACEITO' | 'RECUSADO', userId: string): Promise<any> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id },
        include: { prestador: true, cliente: true }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode finalizar negociação
      if (orcamento.prestador_id !== userId && orcamento.cliente_id !== userId) {
        throw new Error('Você não tem permissão para finalizar negociação neste orçamento');
      }

      if (orcamento.status !== 'PENDENTE') {
        throw new Error('Orçamento não está em negociação');
      }

      const updatedOrcamento = await config.prisma.orcamento.update({
        where: { id },
        data: {
          status
        },
        include: {
          post: {
            include: { usuario: true }
          },
          prestador: true,
          cliente: true,
          negociacoes: {
            include: { autor: true },
            orderBy: { data_criacao: 'desc' }
          }
        }
      });

      // Enviar notificação para a outra parte
      const notificacaoUserId = orcamento.prestador_id === userId ? orcamento.cliente_id : orcamento.prestador_id;
      await notificationService.createNotification(
        notificacaoUserId,
        status === 'ACEITO' ? 'ORCAMENTO_ACCEPTED' as any : 'ORCAMENTO_REJECTED' as any,
        status === 'ACEITO' ? 'Negociação aceita!' : 'Negociação rejeitada',
        status === 'ACEITO' 
          ? 'A negociação foi aceita!'
          : 'A negociação foi rejeitada.',
        { link: `/orcamentos/${id}` }
      );

      logger.info(`Negociação finalizada: ${status} para orçamento ${id}`);
      return updatedOrcamento;

    } catch (error) {
      logger.error('Erro ao finalizar negociação:', error);
      throw error;
    }
  }

  // Deletar orçamento
  public async deleteOrcamento(id: string, userId: string): Promise<void> {
    try {
      const orcamento = await config.prisma.orcamento.findUnique({
        where: { id }
      });

      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Verificar se o usuário pode deletar o orçamento
      if (orcamento.prestador_id !== userId) {
        throw new Error('Você não tem permissão para deletar este orçamento');
      }

      if (orcamento.status === 'ACEITO') {
        throw new Error('Orçamento aceito não pode ser deletado');
      }

      await config.prisma.orcamento.delete({
        where: { id }
      });

      logger.info(`Orçamento deletado: ${id}`);

    } catch (error) {
      logger.error('Erro ao deletar orçamento:', error);
      throw error;
    }
  }

  // Verificar orçamentos expirados
  public async verificarOrcamentosExpirados(): Promise<number> {
    try {
      const now = new Date();
      
      const { count } = await config.prisma.orcamento.updateMany({
        where: {
          status: 'PENDENTE',
          data_expiracao: {
            lt: now
          }
        },
        data: {
          status: 'EXPIRADO'
        }
      });

      logger.info(`${count} orçamentos expirados verificados`);
      return count;

    } catch (error) {
      logger.error('Erro ao verificar orçamentos expirados:', error);
      throw error;
    }
  }
}

export const orcamentoService = new OrcamentoService();
