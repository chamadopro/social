import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  // CustomError, 
  notFoundError, 
  forbidden, 
  badRequest,
  conflict 
} from '../middleware/errorHandler';
import { normalizePostsUrls, normalizePostUrls } from '../utils/urlNormalizer';
import { auditLog, logger } from '../utils/logger';

export class PostController {
  // Obter todos os posts (feed)
  public async getAllPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        page = 1, 
        limit = 20, 
        categoria, 
        tipo, 
        status = 'ATIVO',
        localizacao,
        preco_min,
        preco_max,
        avaliacao_min,
        search,
        is_apresentacao
      } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Construir filtros
      const where: any = { status };
      if (is_apresentacao !== undefined) {
        where.is_apresentacao = is_apresentacao === 'true';
      }
      
      if (categoria) {
        const cat = categoria as string;
        if (cat.includes(',')) {
          where.categoria = { in: cat.split(',').map(c => c.trim()).filter(Boolean) };
        } else {
          where.categoria = cat;
        }
      }
      if (tipo) where.tipo = tipo;
      if (search) {
        where.OR = [
          { titulo: { contains: search as string, mode: 'insensitive' } },
          { descricao: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      if (preco_min) where.preco_estimado = { gte: Number(preco_min) };
      if (preco_max) where.preco_estimado = { ...where.preco_estimado, lte: Number(preco_max) };

      // Filtro por localização (proximidade)
      if (localizacao) {
        const { raio: _raio = 10 } = JSON.parse(localizacao as string);
        // Implementar filtro por proximidade geográfica
        // Por enquanto, vamos usar um filtro simples
      }

      const [posts] = await Promise.all([
        config.prisma.post.findMany({
          where,
          skip,
          take,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
                tipo: true,
              }
            },
            _count: {
              select: {
                orcamentos: true,
                curtidas: true,
                comentarios: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.post.count({ where })
      ]);

      // Aplicar filtro de avaliação se especificado
      let filteredPosts = posts;
      if (avaliacao_min) {
        filteredPosts = posts.filter(post => 
          post.usuario.reputacao >= Number(avaliacao_min)
        );
      }

      // Normalizar URLs (substituir localhost por IP se necessário)
      const normalizedPosts = normalizePostsUrls(filteredPosts, req);

      res.json({
        success: true,
        data: {
          posts: normalizedPosts,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: filteredPosts.length,
            pages: Math.ceil(filteredPosts.length / Number(limit))
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter post por ID
  public async getPostById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              reputacao: true,
              tipo: true,
              telefone: true,
            }
          },
          orcamentos: {
            include: {
              prestador: {
                select: {
                  id: true,
                  nome: true,
                  foto_perfil: true,
                  reputacao: true,
                }
              }
            },
            orderBy: { data_criacao: 'desc' }
          },
          curtidas: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  foto_perfil: true,
                }
              }
            }
          },
          comentarios: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nome: true,
                  foto_perfil: true,
                }
              }
            },
            orderBy: { data_criacao: 'asc' }
          },
          _count: {
            select: {
              orcamentos: true,
              curtidas: true,
              comentarios: true,
            }
          }
        }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      // Normalizar URLs (substituir localhost por IP se necessário)
      const normalizedPost = normalizePostUrls(post, req);

      res.json({
        success: true,
        data: { post: normalizedPost }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter orçamentos de um post
  public async getPostOrcamentos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20, status } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Verificar se o post existe e se o usuário tem acesso
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      // Apenas o dono do post pode ver os orçamentos
      if (post.usuario_id !== req.user!.id) {
        throw forbidden('Acesso negado');
      }

      const where: any = { post_id: id };
      if (status) where.status = status;

      const [orcamentos, total] = await Promise.all([
        config.prisma.orcamento.findMany({
          where,
          skip,
          take,
          include: {
            prestador: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                reputacao: true,
                telefone: true,
              }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.orcamento.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          orcamentos,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Criar post
  public async createPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo, titulo, categoria, descricao, localizacao, preco_estimado, prazo, fotos, urgencia, disponibilidade, servico_relacionado_id } = req.body;
      const usuarioId = req.user!.id;

      // Buscar usuário e, se necessário, perfil associado pelo mesmo email
      const usuario = await config.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: {
          id: true,
          tipo: true,
          nome: true,
          email: true,
          endereco: true,
          areas_atuacao: true,
        }
      });

      if (!usuario) {
        throw notFoundError('Usuário não encontrado');
      }

      let areasAtuacao: string[] = usuario.areas_atuacao || [];
      if (usuario.tipo === 'CLIENTE') {
        const prestador = await config.prisma.usuario.findFirst({ where: { email: usuario.email, tipo: 'PRESTADOR' }, select: { areas_atuacao: true } });
        if (prestador?.areas_atuacao) areasAtuacao = prestador.areas_atuacao;
      }

      // Regras/validações
      if (tipo === 'SOLICITACAO') {
        // Anti-fraude: prestador (ou híbrido) não pode solicitar em categorias que oferece
        if (areasAtuacao?.length && categoria && areasAtuacao.includes(categoria)) {
          throw badRequest('Você não pode solicitar serviço em uma categoria que você oferece.');
        }
      }

      if (tipo === 'OFERTA') {
        // Prestador deve oferecer apenas dentro das áreas de atuação
        if (!categoria || !areasAtuacao?.includes(categoria)) {
          throw badRequest('Selecione uma categoria dentro das suas áreas de atuação.');
        }
      }

      // Vitrine: preencher campos obrigatórios com defaults
      const isVitrine = tipo === 'VITRINE_PRESTADOR' || tipo === 'VITRINE_CLIENTE';
      const tituloFinal = isVitrine ? (titulo || (tipo === 'VITRINE_PRESTADOR' ? 'Minha Vitrine de Serviços' : 'Minha Vitrine')) : titulo;
      const categoriaFinal = isVitrine ? (categoria || 'Vitrine') : categoria;
      const localizacaoFinal = isVitrine ? (localizacao || usuario.endereco || { endereco: 'Não informado', latitude: 0, longitude: 0 }) : localizacao;

      // Validação para Vitrine Cliente com serviço relacionado
      let prestadorRecomendadoId: string | null = null;
      let moedaCreditada = false;

      if (tipo === 'VITRINE_CLIENTE' && servico_relacionado_id) {
        // Verificar se o contrato existe, pertence ao cliente e está concluído
        const contrato = await config.prisma.contrato.findUnique({
          where: { id: servico_relacionado_id },
          include: {
            prestador: {
              select: { id: true, nome: true }
            }
          }
        });

        if (!contrato) {
          throw badRequest('Contrato não encontrado');
        }

        if (contrato.cliente_id !== usuarioId) {
          throw forbidden('Este contrato não pertence a você');
        }

        if (contrato.status !== 'CONCLUIDO') {
          throw badRequest('Apenas contratos concluídos podem ser associados');
        }

        // Verificar se já existe um post Vitrine Cliente associado a este contrato
        const postExistente = await config.prisma.post.findFirst({
          where: {
            servico_relacionado_id: servico_relacionado_id,
            tipo: 'VITRINE_CLIENTE',
            usuario_id: usuarioId,
            status: 'ATIVO'
          }
        });

        if (postExistente) {
          throw badRequest('Você já possui uma vitrine ativa associada a este serviço');
        }

        // Preencher prestador recomendado automaticamente
        prestadorRecomendadoId = contrato.prestador_id;
      }

      const post = await config.prisma.post.create({
        data: {
          id: require('uuid').v4(),
          usuario_id: usuarioId,
          tipo,
          titulo: tituloFinal,
          categoria: categoriaFinal,
          descricao,
          localizacao: {
            endereco: localizacaoFinal.endereco,
            latitude: localizacaoFinal.latitude,
            longitude: localizacaoFinal.longitude,
          },
          preco_estimado: preco_estimado ? Number(preco_estimado) : null,
          prazo: prazo ? new Date(prazo) : null,
          fotos: fotos || [],
          urgencia: urgencia || 'BAIXA',
          disponibilidade: disponibilidade || null,
          status: 'ATIVO',
          servico_relacionado_id: servico_relacionado_id || null,
          prestador_recomendado_id: prestadorRecomendadoId,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              reputacao: true,
              tipo: true,
            }
          },
          _count: {
            select: {
              orcamentos: true,
              curtidas: true,
              comentarios: true,
            }
          }
        }
      });

      // Creditar moeda se Vitrine Cliente com prestador associado
      if (tipo === 'VITRINE_CLIENTE' && prestadorRecomendadoId) {
        try {
          const { MoedaController } = await import('./MoedaController');
          await MoedaController.creditarMoeda(
            usuarioId,
            `Recomendação de prestador no post "${tituloFinal}"`,
            'RECOMENDACAO_PRESTADOR',
            post.id
          );
          moedaCreditada = true;
        } catch (error) {
          logger.warn('Erro ao creditar moeda (não crítico):', error);
          // Não falha o post se o crédito falhar
        }
      }

      // Log de auditoria
      auditLog('POST_CREATE', {
        userId: usuarioId,
        postId: post.id,
        tipo: post.tipo,
        categoria: post.categoria,
        servico_relacionado_id: servico_relacionado_id || null,
        moedaCreditada,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      const mensagem = moedaCreditada 
        ? 'Post criado com sucesso! Parabéns, você ganhou 1 moeda ChamadoPro!'
        : 'Post criado com sucesso';

      res.status(201).json({
        success: true,
        message: mensagem,
        data: { 
          post,
          moedaCreditada
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Atualizar post
  public async updatePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const usuarioId = req.user!.id;

      // Verificar se o post existe e se o usuário é o dono
      const existingPost = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true, status: true }
      });

      if (!existingPost) {
        throw notFoundError('Post não encontrado');
      }

      if (existingPost.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      // Não permitir editar posts finalizados ou cancelados
      if (['FINALIZADO', 'CANCELADO'].includes(existingPost.status)) {
        throw badRequest('Não é possível editar posts finalizados ou cancelados');
      }

      // Remover campos que não podem ser atualizados
      delete updateData.id;
      delete updateData.usuario_id;
      delete updateData.tipo;
      delete updateData.status;
      delete updateData.data_criacao;

      // Processar localização se fornecida
      if (updateData.localizacao) {
        updateData.localizacao = {
          endereco: updateData.localizacao.endereco,
          latitude: updateData.localizacao.latitude,
          longitude: updateData.localizacao.longitude,
        };
      }

      // Processar prazo se fornecido
      if (updateData.prazo) {
        updateData.prazo = new Date(updateData.prazo);
      }

      const post = await config.prisma.post.update({
        where: { id: id! },
        data: updateData,
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
              reputacao: true,
              tipo: true,
            }
          },
          _count: {
            select: {
              orcamentos: true,
              curtidas: true,
              comentarios: true,
            }
          }
        }
      });

      // Log de auditoria
      auditLog('POST_UPDATE', {
        userId: usuarioId,
        postId: id,
        changes: updateData,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Post atualizado com sucesso',
        data: { post }
      });

    } catch (error) {
      next(error);
    }
  }

  // Deletar post
  public async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe e se o usuário é o dono
      const existingPost = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true, status: true }
      });

      if (!existingPost) {
        throw notFoundError('Post não encontrado');
      }

      if (existingPost.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      // Verificar se há orçamentos aceitos
      const orcamentosAceitos = await config.prisma.orcamento.count({
        where: {
          post_id: id!,
          status: 'ACEITO'
        }
      });

      if (orcamentosAceitos > 0) {
        throw badRequest('Não é possível deletar post com orçamentos aceitos');
      }

      // Soft delete - apenas cancelar
      await config.prisma.post.update({
        where: { id: id! },
        data: { status: 'CANCELADO' }
      });

      // Log de auditoria
      auditLog('POST_DELETE', {
        userId: usuarioId,
        postId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Post cancelado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Curtir post
  public async curtirPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.status !== 'ATIVO') {
        throw badRequest('Não é possível curtir posts inativos');
      }

      // Verificar se já curtiu
      const existingCurtida = await config.prisma.curtida.findUnique({
        where: {
          post_id_usuario_id: {
            post_id: id!,
            usuario_id: usuarioId
          }
        }
      });

      if (existingCurtida) {
        throw conflict('Post já curtido');
      }

      // Criar curtida
      await config.prisma.curtida.create({
        data: {
          id: require('uuid').v4(),
          post_id: id!,
          usuario_id: usuarioId
        }
      });

      res.json({
        success: true,
        message: 'Post curtido com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Descurtir post
  public async descurtirPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se a curtida existe
      const curtida = await config.prisma.curtida.findUnique({
        where: {
          post_id_usuario_id: {
            post_id: id!,
            usuario_id: usuarioId
          }
        }
      });

      if (!curtida) {
        throw notFoundError('Curtida não encontrada');
      }

      // Remover curtida
      await config.prisma.curtida.delete({
        where: {
          post_id_usuario_id: {
            post_id: id!,
            usuario_id: usuarioId
          }
        }
      });

      res.json({
        success: true,
        message: 'Curtida removida com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Comentar post
  public async comentarPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { conteudo } = req.body;
      const usuarioId = req.user!.id;

      // Verificar se o post existe
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.status !== 'ATIVO') {
        throw badRequest('Não é possível comentar em posts inativos');
      }

      // Criar comentário
      const comentario = await config.prisma.comentario.create({
        data: {
          id: require('uuid').v4(),
          post_id: id!,
          usuario_id: usuarioId,
          conteudo
        },
        include: {
          usuario: {
            select: {
              id: true,
              nome: true,
              foto_perfil: true,
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Comentário adicionado com sucesso',
        data: { comentario }
      });

    } catch (error) {
      next(error);
    }
  }

  // Deletar comentário
  public async deletarComentario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, comentarioId } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o comentário existe e se o usuário é o dono
      const comentario = await config.prisma.comentario.findUnique({
        where: { id: comentarioId! },
        select: { usuario_id: true, post_id: true }
      });

      if (!comentario) {
        throw notFoundError('Comentário não encontrado');
      }

      if (comentario.post_id !== id) {
        throw badRequest('Comentário não pertence a este post');
      }

      if (comentario.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      // Deletar comentário
      await config.prisma.comentario.delete({
        where: { id: comentarioId! }
      });

      res.json({
        success: true,
        message: 'Comentário deletado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Finalizar post
  public async finalizarPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe e se o usuário é o dono
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      if (post.status !== 'ATIVO') {
        throw badRequest('Apenas posts ativos podem ser finalizados');
      }

      // Atualizar status
      await config.prisma.post.update({
        where: { id: id! },
        data: { status: 'FINALIZADO' }
      });

      // Log de auditoria
      auditLog('POST_FINALIZE', {
        userId: usuarioId,
        postId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Post finalizado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Cancelar post
  public async cancelarPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe e se o usuário é o dono
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      if (post.status !== 'ATIVO') {
        throw badRequest('Apenas posts ativos podem ser cancelados');
      }

      // Atualizar status
      await config.prisma.post.update({
        where: { id: id! },
        data: { status: 'CANCELADO' }
      });

      // Log de auditoria
      auditLog('POST_CANCEL', {
        userId: usuarioId,
        postId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Post cancelado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Reativar post
  public async reativarPost(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe e se o usuário é o dono
      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        select: { usuario_id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.usuario_id !== usuarioId) {
        throw forbidden('Acesso negado');
      }

      if (!['CANCELADO'].includes(post.status)) {
        throw badRequest('Apenas posts cancelados podem ser reativados');
      }

      // Atualizar status
      await config.prisma.post.update({
        where: { id: id! },
        data: { status: 'ATIVO' }
      });

      // Log de auditoria
      auditLog('POST_REACTIVATE', {
        userId: usuarioId,
        postId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Post reativado com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }

  // Prestador marca trabalho como concluído
  public async marcarTrabalhoConcluido(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const prestadorId = req.user!.id;

      const post = await config.prisma.post.findUnique({
        where: { id: id! },
        include: {
          orcamentos: {
            where: {
              prestador_id: prestadorId,
              status: 'ACEITO'
            }
          }
        }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      // Verificar se o prestador foi escolhido
      if (post.prestador_escolhido_id !== prestadorId) {
        throw forbidden('Apenas o prestador escolhido pode marcar como concluído');
      }

      // Verificar se há orçamento aceito
      if (post.orcamentos.length === 0) {
        throw badRequest('Não há orçamento aceito para este post');
      }

      // Verificar se está no status correto
      if (post.status !== 'ORCAMENTO_ACEITO') {
        throw badRequest('O post deve estar com orçamento aceito');
      }

      // Atualizar status
      await config.prisma.post.update({
        where: { id: id! },
        data: { status: 'TRABALHO_CONCLUIDO' as any }
      });

      // Notificar cliente
      // TODO: Implementar notificação

      auditLog('POST_TRABALHO_CONCLUIDO', {
        userId: prestadorId,
        postId: id,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Trabalho marcado como concluído. Aguardando confirmação do cliente.'
      });

    } catch (error) {
      next(error);
    }
  }

  // Cliente confirma conclusão do trabalho
  public async confirmarConclusaoTrabalho(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { manter_visivel, avaliacao } = req.body;
      const clienteId = req.user!.id;

      const post = await config.prisma.post.findUnique({
        where: { id: id! }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      // Verificar se o usuário é o cliente
      if (post.usuario_id !== clienteId) {
        throw forbidden('Apenas o cliente pode confirmar a conclusão');
      }

      // Verificar se está no status correto
      if (post.status !== 'TRABALHO_CONCLUIDO') {
        throw badRequest('O trabalho deve estar marcado como concluído pelo prestador');
      }

      // Verificar se há prestador escolhido
      if (!post.prestador_escolhido_id) {
        throw badRequest('Prestador escolhido não encontrado');
      }

      // Buscar dados do prestador
      const prestador = await config.prisma.usuario.findUnique({
        where: { id: post.prestador_escolhido_id },
        select: { id: true, nome: true }
      });

      if (!prestador) {
        throw notFoundError('Prestador escolhido não encontrado');
      }

      // Buscar contrato relacionado
      const orcamento = await config.prisma.orcamento.findFirst({
        where: {
          post_id: id!,
          prestador_id: post.prestador_escolhido_id,
          status: 'ACEITO'
        },
        include: {
          contrato: true
        }
      });

      if (!orcamento) {
        throw notFoundError('Orçamento aceito não encontrado');
      }

      // Criar avaliação se fornecida
      if (avaliacao && orcamento.contrato) {
        await config.prisma.avaliacao.create({
          data: {
            id: require('uuid').v4(),
            avaliador_id: clienteId,
            avaliado_id: post.prestador_escolhido_id,
            contrato_id: orcamento.contrato.id,
            nota: avaliacao.nota,
            comentario: avaliacao.comentario,
            aspectos: avaliacao.aspectos || null
          }
        });

        // Atualizar reputação do prestador
        await config.prisma.$executeRaw`
          UPDATE usuarios
          SET 
            total_avaliacoes = total_avaliacoes + 1,
            reputacao = (
              SELECT AVG(nota)::float
              FROM avaliacoes
              WHERE avaliado_id = ${post.prestador_escolhido_id}
            )
          WHERE id = ${post.prestador_escolhido_id}
        `;
      }

      // Atualizar post
      await config.prisma.post.update({
        where: { id: id! },
        data: {
          status: 'INATIVO' as any,
          manter_visivel: manter_visivel === true,
          excluido: manter_visivel === false ? false : post.excluido
        }
      });

      auditLog('POST_CONFIRMADO_CONCLUIDO', {
        userId: clienteId,
        postId: id,
        manterVisivel: manter_visivel,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Trabalho confirmado como concluído',
        data: {
          post: await config.prisma.post.findUnique({
            where: { id: id! }
          })
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Curtir/Descurtir post
  public async toggleCurtida(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user!.id;

      // Verificar se o post existe
      const post = await config.prisma.post.findUnique({
        where: { id },
        select: { id: true, status: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      if (post.status !== 'ATIVO') {
        throw badRequest('Apenas posts ativos podem ser curtidos');
      }

      // Verificar se já curtiu
      const curtidaExistente = await config.prisma.curtida.findUnique({
        where: {
          post_id_usuario_id: {
            post_id: id,
            usuario_id: usuarioId
          }
        }
      });

      let curtida;
      let acao;

      if (curtidaExistente) {
        // Remover curtida
        await config.prisma.curtida.delete({
          where: {
            post_id_usuario_id: {
              post_id: id,
              usuario_id: usuarioId
            }
          }
        });
        acao = 'removida';
        curtida = null;
      } else {
        // Adicionar curtida
        curtida = await config.prisma.curtida.create({
          data: {
            post_id: id,
            usuario_id: usuarioId
          },
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true
              }
            }
          }
        });
        acao = 'adicionada';
      }

      // Contar total de curtidas
      const totalCurtidas = await config.prisma.curtida.count({
        where: { post_id: id }
      });

      res.json({
        success: true,
        data: {
          curtida: curtida ? {
            id: curtida.id,
            usuario: curtida.usuario
          } : null,
          totalCurtidas,
          acao
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter curtidas de um post (público, mas mostra se usuário logado curtiu)
  public async getCurtidas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.id; // Opcional

      // Verificar se o post existe
      const post = await config.prisma.post.findUnique({
        where: { id },
        select: { id: true }
      });

      if (!post) {
        throw notFoundError('Post não encontrado');
      }

      // Contar total de curtidas
      const totalCurtidas = await config.prisma.curtida.count({
        where: { post_id: id }
      });

      // Verificar se usuário logado curtiu
      let usuarioCurtiu = false;
      if (usuarioId) {
        const curtida = await config.prisma.curtida.findUnique({
          where: {
            post_id_usuario_id: {
              post_id: id,
              usuario_id: usuarioId
            }
          }
        });
        usuarioCurtiu = !!curtida;
      }

      res.json({
        success: true,
        data: {
          totalCurtidas,
          usuarioCurtiu
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

