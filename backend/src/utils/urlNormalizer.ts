import { Request } from 'express';

/**
 * Normaliza URLs que contêm localhost para usar o IP da requisição ou URL base configurável
 * Necessário para funcionar em mobile quando acessando pelo IP do computador
 */
export function normalizeUrl(url: string | null | undefined, req?: Request): string | null {
  if (!url) return null;

  // Se não contém localhost, retornar como está
  if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
    return url;
  }

  // Determinar a base URL a usar
  let baseUrl: string;

  // Prioridade 1: Variável de ambiente
  if (process.env.API_URL && !process.env.API_URL.includes('localhost')) {
    baseUrl = process.env.API_URL.replace('/api', '');
  }
  // Prioridade 2: Detectar IP do cliente pela requisição
  else if (req) {
    const protocol = req.protocol || 'http';
    
    // Tentar detectar IP do cliente a partir do Origin ou Referer
    const origin = req.get('origin') || req.get('referer') || '';
    
    // Se origin contém IP da rede local, extrair e usar
    const ipMatch = origin.match(/(http:\/\/)(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3})/);
    
    if (ipMatch) {
      const clientIp = ipMatch[2];
      baseUrl = `${protocol}://${clientIp}:3001`;
    } else {
      // Tentar usar variável de ambiente do backend
      const backendApiUrl = process.env.BACKEND_URL || process.env.API_URL;
      if (backendApiUrl && !backendApiUrl.includes('localhost')) {
        baseUrl = backendApiUrl.replace('/api', '');
      } else {
        // Fallback: usar localhost (vai funcionar no PC, mas não no mobile)
        baseUrl = 'http://localhost:3001';
      }
    }
  }
  // Prioridade 3: Fallback
  else {
    baseUrl = process.env.API_URL?.replace('/api', '') || 'http://localhost:3001';
  }

  // Substituir localhost na URL
  const normalized = url.replace(/http:\/\/localhost:3001/g, baseUrl);
  
  return normalized;
}

/**
 * Normaliza um array de URLs
 */
export function normalizeUrls(urls: string[] | null | undefined, req?: Request): string[] {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(url => normalizeUrl(url, req) || '').filter(Boolean);
}

/**
 * Normaliza URLs em um objeto de post
 */
export function normalizePostUrls(post: any, req?: Request): any {
  if (!post) return post;

  const normalized = { ...post };

  // Normalizar foto_perfil do usuário
  if (normalized.usuario?.foto_perfil) {
    normalized.usuario.foto_perfil = normalizeUrl(normalized.usuario.foto_perfil, req);
  }

  // Normalizar fotos do post
  if (normalized.fotos && Array.isArray(normalized.fotos)) {
    normalized.fotos = normalizeUrls(normalized.fotos, req);
  }

  // Normalizar fotos de orçamentos se houver
  if (normalized.orcamentos && Array.isArray(normalized.orcamentos)) {
    normalized.orcamentos = normalized.orcamentos.map((orcamento: any) => {
      if (orcamento.prestador?.foto_perfil) {
        orcamento.prestador.foto_perfil = normalizeUrl(orcamento.prestador.foto_perfil, req);
      }
      return orcamento;
    });
  }

  return normalized;
}

/**
 * Normaliza URLs em um array de posts
 */
export function normalizePostsUrls(posts: any[], req?: Request): any[] {
  if (!Array.isArray(posts)) return [];
  return posts.map(post => normalizePostUrls(post, req));
}

