import { Request, Response, NextFunction } from 'express';
import { config } from '../config/database';
import { 
  badRequest,
  internalServerError
} from '../middleware/errorHandler';

export class BuscaController {
  // Buscar posts
  public async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        q, 
        categoria, 
        preco_min, 
        preco_max, 
        page = 1, 
        limit = 20 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        status: 'ATIVO'
      };

      // Busca por texto
      if (q) {
        where.OR = [
          { titulo: { contains: q as string, mode: 'insensitive' } },
          { descricao: { contains: q as string, mode: 'insensitive' } }
        ];
      }

      // Filtros
      if (categoria) {
        where.categoria = categoria;
      }

      if (preco_min || preco_max) {
        where.preco_estimado = {};
        if (preco_min) where.preco_estimado.gte = Number(preco_min);
        if (preco_max) where.preco_estimado.lte = Number(preco_max);
      }

      const [posts, total] = await Promise.all([
        config.prisma.post.findMany({
          where,
          skip,
          take,
          include: {
            usuario: {
              select: { id: true, nome: true, foto_perfil: true, reputacao: true }
            },
            _count: {
              select: { orcamentos: true, comentarios: true, curtidas: true }
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

  // Buscar usuários
  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        q, 
        tipo, 
        page = 1, 
        limit = 20 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const where: any = {
        ativo: true
      };

      // Busca por texto
      if (q) {
        where.OR = [
          { nome: { contains: q as string, mode: 'insensitive' } },
          { email: { contains: q as string, mode: 'insensitive' } }
        ];
      }

      // Filtros
      if (tipo) {
        where.tipo = tipo;
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
            foto_perfil: true,
            tipo: true,
            reputacao: true,
            endereco: true,
            data_cadastro: true
          },
          orderBy: { reputacao: 'desc' }
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

  // Busca global
  public async globalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q) {
        throw badRequest('Termo de busca é obrigatório');
      }

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      const [posts, usuarios] = await Promise.all([
        config.prisma.post.findMany({
          where: {
            status: 'ATIVO',
            OR: [
              { titulo: { contains: q as string, mode: 'insensitive' } },
              { descricao: { contains: q as string, mode: 'insensitive' } }
            ]
          },
          skip: Math.floor(skip / 2),
          take: Math.floor(take / 2),
          include: {
            usuario: {
              select: { id: true, nome: true, foto_perfil: true }
            }
          },
          orderBy: { data_criacao: 'desc' }
        }),
        config.prisma.usuario.findMany({
          where: {
            ativo: true,
            OR: [
              { nome: { contains: q as string, mode: 'insensitive' } },
              { email: { contains: q as string, mode: 'insensitive' } }
            ]
          },
          skip: Math.floor(skip / 2),
          take: Math.floor(take / 2),
          select: {
            id: true,
            nome: true,
            email: true,
            foto_perfil: true,
            tipo: true,
            reputacao: true
          },
          orderBy: { reputacao: 'desc' }
        })
      ]);

      res.json({
        success: true,
        data: {
          posts,
          usuarios,
          total: posts.length + usuarios.length
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter sugestões de busca
  public async getSugestoes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { termo } = req.query;
      
      if (!termo || (termo as string).length < 2) {
        res.json({
          success: true,
          data: []
        });
        return;
      }

      const sugestoes = await config.prisma.post.findMany({
        where: {
          status: 'ATIVO',
          OR: [
            { titulo: { contains: termo as string, mode: 'insensitive' } },
            { descricao: { contains: termo as string, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          titulo: true,
          categoria: true
        },
        take: 5,
        orderBy: { data_criacao: 'desc' }
      });

      res.json({
        success: true,
        data: sugestoes
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar sugestões'));
    }
  }

  // Obter categorias disponíveis
  public async getCategorias(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categorias = await config.prisma.post.groupBy({
        by: ['categoria'],
        where: { status: 'ATIVO' },
        _count: { categoria: true },
        orderBy: { _count: { categoria: 'desc' } }
      });

      res.json({
        success: true,
        data: categorias.map(cat => ({
          categoria: cat.categoria,
          total: cat._count.categoria
        }))
      });

    } catch (error) {
      next(internalServerError('Erro ao buscar categorias'));
    }
  }
}
