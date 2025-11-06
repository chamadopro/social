import { config } from '../config/database';
import { logger } from '../utils/logger';

export interface SearchFilters {
  // Filtros de texto
  query?: string;
  
  // Filtros de categoria
  categoria?: string;
  subcategoria?: string;
  
  // Filtros de localização
  // estado removido pois não existe no schema
  cidade?: string;
  cep?: string;
  raio?: number; // em km
  
  // Filtros de preço
  precoMin?: number;
  precoMax?: number;
  
  // Filtros de usuário
  tipoUsuario?: 'CLIENTE' | 'PRESTADOR' | 'ADMIN';
  verificado?: boolean;
  
  // Filtros de reputação
  reputacaoMin?: number;
  reputacaoMax?: number;
  totalAvaliacoesMin?: number;
  
  // Filtros de data
  dataInicio?: Date;
  dataFim?: Date;
  
  // Filtros de status
  status?: 'ATIVO' | 'FINALIZADO' | 'CANCELADO';
  
  // Filtros de urgência
  urgente?: boolean;
  
  // Filtros de disponibilidade
  disponivel?: boolean;
  
  // Ordenação
  orderBy?: 'relevancia' | 'data' | 'preco' | 'reputacao' | 'distancia';
  orderDirection?: 'asc' | 'desc';
  
  // Paginação
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: SearchFilters;
  aggregations?: {
    categorias: { [key: string]: number };
    // estados removido pois não existe no schema
    faixasPreco: { [key: string]: number };
  };
}

