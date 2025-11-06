import { Request, Response, NextFunction } from 'express';
import { searchService, SearchFilters } from '../services/SearchService';
import { auditLog } from '../utils/logger';

export class SearchController {
  // Buscar posts com filtros avançados
  public async searchPosts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string,
        categoria: req.query.categoria as string,
        subcategoria: req.query.subcategoria as string,
        // estado removido
        cidade: req.query.cidade as string,
        cep: req.query.cep as string,
        raio: req.query.raio ? Number(req.query.raio) : undefined,
        precoMin: req.query.precoMin ? Number(req.query.precoMin) : undefined,
        precoMax: req.query.precoMax ? Number(req.query.precoMax) : undefined,
        tipoUsuario: req.query.tipoUsuario as 'CLIENTE' | 'PRESTADOR' | 'ADMIN',
        verificado: req.query.verificado === 'true' ? true : req.query.verificado === 'false' ? false : undefined,
        reputacaoMin: req.query.reputacaoMin ? Number(req.query.reputacaoMin) : undefined,
        reputacaoMax: req.query.reputacaoMax ? Number(req.query.reputacaoMax) : undefined,
        totalAvaliacoesMin: req.query.totalAvaliacoesMin ? Number(req.query.totalAvaliacoesMin) : undefined,
        dataInicio: req.query.dataInicio ? new Date(req.query.dataInicio as string) : undefined,
        dataFim: req.query.dataFim ? new Date(req.query.dataFim as string) : undefined,
        status: req.query.status as 'ATIVO' | 'FINALIZADO' | 'CANCELADO',
        urgente: req.query.urgente === 'true' ? true : req.query.urgente === 'false' ? false : undefined,
        disponivel: req.query.disponivel === 'true' ? true : req.query.disponivel === 'false' ? false : undefined,
        orderBy: req.query.orderBy as 'relevancia' | 'data' | 'preco' | 'reputacao' | 'distancia',
        orderDirection: req.query.orderDirection as 'asc' | 'desc',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const result = await searchService.searchPosts(filters);

      // Log de auditoria
      auditLog('SEARCH_POSTS', {
        userId: req.user?.id,
        filters: filters,
        resultsCount: result.data.length,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // Buscar usuários com filtros avançados
  public async searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string,
        tipoUsuario: req.query.tipoUsuario as 'CLIENTE' | 'PRESTADOR' | 'ADMIN',
        verificado: req.query.verificado === 'true' ? true : req.query.verificado === 'false' ? false : undefined,
        reputacaoMin: req.query.reputacaoMin ? Number(req.query.reputacaoMin) : undefined,
        reputacaoMax: req.query.reputacaoMax ? Number(req.query.reputacaoMax) : undefined,
        totalAvaliacoesMin: req.query.totalAvaliacoesMin ? Number(req.query.totalAvaliacoesMin) : undefined,
        // estado removido
        cidade: req.query.cidade as string,
        orderBy: req.query.orderBy as 'relevancia' | 'data' | 'preco' | 'reputacao' | 'distancia',
        orderDirection: req.query.orderDirection as 'asc' | 'desc',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const result = await searchService.searchUsers(filters);

      // Log de auditoria
      auditLog('SEARCH_USERS', {
        userId: req.user?.id,
        filters: filters,
        resultsCount: result.data.length,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // Buscar serviços com filtros avançados
  public async searchServices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: SearchFilters = {
        query: req.query.q as string,
        categoria: req.query.categoria as string,
        subcategoria: req.query.subcategoria as string,
        // estado removido
        cidade: req.query.cidade as string,
        precoMin: req.query.precoMin ? Number(req.query.precoMin) : undefined,
        precoMax: req.query.precoMax ? Number(req.query.precoMax) : undefined,
        reputacaoMin: req.query.reputacaoMin ? Number(req.query.reputacaoMin) : undefined,
        reputacaoMax: req.query.reputacaoMax ? Number(req.query.reputacaoMax) : undefined,
        orderBy: req.query.orderBy as 'relevancia' | 'data' | 'preco' | 'reputacao' | 'distancia',
        orderDirection: req.query.orderDirection as 'asc' | 'desc',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20
      };

      const result = await searchService.searchServices(filters);

      // Log de auditoria
      auditLog('SEARCH_SERVICES', {
        userId: req.user?.id,
        filters: filters,
        resultsCount: result.data.length,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      next(error);
    }
  }

  // Busca global (posts + usuários + serviços)
  public async globalSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query.q as string;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query de busca é obrigatória'
        });
        return;
      }

      const [posts, users, services] = await Promise.all([
        searchService.searchPosts({
          query,
          page: 1,
          limit: Math.ceil(limit / 3)
        }),
        searchService.searchUsers({
          query,
          page: 1,
          limit: Math.ceil(limit / 3)
        }),
        searchService.searchServices({
          query,
          page: 1,
          limit: Math.ceil(limit / 3)
        })
      ]);

      // Log de auditoria
      auditLog('GLOBAL_SEARCH', {
        userId: req.user?.id,
        query: query,
        resultsCount: posts.data.length + users.data.length + services.data.length,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: {
          posts: posts.data,
          users: users.data,
          services: services.data,
          pagination: {
            page,
            limit,
            total: posts.pagination.total + users.pagination.total + services.pagination.total
          }
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter sugestões de busca
  public async getSuggestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q: query, type = 'posts' } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Query de busca é obrigatória'
        });
        return;
      }

      const suggestions = await searchService.getSearchSuggestions(
        query,
        type as 'posts' | 'users' | 'services'
      );

      res.json({
        success: true,
        data: { suggestions }
      });

    } catch (error) {
      next(error);
    }
  }

  // Obter filtros disponíveis
  public async getAvailableFilters(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = await searchService.getAvailableFilters();

      res.json({
        success: true,
        data: filters
      });

    } catch (error) {
      next(error);
    }
  }

  // Salvar busca (para analytics)
  public async saveSearch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { query, filters, resultsCount } = req.body;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Query de busca é obrigatória'
        });
        return;
      }

      // Aqui você pode salvar a busca no banco para analytics
      // Por exemplo, em uma tabela de analytics de busca
      
      // Log de auditoria
      auditLog('SAVE_SEARCH', {
        userId: req.user?.id,
        query: query,
        filters: filters,
        resultsCount: resultsCount,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Busca salva com sucesso'
      });

    } catch (error) {
      next(error);
    }
  }
}
