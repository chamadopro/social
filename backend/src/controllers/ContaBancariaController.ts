import { Request, Response } from 'express';
import { config } from '../config/database';
import { badRequest } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class ContaBancariaController {
  // GET /api/financeiro/contas
  async getContas(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const contas = await config.prisma.contaBancaria.findMany({
        where: {
          usuario_id: userId,
          ativa: true,
        },
        orderBy: [
          { principal: 'desc' },
          { data_criacao: 'desc' },
        ],
      });

      res.status(200).json({
        success: true,
        data: { contas },
      });
    } catch (error: any) {
      logger.error('Erro ao buscar contas bancárias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contas bancárias',
      });
    }
  }

  // POST /api/financeiro/contas
  async createConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const { banco, agencia, conta, tipo, titular, cpf_cnpj, principal } = req.body;

      if (!banco || !agencia || !conta || !tipo || !titular || !cpf_cnpj) {
        throw badRequest('Todos os campos são obrigatórios');
      }

      if (tipo !== 'CORRENTE' && tipo !== 'POUPANCA') {
        throw badRequest('Tipo deve ser CORRENTE ou POUPANCA');
      }

      // Se marcou como principal, desmarcar outras
      if (principal) {
        await config.prisma.contaBancaria.updateMany({
          where: {
            usuario_id: userId,
            principal: true,
          },
          data: {
            principal: false,
          },
        });
      }

      const novaConta = await config.prisma.contaBancaria.create({
        data: {
          usuario_id: userId,
          banco,
          agencia,
          conta,
          tipo,
          titular,
          cpf_cnpj,
          principal: principal || false,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Conta bancária cadastrada com sucesso',
        data: { conta: novaConta },
      });
    } catch (error: any) {
      logger.error('Erro ao criar conta bancária:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar conta bancária',
      });
    }
  }

  // PUT /api/financeiro/contas/:id
  async updateConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      // Verificar se a conta pertence ao usuário
      const contaExistente = await config.prisma.contaBancaria.findFirst({
        where: {
          id,
          usuario_id: userId,
        },
      });

      if (!contaExistente) {
        throw badRequest('Conta não encontrada');
      }

      const { banco, agencia, conta, tipo, titular, cpf_cnpj, principal } = req.body;

      const updateData: any = {};
      if (banco) updateData.banco = banco;
      if (agencia) updateData.agencia = agencia;
      if (conta) updateData.conta = conta;
      if (tipo) updateData.tipo = tipo;
      if (titular) updateData.titular = titular;
      if (cpf_cnpj) updateData.cpf_cnpj = cpf_cnpj;
      if (principal !== undefined) {
        updateData.principal = principal;
        // Se marcou como principal, desmarcar outras
        if (principal) {
          await config.prisma.contaBancaria.updateMany({
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

      const contaAtualizada = await config.prisma.contaBancaria.update({
        where: { id },
        data: updateData,
      });

      res.status(200).json({
        success: true,
        message: 'Conta atualizada com sucesso',
        data: { conta: contaAtualizada },
      });
    } catch (error: any) {
      logger.error('Erro ao atualizar conta bancária:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar conta bancária',
      });
    }
  }

  // DELETE /api/financeiro/contas/:id
  async deleteConta(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      // Verificar se a conta pertence ao usuário
      const contaExistente = await config.prisma.contaBancaria.findFirst({
        where: {
          id,
          usuario_id: userId,
        },
      });

      if (!contaExistente) {
        throw badRequest('Conta não encontrada');
      }

      // Soft delete (marcar como inativa)
      await config.prisma.contaBancaria.update({
        where: { id },
        data: { ativa: false },
      });

      res.status(200).json({
        success: true,
        message: 'Conta removida com sucesso',
        data: null,
      });
    } catch (error: any) {
      logger.error('Erro ao remover conta bancária:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao remover conta bancária',
      });
    }
  }
}

export default new ContaBancariaController();

