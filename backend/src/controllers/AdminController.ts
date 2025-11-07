import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  notFoundError,
  internalServerError,
  badRequest
} from '../middleware/errorHandler';
import { auditLog } from '../utils/logger';

export class AdminController {
  /**
   * Calcula a data de início baseada no número de dias retroativos
   * @param dias - Número de dias para retroceder a partir da data atual
   * @returns Data calculada
   */
  private calcularDataInicio(dias: number): Date {
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - dias);
    return dataInicio;
  }

  // Dashboard administrativo
  public async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsuarios,
        totalPosts,
        totalOrcamentos,
        totalContratos,
        totalPagamentos,
        usuariosAtivos,
        postsAtivos
      ] = await Promise.all([
        config.prisma.usuario.count(),
        config.prisma.post.count(),
        config.prisma.orcamento.count(),
        config.prisma.contrato.count(),
        config.prisma.pagamento.count(),
        config.prisma.usuario.count({ where: { ativo: true } }),
        config.prisma.post.count({ where: { status: 'ATIVO' } })
      ]);

      const receitas = await config.prisma.pagamento.aggregate({
        where: { status: 'PAGO' },
        _sum: { valor: true }
      });

      res.json({
        success: true,
        data: {
          estatisticas: {
            totalUsuarios,
            totalPosts,
            totalOrcamentos,
            totalContratos,
            totalPagamentos,
            usuariosAtivos,
            postsAtivos
          },
          receitas: {
            total: receitas._sum?.valor || 0
          }
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar dados do dashboard'));
    }
  }

  // Gerenciar usuários
  public async manageUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status, tipo, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};

      if (status && typeof status === 'string' && status !== 'all') {
        where.ativo = status === 'ativo';
      }

      if (tipo && typeof tipo === 'string' && tipo !== 'all') {
        where.tipo = tipo.toUpperCase();
      }

      if (search && typeof search === 'string' && search.trim().length > 0) {
        const searchTerm = search.trim();
        where.OR = [
          { nome: { contains: searchTerm, mode: 'insensitive' as const } },
          { email: { contains: searchTerm, mode: 'insensitive' as const } }
        ];
      }

      const [usuarios, total] = await Promise.all([
        config.prisma.usuario.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            nome: true,
            email: true,
            tipo: true,
            ativo: true,
            data_cadastro: true,
            reputacao: true
          },
          orderBy: { data_cadastro: 'desc' }
        }),
        config.prisma.usuario.count({ where })
      ]);

      res.json({
        success: true,
        data: usuarios,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar usuários'));
    }
  }

  // Ativar/desativar usuário
  public async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      const usuario = await config.prisma.usuario.findUnique({
        where: { id }
      });

      if (!usuario) {
        throw notFoundError('Usuário não encontrado');
      }

      const updatedUsuario = await config.prisma.usuario.update({
        where: { id },
        data: { ativo }
      });

      // Log de auditoria
      auditLog('USER_STATUS_CHANGED', {
        usuario_id: id,
        novo_status: ativo,
        admin_id: req.user!.id
      });

      res.json({
        success: true,
        message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: updatedUsuario
      });

    } catch (error) {
      next(error);
    }
  }

  // Relatórios
  public async getRelatorios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { periodo = '30' } = req.query;
      const dias = Number(periodo);
      const dataInicio = this.calcularDataInicio(dias);

      const [
        usuariosNovos,
        postsCriados,
        orcamentosCriados,
        contratosCriados,
        receitas
      ] = await Promise.all([
        config.prisma.usuario.count({
          where: { data_cadastro: { gte: dataInicio } }
        }),
        config.prisma.post.count({
          where: { data_criacao: { gte: dataInicio } }
        }),
        config.prisma.orcamento.count({
          where: { data_criacao: { gte: dataInicio } }
        }),
        config.prisma.contrato.count({
          where: { data_criacao: { gte: dataInicio } }
        }),
        config.prisma.pagamento.aggregate({
          where: {
            status: 'PAGO',
            data_pagamento: { gte: dataInicio }
          },
          _sum: { valor: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          periodo: `${dias} dias`,
          usuariosNovos,
          postsCriados,
          orcamentosCriados,
          contratosCriados,
          receitas: receitas._sum?.valor || 0
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao gerar relatórios'));
    }
  }

  // Listar posts para moderação
  public async listPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { titulo: { contains: search as string, mode: 'insensitive' } },
          { descricao: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [posts, total] = await Promise.all([
        config.prisma.post.findMany({
          where,
          skip,
          take,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                tipo: true
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.post.count({ where })
      ]);

      res.json({
        success: true,
        data: posts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar posts'));
    }
  }

  // Ocultar/remover post
  public async togglePostStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { acao } = req.body; // 'ocultar' ou 'remover'

      const post = await config.prisma.post.findUnique({
        where: { id }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      let updatedPost;
      if (acao === 'ocultar') {
        // Para ocultar, mudamos para ARQUIVADO e marcamos como excluído
        updatedPost = await config.prisma.post.update({
          where: { id },
          data: { 
            status: post.status === 'ATIVO' ? 'ARQUIVADO' : 'ATIVO',
            excluido: post.status === 'ATIVO'
          }
        });
      } else if (acao === 'remover') {
        updatedPost = await config.prisma.post.update({
          where: { id },
          data: { excluido: true, status: 'CANCELADO' }
        });
      } else {
        throw badRequest('Ação inválida');
      }

      auditLog('POST_STATUS_CHANGED', {
        post_id: id,
        acao,
        admin_id: req.user!.id
      });

      res.json({
        success: true,
        message: `Post ${acao === 'ocultar' ? 'ocultado' : 'removido'} com sucesso`,
        data: updatedPost
      });

    } catch (error) {
      next(error);
    }
  }

  // Listar pagamentos
  public async listPagamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      if (status) where.status = status;

      const [pagamentos, total] = await Promise.all([
        config.prisma.pagamento.findMany({
          where,
          skip,
          take,
          include: {
            contrato: {
              include: {
                cliente: { select: { id: true, nome: true, email: true } },
                prestador: { select: { id: true, nome: true, email: true } }
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.pagamento.count({ where })
      ]);

      res.json({
        success: true,
        data: pagamentos,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar pagamentos'));
    }
  }

  // Liberar pagamento
  public async liberarPagamento(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const pagamento = await config.prisma.pagamento.findUnique({
        where: { id },
        include: { contrato: true }
      });

      if (!pagamento) {
        throw notFoundError('Pagamento não encontrado');
      }

      if (pagamento.status !== 'AGUARDANDO_LIBERACAO') {
        throw badRequest('Pagamento não está aguardando liberação');
      }

      const updatedPagamento = await config.prisma.pagamento.update({
        where: { id },
        data: { status: 'PAGO', data_pagamento: new Date() }
      });

      auditLog('PAGAMENTO_LIBERADO', {
        pagamento_id: id,
        admin_id: req.user!.id
      });

      res.json({
        success: true,
        message: 'Pagamento liberado com sucesso',
        data: updatedPagamento
      });

    } catch (error) {
      next(error);
    }
  }

  // Listar disputas
  public async listDisputas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      if (status) where.status = status;

      const [disputas, total] = await Promise.all([
        config.prisma.disputa.findMany({
          where,
          skip,
          take,
          include: {
            contrato: {
              include: {
                cliente: { select: { id: true, nome: true, email: true } },
                prestador: { select: { id: true, nome: true, email: true } }
              }
            },
            moderador: { select: { id: true, nome: true } }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.disputa.count({ where })
      ]);

      res.json({
        success: true,
        data: disputas,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar disputas'));
    }
  }

  // Resolver disputa
  public async resolverDisputa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { decisao, observacoes } = req.body;

      const disputa = await config.prisma.disputa.findUnique({
        where: { id }
      });

      if (!disputa) {
        throw notFoundError('Disputa não encontrada');
      }

      if (disputa.status !== 'ABERTA' && disputa.status !== 'EM_ANALISE') {
        throw badRequest('Disputa não está em aberto ou análise');
      }

      const updatedDisputa = await config.prisma.disputa.update({
        where: { id },
        data: {
          status: 'RESOLVIDA',
          decisao,
          moderador_id: req.user!.id,
          data_resolucao: new Date()
        }
      });

      auditLog('DISPUTA_RESOLVIDA', {
        disputa_id: id,
        decisao,
        observacoes: observacoes || null,
        admin_id: req.user!.id
      });

      res.json({
        success: true,
        message: 'Disputa resolvida com sucesso',
        data: updatedDisputa
      });

    } catch (error) {
      next(error);
    }
  }

  // Relatórios avançados
  public async getRelatoriosAvancados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { periodo = '30', tipo = 'geral' } = req.query;
      const dias = Number(periodo);
      const dataInicio = this.calcularDataInicio(dias);

      let relatorio: any = {};

      switch (tipo) {
        case 'usuarios':
          const [usuariosNovos, usuariosAtivos, usuariosPorTipo] = await Promise.all([
            config.prisma.usuario.count({ where: { data_cadastro: { gte: dataInicio } } }),
            config.prisma.usuario.count({ where: { ativo: true } }),
            config.prisma.usuario.groupBy({
              by: ['tipo'],
              _count: { tipo: true },
              where: { data_cadastro: { gte: dataInicio } }
            })
          ]);

          relatorio = {
            totalNovos: usuariosNovos,
            totalAtivos: usuariosAtivos,
            porTipo: usuariosPorTipo.map(u => ({ tipo: u.tipo, quantidade: u._count.tipo })),
            crescimento: await this.calcularCrescimento('usuario', dias)
          };
          break;

        case 'financeiro':
          const [receitasFinanceiro, totalPagamentosCount, receitasPorDia] = await Promise.all([
            config.prisma.pagamento.aggregate({
              where: { status: 'PAGO', data_pagamento: { gte: dataInicio } },
              _sum: { valor: true },
              _count: { id: true }
            }),
            config.prisma.pagamento.count({ where: { data_criacao: { gte: dataInicio } } }),
            this.getReceitasPorDia(dataInicio)
          ]);

          relatorio = {
            totalReceitas: receitasFinanceiro._sum?.valor || 0,
            totalPagamentos: receitasFinanceiro._count?.id || 0,
            pagamentosTotais: totalPagamentosCount,
            receitasPorDia,
            crescimento: await this.calcularCrescimento('pagamento', dias)
          };
          break;

        case 'posts':
          const [postsNovos, postsPorCategoria, postsPorStatus] = await Promise.all([
            config.prisma.post.count({ where: { data_criacao: { gte: dataInicio } } }),
            config.prisma.post.groupBy({
              by: ['categoria'],
              _count: { categoria: true },
              where: { data_criacao: { gte: dataInicio } }
            }),
            config.prisma.post.groupBy({
              by: ['status'],
              _count: { status: true },
              where: { data_criacao: { gte: dataInicio } }
            })
          ]);

          relatorio = {
            totalNovos: postsNovos,
            porCategoria: postsPorCategoria.map(p => ({ categoria: p.categoria, quantidade: p._count.categoria })),
            porStatus: postsPorStatus.map(p => ({ status: p.status, quantidade: p._count.status })),
            crescimento: await this.calcularCrescimento('post', dias)
          };
          break;

        case 'geral':
        default:
          const [stats, usuarios, posts, receitasGeral, contratos] = await Promise.all([
            this.getEstatisticasGerais(dataInicio),
            config.prisma.usuario.count({ where: { data_cadastro: { gte: dataInicio } } }),
            config.prisma.post.count({ where: { data_criacao: { gte: dataInicio } } }),
            config.prisma.pagamento.aggregate({
              where: { status: 'PAGO', data_pagamento: { gte: dataInicio } },
              _sum: { valor: true }
            }),
            config.prisma.contrato.count({ where: { data_criacao: { gte: dataInicio } } })
          ]);

          relatorio = {
            periodo: `${dias} dias`,
            usuariosNovos: usuarios,
            postsNovos: posts,
            receitas: receitasGeral._sum?.valor || 0,
            contratosNovos: contratos,
            estatisticas: stats
          };
          break;
      }

      res.json({
        success: true,
        data: {
          tipo,
          periodo: `${dias} dias`,
          dataInicio: dataInicio.toISOString(),
          dataFim: new Date().toISOString(),
          relatorio
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao gerar relatórios avançados'));
    }
  }

  /**
   * Calcula o crescimento percentual de um tipo de dado em um período
   * @param tipo - Tipo de dado (usuarios, posts, pagamentos, etc)
   * @param dias - Número de dias do período
   * @returns Percentual de crescimento
   */
  private async calcularCrescimento(tipo: string, dias: number): Promise<number> {
    const dataInicio = this.calcularDataInicio(dias);
    const dataInicioAnterior = this.calcularDataInicio(dias * 2);

    let countAtual = 0;
    let countAnterior = 0;

    switch (tipo) {
      case 'usuario':
        countAtual = await config.prisma.usuario.count({ where: { data_cadastro: { gte: dataInicio } } });
        countAnterior = await config.prisma.usuario.count({
          where: {
            data_cadastro: { gte: dataInicioAnterior, lt: dataInicio }
          }
        });
        break;
      case 'post':
        countAtual = await config.prisma.post.count({ where: { data_criacao: { gte: dataInicio } } });
        countAnterior = await config.prisma.post.count({
          where: {
            data_criacao: { gte: dataInicioAnterior, lt: dataInicio }
          }
        });
        break;
      case 'pagamento':
        const atual = await config.prisma.pagamento.aggregate({
          where: { status: 'PAGO', data_pagamento: { gte: dataInicio } },
          _sum: { valor: true }
        });
        const anterior = await config.prisma.pagamento.aggregate({
          where: {
            status: 'PAGO',
            data_pagamento: { gte: dataInicioAnterior, lt: dataInicio }
          },
          _sum: { valor: true }
        });
        countAtual = atual._sum?.valor || 0;
        countAnterior = anterior._sum?.valor || 0;
        break;
    }

    if (countAnterior === 0) return countAtual > 0 ? 100 : 0;
    return ((countAtual - countAnterior) / countAnterior) * 100;
  }

  private async getReceitasPorDia(dataInicio: Date): Promise<any[]> {
    const receitas = await config.prisma.pagamento.findMany({
      where: {
        status: 'PAGO',
        data_pagamento: { gte: dataInicio }
      },
      select: {
        valor: true,
        data_pagamento: true
      }
    });

    const receitasPorDia: { [key: string]: number } = {};
    receitas.forEach(p => {
      const data = p.data_pagamento?.toISOString().split('T')[0] || '';
      if (!receitasPorDia[data]) {
        receitasPorDia[data] = 0;
      }
      receitasPorDia[data] += p.valor || 0;
    });

    return Object.entries(receitasPorDia).map(([data, valor]) => ({ data, valor }));
  }

  private async getEstatisticasGerais(_dataInicio: Date): Promise<any> {
    // Retorna estatísticas gerais (totais) - dataInicio não é usado aqui
    // pois queremos os totais acumulados, não apenas do período
    const [usuarios, posts, pagamentos, contratos] = await Promise.all([
      config.prisma.usuario.count(),
      config.prisma.post.count(),
      config.prisma.pagamento.aggregate({
        where: { status: 'PAGO' },
        _sum: { valor: true }
      }),
      config.prisma.contrato.count()
    ]);

    return {
      totalUsuarios: usuarios,
      totalPosts: posts,
      totalReceitas: pagamentos._sum?.valor || 0,
      totalContratos: contratos
    };
  }

  // Histórico de auditoria
  public async getHistoricoAuditoria(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 50, acao, usuario_id, dataInicio, dataFim } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {};
      
      if (acao) {
        where.acao = { contains: acao as string, mode: 'insensitive' };
      }
      
      if (usuario_id) {
        where.usuario_id = usuario_id as string;
      }

      if (dataInicio || dataFim) {
        where.data_criacao = {};
        if (dataInicio) where.data_criacao.gte = new Date(dataInicio as string);
        if (dataFim) where.data_criacao.lte = new Date(dataFim as string);
      }

      const [logs, total] = await Promise.all([
        config.prisma.log.findMany({
          where,
          skip,
          take,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                email: true,
                tipo: true
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.log.count({ where })
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar histórico de auditoria'));
    }
  }

  // Exportar dados
  public async exportarDados(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo, formato = 'csv' } = req.body;

      let dados: any[] = [];
      let filename = '';

      switch (tipo) {
        case 'usuarios':
          const usuarios = await config.prisma.usuario.findMany({
            select: {
              id: true,
              nome: true,
              email: true,
              tipo: true,
              ativo: true,
              verificado: true,
              data_cadastro: true,
              reputacao: true
            }
          });
          dados = usuarios;
          filename = 'usuarios';
          break;

        case 'posts':
          const posts = await config.prisma.post.findMany({
            include: {
              usuario: {
                select: {
                  nome: true,
                  email: true
                }
              }
            }
          });
          dados = posts.map(p => ({
            id: p.id,
            titulo: p.titulo,
            categoria: p.categoria,
            status: p.status,
            autor: p.usuario.nome,
            autorEmail: p.usuario.email,
            data_criacao: p.data_criacao
          }));
          filename = 'posts';
          break;

        case 'pagamentos':
          const pagamentos = await config.prisma.pagamento.findMany({
            include: {
              contrato: {
                include: {
                  cliente: { select: { nome: true, email: true } },
                  prestador: { select: { nome: true, email: true } }
                }
              }
            }
          });
          dados = pagamentos.map(p => ({
            id: p.id,
            valor: p.valor,
            status: p.status,
            cliente: p.contrato.cliente.nome,
            clienteEmail: p.contrato.cliente.email,
            prestador: p.contrato.prestador.nome,
            prestadorEmail: p.contrato.prestador.email,
            data_criacao: p.data_criacao,
            data_pagamento: p.data_pagamento
          }));
          filename = 'pagamentos';
          break;

        case 'disputas':
          const disputas = await config.prisma.disputa.findMany({
            include: {
              contrato: {
                include: {
                  cliente: { select: { nome: true, email: true } },
                  prestador: { select: { nome: true, email: true } }
                }
              },
              moderador: { select: { nome: true } }
            }
          });
          dados = disputas.map(d => ({
            id: d.id,
            tipo: d.tipo,
            status: d.status,
            cliente: d.contrato.cliente.nome,
            prestador: d.contrato.prestador.nome,
            moderador: d.moderador?.nome || 'N/A',
            decisao: d.decisao || 'N/A',
            data_criacao: d.data_criacao,
            data_resolucao: d.data_resolucao
          }));
          filename = 'disputas';
          break;

        default:
          throw badRequest('Tipo de exportação inválido');
      }

      if (formato === 'csv') {
        const csv = this.converterParaCSV(dados);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
      } else if (formato === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.json"`);
        res.json({ success: true, data: dados });
      } else {
        throw badRequest('Formato de exportação inválido');
      }

      auditLog('DATA_EXPORT', {
        tipo,
        formato,
        admin_id: req.user!.id
      });

    } catch (error) {
      next(error);
    }
  }

  private converterParaCSV(dados: any[]): string {
    if (dados.length === 0) return '';

    const headers = Object.keys(dados[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    for (const row of dados) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return `"${String(value).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }
}
