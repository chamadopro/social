import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { notificationService, NotificationType } from '../services/NotificationService';
import { auditLog } from '../utils/logger';
import { badRequest } from '../middleware/errorHandler';

export class SolicitacaoController {
  // Criar solicitação de serviço (lead quente) - cliente contata prestador diretamente
  public async createSolicitacao(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cliente_id = req.user!.id;
      const {
        post_id,
        prestador_id,
        titulo,
        descricao,
        endereco,
        prazo,
        valor_estimado,
        pagamento_mock
      } = req.body;

      // Validar pagamento mock da taxa do lead quente (R$ 15,00)
      if (pagamento_mock !== true) {
        res.status(402).json({
          success: false,
          message: 'Pagamento da taxa (R$ 15,00) não confirmado.'
        });
        return;
      }

      // Verificar se o post existe e pertence ao prestador
      const post = await config.prisma.post.findUnique({
        where: { id: post_id },
        include: { usuario: true }
      });

      if (!post) {
        throw badRequest('Post não encontrado');
      }

      if (post.usuario_id !== prestador_id) {
        throw badRequest('Post não pertence ao prestador informado');
      }

      // Criar notificação para o prestador (lead quente)
      await notificationService.createNotification(
        prestador_id,
        NotificationType.LEAD_QUENTE,
        'Novo Lead Quente!',
        `${post.usuario.nome} está solicitando um orçamento diretamente para você.`,
        {
          post_id,
          cliente_id,
          titulo,
          descricao,
          endereco,
          prazo,
          valor_estimado,
          origem: 'SOLICITACAO_DIRETA'
        }
      );

      // Criar mensagem automática no chat (se houver sistema de chat)
      // TODO: Integrar com sistema de chat quando disponível

      // Log de auditoria
      auditLog('CREATE_SOLICITACAO_SERVICO', {
        userId: cliente_id,
        postId: post_id,
        prestadorId: prestador_id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: 'Solicitação enviada com sucesso! O prestador foi notificado.',
        data: {
          post_id,
          prestador_id,
          cliente_id
        }
      });

    } catch (error: any) {
      next(error);
    }
  }
}

