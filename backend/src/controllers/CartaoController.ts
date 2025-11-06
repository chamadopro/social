import { Request, Response } from 'express';
import { config } from '../config/database';
import { badRequest } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

// Helper para mascarar número do cartão (salvar apenas últimos 4 dígitos)
function maskCardNumber(numero: string): string {
  const cleaned = numero.replace(/\D/g, '');
  return cleaned.slice(-4);
}

// Helper para detectar bandeira
function detectBandeira(numero: string): string {
  const cleaned = numero.replace(/\D/g, '');
  if (cleaned.startsWith('4')) return 'VISA';
  if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'MASTERCARD';
  if (cleaned.startsWith('3')) return 'AMEX';
  if (cleaned.startsWith('6')) return 'ELO';
  return 'OUTRO';
}

export class CartaoController {
  // GET /api/financeiro/cartoes
  async getCartoes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const cartoes = await config.prisma.cartao.findMany({
        where: {
          usuario_id: userId,
          ativo: true,
        },
        orderBy: [
          { principal: 'desc' },
          { data_criacao: 'desc' },
        ],
      });

      res.status(200).json({
        success: true,
        data: { cartoes },
      });
    } catch (error: any) {
      logger.error('Erro ao buscar cartões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar cartões',
      });
    }
  }

  // POST /api/financeiro/cartoes
  async createCartao(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const { numero, nome_titular, validade, tipo, principal } = req.body;

      if (!numero || !nome_titular || !validade || !tipo) {
        throw badRequest('Campos obrigatórios: numero, nome_titular, validade, tipo');
      }

      if (tipo !== 'CREDITO' && tipo !== 'DEBITO') {
        throw badRequest('Tipo deve ser CREDITO ou DEBITO');
      }

      // Validar formato de validade (MM/AA)
      const validadeRegex = /^\d{2}\/\d{2}$/;
      if (!validadeRegex.test(validade)) {
        throw badRequest('Validade deve estar no formato MM/AA');
      }

      const numeroHash = maskCardNumber(numero);
      const bandeira = detectBandeira(numero);

      // Se marcou como principal, desmarcar outras
      if (principal) {
        await config.prisma.cartao.updateMany({
          where: {
            usuario_id: userId,
            principal: true,
          },
          data: {
            principal: false,
          },
        });
      }

      const novoCartao = await config.prisma.cartao.create({
        data: {
          usuario_id: userId,
          numero_hash: numeroHash,
          nome_titular,
          validade,
          tipo,
          bandeira,
          principal: principal || false,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Cartão cadastrado com sucesso',
        data: { cartao: novoCartao },
      });
    } catch (error: any) {
      logger.error('Erro ao criar cartão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar cartão',
      });
    }
  }

  // PUT /api/financeiro/cartoes/:id
  async updateCartao(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      // Verificar se o cartão pertence ao usuário
      const cartaoExistente = await config.prisma.cartao.findFirst({
        where: {
          id,
          usuario_id: userId,
        },
      });

      if (!cartaoExistente) {
        throw badRequest('Cartão não encontrado');
      }

      const { nome_titular, validade, tipo, principal } = req.body;

      const updateData: any = {};
      if (nome_titular) updateData.nome_titular = nome_titular;
      if (validade) {
        const validadeRegex = /^\d{2}\/\d{2}$/;
        if (!validadeRegex.test(validade)) {
          throw badRequest('Validade deve estar no formato MM/AA');
        }
        updateData.validade = validade;
      }
      if (tipo) updateData.tipo = tipo;
      if (principal !== undefined) {
        updateData.principal = principal;
        // Se marcou como principal, desmarcar outras
        if (principal) {
          await config.prisma.cartao.updateMany({
            where: {
              usuario_id: userId,
              principal: true,
              id: { not: id },
            },
            data: {
              principal: false,
            },
          });
        }
      }

      const cartaoAtualizado = await config.prisma.cartao.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        message: 'Cartão atualizado com sucesso',
        data: { cartao: cartaoAtualizado },
      });
    } catch (error: any) {
      logger.error('Erro ao atualizar cartão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar cartão',
      });
    }
  }

  // DELETE /api/financeiro/cartoes/:id
  async deleteCartao(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      // Verificar se o cartão pertence ao usuário
      const cartaoExistente = await config.prisma.cartao.findFirst({
        where: {
          id,
          usuario_id: userId,
        },
      });

      if (!cartaoExistente) {
        throw badRequest('Cartão não encontrado');
      }

      // Soft delete (marcar como inativo)
      await config.prisma.cartao.update({
        where: { id },
        data: { ativo: false },
      });

      res.status(200).json({
        success: true,
        message: 'Cartão removido com sucesso',
        data: null,
      });
    } catch (error: any) {
      logger.error('Erro ao remover cartão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover cartão',
      });
    }
  }
}

export default new CartaoController();

