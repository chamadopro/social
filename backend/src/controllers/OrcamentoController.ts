import { Request, Response, NextFunction } from 'express';
import { orcamentoService, CreateOrcamentoData, UpdateOrcamentoData, CreateNegociacaoData } from '../services/OrcamentoService';
import { auditLog } from '../utils/logger';
import { config } from '../config/database';
import { notificationService } from '../services/NotificationService';
import { v4 as uuidv4 } from 'uuid';

export class OrcamentoController {
  // Criar orçamento
  public async createOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        post_id,
        prestador_id,
        cliente_id,
        valor,
        descricao,
        prazo_execucao,
        condicoes_pagamento,
        fotos,
        garantia,
        desconto,
        observacoes,
        pagamento_mock
      } = req.body;

      const data: CreateOrcamentoData = {
        post_id,
        prestador_id,
        cliente_id,
        valor: Number(valor),
        descricao,
        prazo_execucao: Number(prazo_execucao),
        condicoes_pagamento,
        fotos: fotos || [],
        garantia,
        desconto: desconto ? Number(desconto) : undefined,
        observacoes
      };

      // Validar pagamento mock da taxa do orçamento (R$ 10,00)
      if (pagamento_mock !== true) {
        res.status(402).json({
          success: false,
          message: 'Pagamento da taxa (R$ 10,00) não confirmado.'
        });
        return;
      }

      const orcamento = await orcamentoService.createOrcamento(data);

      // Log de auditoria
      auditLog('CREATE_ORCAMENTO', {
        userId: req.user?.id,
        orcamentoId: orcamento.id,
        postId: post_id,
        valor: valor,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Orçamento criado com sucesso',
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Buscar orçamentos
  public async getOrcamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      } = req.query;

      const filters = {
        post_id: post_id as string,
        prestador_id: prestador_id as string,
        cliente_id: cliente_id as string,
        status: status as string,
        valor_min: valor_min ? Number(valor_min) : undefined,
        valor_max: valor_max ? Number(valor_max) : undefined,
        data_inicio: data_inicio ? new Date(data_inicio as string) : undefined,
        data_fim: data_fim ? new Date(data_fim as string) : undefined,
        page: Number(page),
        limit: Number(limit)
      };

      const result = await orcamentoService.getOrcamentos(filters);

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Buscar orçamento por ID
  public async getOrcamentoById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const orcamento = await orcamentoService.getOrcamentoById(id);

      res.json({
        success: true,
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Atualizar orçamento
  public async updateOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const {
        valor,
        descricao,
        prazo_execucao,
        condicoes_pagamento,
        fotos,
        garantia,
        desconto,
        observacoes
      } = req.body;

      const data: UpdateOrcamentoData = {
        valor: valor ? Number(valor) : undefined,
        descricao,
        prazo_execucao: prazo_execucao ? Number(prazo_execucao) : undefined,
        condicoes_pagamento,
        fotos,
        garantia,
        desconto: desconto ? Number(desconto) : undefined,
        observacoes
      };

      const orcamento = await orcamentoService.updateOrcamento(id, data, userId);

      // Log de auditoria
      auditLog('UPDATE_ORCAMENTO', {
        userId,
        orcamentoId: id,
        changes: data,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Orçamento atualizado com sucesso',
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Responder orçamento
  public async responderOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!['ACEITO', 'REJEITADO'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status deve ser ACEITO ou REJEITADO'
        });
        return;
      }

      const orcamento = await orcamentoService.responderOrcamento(id, status, userId, observacoes);

      // Log de auditoria
      auditLog('RESPONDER_ORCAMENTO', {
        userId,
        orcamentoId: id,
        status,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `Orçamento ${status.toLowerCase()} com sucesso`,
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Iniciar negociação
  public async iniciarNegociacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      const orcamento = await orcamentoService.iniciarNegociacao(id, userId);

      // Log de auditoria
      auditLog('INICIAR_NEGOCIACAO', {
        userId,
        orcamentoId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Negociação iniciada com sucesso',
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Criar negociação
  public async createNegociacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        orcamento_id,
        tipo,
        valor,
        prazo,
        descricao
      } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!['PROPOSTA', 'CONTRAPROPOSTA', 'ACEITE', 'REJEICAO', 'PERGUNTA'].includes(tipo)) {
        res.status(400).json({
          success: false,
          message: 'Tipo de negociação inválido'
        });
        return;
      }

      const data: CreateNegociacaoData = {
        orcamento_id,
        autor_id: userId,
        tipo,
        valor: valor ? Number(valor) : undefined,
        prazo: prazo ? Number(prazo) : undefined,
        descricao
      };

      const negociacao = await orcamentoService.createNegociacao(data);

      // Log de auditoria
      auditLog('CREATE_NEGOCIACAO', {
        userId,
        orcamentoId: orcamento_id,
        tipo,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Negociação criada com sucesso',
        data: negociacao
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Finalizar negociação
  public async finalizarNegociacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      if (!['ACEITO', 'REJEITADO'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Status deve ser ACEITO ou REJEITADO'
        });
        return;
      }

      const orcamento = await orcamentoService.finalizarNegociacao(id, status, userId);

      // Log de auditoria
      auditLog('FINALIZAR_NEGOCIACAO', {
        userId,
        orcamentoId: id,
        status,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `Negociação ${status.toLowerCase()} com sucesso`,
        data: orcamento
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Deletar orçamento
  public async deleteOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      await orcamentoService.deleteOrcamento(id, userId);

      // Log de auditoria
      auditLog('DELETE_ORCAMENTO', {
        userId,
        orcamentoId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Orçamento deletado com sucesso'
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Verificar orçamentos expirados (admin)
  public async verificarOrcamentosExpirados(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = await orcamentoService.verificarOrcamentosExpirados();

      res.json({
        success: true,
        message: `${count} orçamentos expirados verificados`,
        data: { count }
      });

    } catch (error: any) {
      next(error);
    }
  }

  // Aceitar orçamento e atualizar status do post
  public async aceitarOrcamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { prestador_escolhido_id, metodo_pagamento } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
        return;
      }

      // Buscar orçamento
      const orcamento = await orcamentoService.getOrcamentoById(id);
      
      if (!orcamento) {
        res.status(404).json({
          success: false,
          message: 'Orçamento não encontrado'
        });
        return;
      }

      // Verificar se o usuário é o cliente do post
      const post = await config.prisma.post.findUnique({
        where: { id: orcamento.post_id }
      });
      
      if (!post || post.usuario_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'Você não tem permissão para aceitar este orçamento'
        });
        return;
      }

      // Verificar se orçamento está pendente
      if (orcamento.status !== 'PENDENTE') {
        res.status(400).json({
          success: false,
          message: 'Orçamento já foi respondido'
        });
        return;
      }

      let contratoCriado = null;
      let pagamentoCriado = null;

      // 🚀 TRANSAÇÃO ATÔMICA: Criar contrato, pagamento e atualizar status
      await config.prisma.$transaction(async (prisma) => {
        // 1. Atualizar status do orçamento para ACEITO
        await prisma.orcamento.update({
          where: { id },
          data: { status: 'ACEITO' }
        });

        // 2. Criar contrato automaticamente
        const prazoDate = new Date();
        prazoDate.setDate(prazoDate.getDate() + orcamento.prazo_execucao);

        contratoCriado = await prisma.contrato.create({
          data: {
            id: uuidv4(),
            orcamento_id: id,
            cliente_id: orcamento.cliente_id,
            prestador_id: prestador_escolhido_id || orcamento.prestador_id,
            valor: orcamento.valor,
            prazo: prazoDate,
            condicoes: orcamento.condicoes_pagamento,
            garantias: orcamento.garantia || 'Nenhuma garantia especificada',
            status: 'ATIVO'
          }
        });

        // 3. Criar pagamento em escrow automaticamente
        const taxaPlataforma = orcamento.valor * 0.05; // 5%

        pagamentoCriado = await prisma.pagamento.create({
          data: {
            id: uuidv4(),
            contrato_id: contratoCriado.id,
            valor: orcamento.valor,
            metodo: (metodo_pagamento || 'PIX') as any,
            status: 'PENDENTE',
            taxa_plataforma: taxaPlataforma
          }
        });

        // 4. Atualizar o post: status para ORCAMENTO_ACEITO e vincular prestador escolhido
        await prisma.post.update({
          where: { id: orcamento.post_id },
          data: ({
            status: 'ORCAMENTO_ACEITO' as any,
            prestador_escolhido_id: prestador_escolhido_id || orcamento.prestador_id
          } as any)
        });
      });

      // 5. Enviar notificações
      await notificationService.createNotification(
        orcamento.cliente_id,
        'ORCAMENTO_ACCEPTED' as any,
        'Orçamento aceito!',
        `Contrato criado com sucesso no valor de R$ ${orcamento.valor.toFixed(2)}. Aguardando pagamento.`,
        { contrato_id: contratoCriado!.id }
      );

      await notificationService.createNotification(
        prestador_escolhido_id || orcamento.prestador_id,
        'ORCAMENTO_ACCEPTED' as any,
        'Orçamento aceito!',
        `Seu orçamento de R$ ${orcamento.valor.toFixed(2)} foi aceito! Contrato criado e aguardando pagamento.`,
        { contrato_id: contratoCriado!.id }
      );

      // Log de auditoria
      auditLog('ACEITAR_ORCAMENTO', {
        userId,
        orcamentoId: id,
        postId: orcamento.post_id,
        prestadorEscolhidoId: prestador_escolhido_id || orcamento.prestador_id,
        contratoId: contratoCriado!.id,
        pagamentoId: pagamentoCriado!.id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Orçamento aceito! Contrato e pagamento criados com sucesso.',
        data: {
          orcamento: await orcamentoService.getOrcamentoById(id),
          contrato: contratoCriado,
          pagamento: pagamentoCriado
        }
      });

    } catch (error: any) {
      next(error);
    }
  }
}