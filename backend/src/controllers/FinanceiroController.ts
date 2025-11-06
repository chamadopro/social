import { Request, Response } from 'express';
import { config } from '../config/database';
import { badRequest } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class FinanceiroController {
  // GET /api/financeiro/movimentacoes
  async getMovimentacoes(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const { tipo, status, dataInicio, dataFim } = req.query;

      const where: any = {
        usuario_id: userId,
      };

      if (tipo && tipo !== 'all') {
        where.tipo = tipo;
      }

      if (status && status !== 'all') {
        where.status = status;
      }

      if (dataInicio || dataFim) {
        where.data_movimentacao = {};
        if (dataInicio) {
          where.data_movimentacao.gte = new Date(dataInicio as string);
        }
        if (dataFim) {
          where.data_movimentacao.lte = new Date(dataFim as string);
        }
      }

      const movimentacoes = await config.prisma.movimentacaoFinanceira.findMany({
        where,
        orderBy: {
          data_movimentacao: 'desc',
        },
      });

      res.status(200).json({
        success: true,
        data: { movimentacoes },
      });
    } catch (error: any) {
      logger.error('Erro ao buscar movimentações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar movimentações',
      });
    }
  }

  // GET /api/financeiro/saldos
  async getSaldos(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      // Calcular saldo pendente
      const saldoPendente = await config.prisma.movimentacaoFinanceira.aggregate({
        where: {
          usuario_id: userId,
          status: 'PENDENTE',
          tipo: 'ENTRADA',
        },
        _sum: {
          valor: true,
        },
      });

      // Separar entradas e saídas para calcular saldo disponível corretamente
      const entradas = await config.prisma.movimentacaoFinanceira.aggregate({
        where: {
          usuario_id: userId,
          status: 'APROVADO',
          tipo: 'ENTRADA',
        },
        _sum: {
          valor: true,
        },
      });

      const saidas = await config.prisma.movimentacaoFinanceira.aggregate({
        where: {
          usuario_id: userId,
          status: 'APROVADO',
          tipo: 'SAIDA',
        },
        _sum: {
          valor: true,
        },
      });

      const disponivel = (entradas._sum.valor || 0) - (saidas._sum.valor || 0);

      res.status(200).json({
        success: true,
        data: {
          saldoDisponivel: disponivel,
          saldoPendente: saldoPendente._sum.valor || 0,
        },
      });
    } catch (error: any) {
      logger.error('Erro ao buscar saldos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar saldos',
      });
    }
  }

  // GET /api/financeiro/estatisticas
  async getEstatisticas(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const [totalRecebido, totalPago, taxaPlataforma, orcamentosAprovados, orcamentosRejeitados] = await Promise.all([
        // Total recebido (entradas aprovadas)
        config.prisma.movimentacaoFinanceira.aggregate({
          where: {
            usuario_id: userId,
            tipo: 'ENTRADA',
            status: 'APROVADO',
          },
          _sum: {
            valor: true,
          },
        }),
        // Total pago (saídas aprovadas)
        config.prisma.movimentacaoFinanceira.aggregate({
          where: {
            usuario_id: userId,
            tipo: 'SAIDA',
            status: 'APROVADO',
          },
          _sum: {
            valor: true,
          },
        }),
        // Taxa da plataforma
        config.prisma.movimentacaoFinanceira.aggregate({
          where: {
            usuario_id: userId,
            categoria: 'TAXA_PLATAFORMA',
            status: 'APROVADO',
          },
          _sum: {
            valor: true,
          },
        }),
        // Orçamentos aprovados (contagem)
        config.prisma.movimentacaoFinanceira.count({
          where: {
            usuario_id: userId,
            categoria: 'ORCAMENTO_APROVADO',
            status: 'APROVADO',
          },
        }),
        // Orçamentos rejeitados (contagem)
        config.prisma.movimentacaoFinanceira.count({
          where: {
            usuario_id: userId,
            categoria: 'ORCAMENTO_APROVADO',
            status: 'REJEITADO',
          },
        }),
      ]);

      // Buscar moedas
      const usuario = await config.prisma.usuario.findUnique({
        where: { id: userId },
        select: { saldo_moedas: true },
      });

      const moedasCompradas = await config.prisma.transacaoMoeda.aggregate({
        where: {
          usuario_id: userId,
          tipo: 'CREDITO',
          origem: 'COMPRA',
        },
        _sum: {
          valor: true,
        },
      });

      const moedasUsadas = await config.prisma.transacaoMoeda.aggregate({
        where: {
          usuario_id: userId,
          tipo: 'DEBITO',
        },
        _sum: {
          valor: true,
        },
      });

      res.status(200).json({
        success: true,
        data: {
          totalRecebido: totalRecebido._sum.valor || 0,
          totalPago: totalPago._sum.valor || 0,
          taxaPlataforma: taxaPlataforma._sum.valor || 0,
          orcamentosAprovados,
          orcamentosRejeitados,
          moedasCompradas: moedasCompradas._sum.valor || 0,
          moedasUsadas: moedasUsadas._sum.valor || 0,
          saldoMoedas: usuario?.saldo_moedas || 0,
        },
      });
    } catch (error: any) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
      });
    }
  }

  // POST /api/financeiro/movimentacao
  async createMovimentacao(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw badRequest('Usuário não autenticado');
      }

      const { tipo, valor, descricao, categoria, referencia_id, referencia_tipo } = req.body;

      if (!tipo || !valor || !descricao || !categoria) {
        throw badRequest('Campos obrigatórios: tipo, valor, descricao, categoria');
      }

      if (tipo !== 'ENTRADA' && tipo !== 'SAIDA') {
        throw badRequest('Tipo deve ser ENTRADA ou SAIDA');
      }

      if (valor <= 0) {
        throw badRequest('Valor deve ser maior que zero');
      }

      const movimentacao = await config.prisma.movimentacaoFinanceira.create({
        data: {
          usuario_id: userId,
          tipo,
          valor: parseFloat(valor),
          descricao,
          categoria,
          status: 'PENDENTE',
          referencia_id,
          referencia_tipo,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Movimentação criada com sucesso',
        data: { movimentacao },
      });
    } catch (error: any) {
      logger.error('Erro ao criar movimentação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar movimentação',
      });
    }
  }
}

export default new FinanceiroController();

