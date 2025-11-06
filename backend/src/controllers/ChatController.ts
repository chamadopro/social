import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  notFoundError,
  internalServerError,
  badRequest
} from '../middleware/errorHandler';
import { auditLog, logger } from '../utils/logger';
import { messageModerationService } from '../services/MessageModerationService';
import { notificationService } from '../services/NotificationService';

export class ChatController {
  // Enviar mensagem
  public async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contrato_id, conteudo, tipo = 'TEXTO' } = req.body;
      const usuario_id = req.user!.id;

      // Verificar se o contrato existe e se o usuário tem acesso
      const contrato = await config.prisma.contrato.findFirst({
        where: {
          id: contrato_id,
          OR: [
            { cliente_id: usuario_id },
            { prestador_id: usuario_id }
          ]
        },
        include: {
          cliente: {
            select: { id: true, nome: true }
          },
          prestador: {
            select: { id: true, nome: true }
          }
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // **MODERAÇÃO DE MENSAGEM - BLOQUEAR CONTATOS EXTERNOS**
      const moderationResult = messageModerationService.moderateMessage(conteudo);
      
      if (moderationResult.isBlocked) {
        // Criar mensagem bloqueada para auditoria
        const mensagemBloqueada = await config.prisma.mensagem.create({
          data: {
            id: require('uuid').v4(),
            contrato_id,
            usuario_id,
            conteudo: messageModerationService.sanitizeContent(conteudo),
            tipo,
            bloqueada: true,
            motivo_bloqueio: moderationResult.motivo || 'Conteúdo bloqueado por moderação'
          },
          include: {
            usuario: {
              select: { id: true, nome: true, foto_perfil: true }
            }
          }
        });

        // Log de auditoria
        auditLog('MESSAGE_BLOCKED', {
          mensagem_id: mensagemBloqueada.id,
          contrato_id,
          usuario_id,
          motivo: moderationResult.motivo,
          detectedPatterns: moderationResult.detectedPatterns,
          conteudoOriginal: conteudo.substring(0, 100) // Primeiros 100 caracteres
        });

        logger.warn(`Mensagem bloqueada pelo usuário ${usuario_id}:`, {
          motivo: moderationResult.motivo,
          detectedPatterns: moderationResult.detectedPatterns
        });

        throw badRequest(
          moderationResult.motivo || 
          'Não é permitido compartilhar contatos externos (WhatsApp, Instagram, email, etc.) na plataforma. ' +
          'Toda comunicação deve ocorrer dentro do ChamadoPro para garantir segurança e rastreabilidade.'
        );
      }

      // Criar mensagem (aprovada pela moderação)
      const mensagem = await config.prisma.mensagem.create({
        data: {
          id: require('uuid').v4(),
          contrato_id,
          usuario_id,
          conteudo,
          tipo,
          bloqueada: false
        },
        include: {
          usuario: {
            select: { id: true, nome: true, foto_perfil: true }
          }
        }
      });

      // Identificar o destinatário (cliente ou prestador)
      const destinatarioId = contrato.cliente_id === usuario_id 
        ? contrato.prestador_id 
        : contrato.cliente_id;

      // **ENVIAR NOTIFICAÇÃO PUSH PARA O DESTINATÁRIO**
      try {
        await notificationService.createNotification(
          destinatarioId,
          'MESSAGE_RECEIVED',
          'Nova mensagem recebida',
          `${mensagem.usuario.nome} enviou uma mensagem: ${conteudo.substring(0, 100)}${conteudo.length > 100 ? '...' : ''}`,
          {
            mensagem_id: mensagem.id,
            contrato_id,
            remetente_id: usuario_id,
            remetente_nome: mensagem.usuario.nome
          }
        );
      } catch (notificationError) {
        // Não falhar o envio da mensagem se a notificação falhar
        logger.error('Erro ao enviar notificação de mensagem:', notificationError);
      }

      // Enviar mensagem via Socket.IO em tempo real
      // (será implementado quando o Socket.IO estiver totalmente configurado)
      // this.io.to(`contract_${contrato_id}`).emit('new_message', mensagem);

      // Log de auditoria
      auditLog('MESSAGE_SENT', {
        mensagem_id: mensagem.id,
        contrato_id,
        usuario_id
      });

      res.status(201).json({
        success: true,
        message: 'Mensagem enviada com sucesso',
        data: mensagem
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter conversas do usuário
  public async getConversas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuario_id = req.user!.id;

      // Buscar contratos onde o usuário participa
      const contratos = await config.prisma.contrato.findMany({
        where: {
          OR: [
            { cliente_id: usuario_id },
            { prestador_id: usuario_id }
          ]
        },
        include: {
          cliente: {
            select: { id: true, nome: true, foto_perfil: true }
          },
          prestador: {
            select: { id: true, nome: true, foto_perfil: true }
          },
          mensagens: {
            orderBy: { data_criacao: 'desc' },
            take: 1,
            include: {
              usuario: {
                select: { id: true, nome: true, foto_perfil: true }
              }
            }
          }
        },
        orderBy: { data_criacao: 'desc' }
      });

      // Formatar conversas
      const conversas = contratos.map(contrato => {
        const outroUsuario = contrato.cliente_id === usuario_id 
          ? contrato.prestador 
          : contrato.cliente;
        
        const ultimaMensagem = contrato.mensagens[0] || null;
        
        return {
          contrato_id: contrato.id,
          outro_usuario: outroUsuario,
          ultima_mensagem: ultimaMensagem,
          nao_lidas: 0 // Implementar contagem de não lidas se necessário
        };
      });

      res.json({
        success: true,
        data: conversas
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar conversas'));
    }
  }

  // Obter mensagens de uma conversa
  public async getMensagens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contrato_id } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const usuario_id = req.user!.id;

      // Verificar se o usuário tem acesso ao contrato
      const contrato = await config.prisma.contrato.findFirst({
        where: {
          id: contrato_id,
          OR: [
            { cliente_id: usuario_id },
            { prestador_id: usuario_id }
          ]
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const mensagens = await config.prisma.mensagem.findMany({
        where: { contrato_id },
        include: {
          usuario: {
            select: { id: true, nome: true, foto_perfil: true }
          }
        },
        orderBy: { data_criacao: 'desc' },
        skip,
        take
      });

      res.json({
        success: true,
        data: mensagens.reverse() // Ordenar do mais antigo para o mais recente
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar mensagens'));
    }
  }

  // Marcar mensagens como lidas (simulado - não há campo status no schema)
  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { contrato_id } = req.params;
      const usuario_id = req.user!.id;

      // Verificar se o usuário tem acesso ao contrato
      const contrato = await config.prisma.contrato.findFirst({
        where: {
          id: contrato_id,
          OR: [
            { cliente_id: usuario_id },
            { prestador_id: usuario_id }
          ]
        }
      });

      if (!contrato) {
        throw notFoundError('Contrato não encontrado');
      }

      // Como não há campo de status, apenas retornamos sucesso
      res.json({
        success: true,
        message: 'Mensagens marcadas como lidas'
      });

    } catch (error) {
      next(internalServerError('Erro ao marcar mensagens como lidas'));
    }
  }

  // Deletar mensagem
  public async deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuario_id = req.user!.id;

      const mensagem = await config.prisma.mensagem.findFirst({
        where: {
          id,
          usuario_id
        }
      });

      if (!mensagem) {
        throw notFoundError('Mensagem não encontrada');
      }

      await config.prisma.mensagem.delete({
        where: { id }
      });

      // Log de auditoria
      auditLog('MESSAGE_DELETED', {
        mensagem_id: id,
        usuario_id
      });

      res.json({
        success: true,
        message: 'Mensagem deletada com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }
}