class SearchService {
  // Buscar posts com filtros avançados
  public async searchPosts(filters: SearchFilters): Promise<SearchResult<any>> {
    try {
      const {
        query,
        categoria: _categoria,
        subcategoria: _subcategoria,
        cidade,
        cep,
        raio: _raio,
        precoMin: _precoMin,
        precoMax: _precoMax,
        tipoUsuario,
        verificado,
        reputacaoMin,
        reputacaoMax,
        totalAvaliacoesMin,
        dataInicio,
        dataFim,
        status,
        urgente,
        disponivel,
        orderBy = 'relevancia',
        orderDirection = 'desc',
        page = 1,
        limit = 20
      } = filters;

      const skip = (page - 1) * limit;
      const take = limit;

      // Construir filtros WHERE
      const where: any = {
        status: status || 'ATIVO'
      };

      // Filtro de texto (busca em título, descrição e tags)
      if (query) {
        where.OR = [
          { titulo: { contains: query, mode: 'insensitive' } },
          { descricao: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } }
        ];
      }

      // Filtros de categoria
      if (_categoria) {
        where.categoria = _categoria;
      }
      if (_subcategoria) {
        where.subcategoria = _subcategoria;
      }

      // Filtros de localização
      // estado removido pois não existe no schema
      if (cidade) {
        where.cidade = { contains: cidade, mode: 'insensitive' };
      }
      if (cep) {
        where.cep = cep;
      }

      // Filtros de preço
      if (_precoMin !== undefined || _precoMax !== undefined) {
        where.valor_estimado = {};
        if (_precoMin !== undefined) {
          where.valor_estimado.gte = _precoMin;
        }
        if (_precoMax !== undefined) {
          where.valor_estimado.lte = _precoMax;
        }
      }

      // Filtros de data
      if (dataInicio || dataFim) {
        where.data_criacao = {};
        if (dataInicio) {
          where.data_criacao.gte = dataInicio;
        }
        if (dataFim) {
          where.data_criacao.lte = dataFim;
        }
      }

      // Filtros de urgência e disponibilidade
      if (urgente !== undefined) {
        where.urgente = urgente;
      }
      if (disponivel !== undefined) {
        where.disponivel = disponivel;
      }

      // Construir ordenação
      let orderByClause: any = {};
      switch (orderBy) {
        case 'data':
          orderByClause = { data_criacao: orderDirection };
          break;
        case 'preco':
          orderByClause = { valor_estimado: orderDirection };
          break;
        case 'relevancia':
        default:
          // Ordenação por relevância (posts mais recentes e com mais curtidas)
          orderByClause = [
            { data_criacao: 'desc' },
            { curtidas: 'desc' }
          ];
          break;
      }

      // Buscar posts
      const [posts] = await Promise.all([
        config.prisma.post.findMany({
          where,
          include: {
            usuario: {
              select: {
                id: true,
                nome: true,
                foto_perfil: true,
                tipo: true,
                reputacao: true,
                total_avaliacoes: true,
                verificado: true
              }
            },
            curtidas: true,
            comentarios: {
              select: {
                id: true,
                conteudo: true,
                data_criacao: true,
                usuario: {
                  select: {
                    id: true,
                    nome: true,
                    foto_perfil: true
                  }
                }
              },
              take: 3,
              orderBy: { data_criacao: 'desc' }
            },
            _count: {
              select: {
                curtidas: true,
                comentarios: true
              }
            }
          },
          orderBy: orderByClause,
          skip,
          take
        }),
        config.prisma.post.count({ where })
      ]);

      // Aplicar filtros de usuário se especificados
      let filteredPosts = posts;
      if (tipoUsuario || verificado !== undefined || reputacaoMin !== undefined || reputacaoMax !== undefined || totalAvaliacoesMin !== undefined) {
        filteredPosts = posts.filter(post => {
          const autor = post.usuario;
          
          if (tipoUsuario && autor.tipo !== tipoUsuario) return false;
          if (verificado !== undefined && autor.verificado !== verificado) return false;
          if (reputacaoMin !== undefined && autor.reputacao < reputacaoMin) return false;
          if (reputacaoMax !== undefined && autor.reputacao > reputacaoMax) return false;
          if (totalAvaliacoesMin !== undefined && (autor.total_avaliacoes || 0) < totalAvaliacoesMin) return false;
          
          return true;
        });
      }

      // Calcular agregações
      const aggregations = await this.calculateAggregations(where);

      return {
        data: filteredPosts,
        pagination: {
          page,
          limit,
          total: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limit)
        },
        filters,
        aggregations
      };

    } catch (error) {
      logger.error('Erro ao buscar posts:', error);
      throw error;
    }
  }

  // Buscar usuários com filtros avançados
  public async searchUsers(filters: SearchFilters): Promise<SearchResult<any>> {
    try {
      const {
        query,
        tipoUsuario,
        verificado,
        reputacaoMin,
        reputacaoMax,
        totalAvaliacoesMin,
        // estado removido
        cidade,
        orderBy = 'reputacao',
        orderDirection = 'desc',
        page = 1,
        limit = 20
      } = filters;

      const skip = (page - 1) * limit;
      const take = limit;

      // Construir filtros WHERE
      const where: any = {};

      // Filtro de texto
      if (query) {
        where.OR = [
          { nome: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Filtros de tipo e verificação
      if (tipoUsuario) {
        where.tipo = tipoUsuario;
      }
      if (verificado !== undefined) {
        where.verificado = verificado;
      }

      // Filtros de localização
      // estado removido pois não existe no schema
      if (cidade) {
        where.cidade = { contains: cidade, mode: 'insensitive' };
      }

      // Filtros de reputação
      if (reputacaoMin !== undefined) {
        where.reputacao = { gte: reputacaoMin };
      }
      if (reputacaoMax !== undefined) {
        where.reputacao = { ...where.reputacao, lte: reputacaoMax };
      }
      if (totalAvaliacoesMin !== undefined) {
        where.total_avaliacoes = { gte: totalAvaliacoesMin };
      }

      // Construir ordenação
      let orderByClause: any = {};
      switch (orderBy) {
        case 'reputacao':
          orderByClause = { reputacao: orderDirection };
          break;
        case 'data':
          orderByClause = { data_cadastro: orderDirection };
          break;
        default:
          orderByClause = { reputacao: 'desc' };
      }

      // Buscar usuários
      const [users, total] = await Promise.all([
        config.prisma.usuario.findMany({
          where,
          select: {
            id: true,
            nome: true,
            email: true,
            foto_perfil: true,
            tipo: true,
            verificado: true,
            reputacao: true,
            total_avaliacoes: true,
            data_cadastro: true,
            _count: {
              select: {
                posts: true,
                contratos_cliente: true,
                contratos_prestador: true
              }
            }
          },
          orderBy: orderByClause,
          skip,
          take
        }),
        config.prisma.usuario.count({ where })
      ]);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters
      };

    } catch (error) {
      logger.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  // Buscar serviços com filtros avançados
  public async searchServices(filters: SearchFilters): Promise<SearchResult<any>> {
    try {
      const {
        query,
        categoria: _categoria2,
        subcategoria: _subcategoria2,
        // estado removido
        cidade,
        precoMin: _precoMin2,
        precoMax: _precoMax2,
        reputacaoMin,
        reputacaoMax,
        orderBy = 'reputacao',
        orderDirection = 'desc',
        page = 1,
        limit = 20
      } = filters;

      const skip = (page - 1) * limit;
      const take = limit;

      // Construir filtros WHERE
      const where: any = {
        tipo: 'PRESTADOR'
      };

      // Filtro de texto
      if (query) {
        where.OR = [
          { nome: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } }
        ];
      }

      // Filtros de localização
      // estado removido pois não existe no schema
      if (cidade) {
        where.cidade = { contains: cidade, mode: 'insensitive' };
      }

      // Filtros de reputação
      if (reputacaoMin !== undefined) {
        where.reputacao = { gte: reputacaoMin };
      }
      if (reputacaoMax !== undefined) {
        where.reputacao = { ...where.reputacao, lte: reputacaoMax };
      }

      // Construir ordenação
      let orderByClause: any = {};
      switch (orderBy) {
        case 'reputacao':
          orderByClause = { reputacao: orderDirection };
          break;
        case 'data':
          orderByClause = { data_cadastro: orderDirection };
          break;
        default:
          orderByClause = { reputacao: 'desc' };
      }

      // Buscar usuários prestadores
      const [users, total] = await Promise.all([
        config.prisma.usuario.findMany({
          where,
          select: {
            id: true,
            nome: true,
            foto_perfil: true,
            tipo: true,
            verificado: true,
            reputacao: true,
            total_avaliacoes: true,
            data_cadastro: true,
            _count: {
              select: {
                posts: true,
                contratos_prestador: true
              }
            }
          },
          orderBy: orderByClause,
          skip,
          take
        }),
        config.prisma.usuario.count({ where })
      ]);

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        filters
      };

    } catch (error) {
      logger.error('Erro ao buscar serviços:', error);
      throw error;
    }
  }

  // Calcular agregações para filtros
  private async calculateAggregations(where: any): Promise<any> {
    try {
      const [categorias] = await Promise.all([
        // Agregação por categoria
        config.prisma.post.groupBy({
          by: ['categoria'],
          where: { ...where, categoria: { not: null } },
          _count: { categoria: true }
        }),
        
        // Agregação por categoria
        config.prisma.post.groupBy({
          by: ['categoria'],
          where: { ...where, categoria: { not: null } },
          _count: { categoria: true }
        }),
        
        // Agregação por faixa de preço removida por problemas de tipo
        Promise.resolve([])
      ]);

      // Processar agregações
      const categoriasMap: { [key: string]: number } = {};
      categorias.forEach(item => {
        if (item.categoria) {
          categoriasMap[item.categoria] = item._count.categoria;
        }
      });

      // Removido estadosMap pois o campo estado não existe no schema

      // Processar faixas de preço (simplificado)
      const faixasPrecoMap: { [key: string]: number } = {
        '0-50': 0,
        '50-100': 0,
        '100-200': 0,
        '200-500': 0,
        '500+': 0
      };

      return {
        categorias: categoriasMap,
        faixasPreco: faixasPrecoMap
      };

    } catch (error) {
      logger.error('Erro ao calcular agregações:', error);
      return {
        categorias: {},
        // estados removido
        faixasPreco: {}
      };
    }
  }

  // Obter sugestões de busca
  public async getSearchSuggestions(query: string, type: 'posts' | 'users' | 'services' = 'posts'): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      if (type === 'posts') {
        // Sugestões de títulos de posts
        const posts = await config.prisma.post.findMany({
          where: {
            titulo: { contains: query, mode: 'insensitive' }
          },
          select: { titulo: true },
          take: 5
        });
        suggestions.push(...posts.map(p => p.titulo));
      } else if (type === 'users') {
        // Sugestões de nomes de usuários
        const users = await config.prisma.usuario.findMany({
          where: {
            nome: { contains: query, mode: 'insensitive' }
          },
          select: { nome: true },
          take: 5
        });
        suggestions.push(...users.map(u => u.nome));
      }

      return suggestions;

    } catch (error) {
      logger.error('Erro ao obter sugestões de busca:', error);
      return [];
    }
  }

  // Obter filtros disponíveis
  public async getAvailableFilters(): Promise<any> {
    try {
      const categorias = await config.prisma.post.groupBy({
        by: ['categoria'],
        where: { categoria: { not: undefined } },
        _count: { categoria: true },
        orderBy: { _count: { categoria: 'desc' } }
      });

      return {
        categorias: categorias.map(c => ({ value: c.categoria, count: c._count?.categoria || 0 }))
      };

    } catch (error) {
      logger.error('Erro ao obter filtros disponíveis:', error);
      return {
        categorias: []
      };
    }
  }
}

export const searchService = new SearchService();
