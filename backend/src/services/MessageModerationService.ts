import { logger } from '../utils/logger';

export interface ModerationResult {
  isBlocked: boolean;
  motivo?: string;
  conteudoOriginal: string;
  conteudoModerado?: string;
  detectedPatterns: string[];
}

export class MessageModerationService {
  // Padrões para detectar tentativas de contato externo
  private readonly blockedPatterns = [
    // WhatsApp
    /whatsapp|w\.?a\.?|zap|zapzap|wa\.me|wa\.link/i,
    /\(\d{2}\)\s?\d{4,5}-?\d{4}/, // Telefone brasileiro
    /\+55\s?\d{2}\s?\d{4,5}-?\d{4}/, // Telefone internacional
    /\d{2}\s?\d{4,5}-?\d{4}/, // Telefone simples
    /me\s+chama|chama\s+no|meu\s+zap|zap\s+é|meu\s+whats/i,
    
    // Instagram
    /instagram|insta|@\w+/, // @username
    /ig\s*[:\-]?\s*@?\w+/i,
    /me\s+segue|segue\s+la|meu\s+insta/i,
    
    // Facebook
    /facebook|fb\s*[:\-]?\s*@?\w+/i,
    /me\s+adiciona|adiciona\s+la|meu\s+face/i,
    
    // Telegram
    /telegram|t\.me|@\w+.*telegram/i,
    
    // Email
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, // Email completo
    /meu\s+email|e-mail|email\s*[:\-]?\s*[a-zA-Z0-9._%+-]+/i,
    
    // Outros
    /saia\s+da\s+plataforma|fora\s+daqui|chama\s+fora|negocia\s+fora/i,
    /contato\s+externo|contato\s+direto|sem\s+a\s+plataforma/i,
    /me\s+liga|liga\s+pra|me\s+ligue|ligue\s+pra/i,
    /me\s+procura|procura\s+no|me\s+encontra/i,
    
    // Números de telefone comuns (formato específico para evitar falsos positivos)
    /(?:me\s+chama|chama|ligue|telefone|celular|zap|whats).*?\d{10,11}/i, // Números com contexto de telefone
    
    // URLs suspeitas
    /https?:\/\/[^\s]+/i, // URLs (exceto se for da plataforma)
    
    // Padrões de evasão
    /(?:w|whats|zap|insta|telegram|email|telefone).*?(?:@|\d|\+)/i,
    /(?:@|\d|\+).*?(?:w|whats|zap|insta|telegram|email|telefone)/i,
  ];

  // Padrões permitidos (exceções)
  private readonly allowedPatterns = [
    /chamadopro/i, // Nome da plataforma
    /plataforma/i,
    /site|aplicativo/i,
  ];

  /**
   * Verifica se uma mensagem contém tentativas de contato externo
   */
  public moderateMessage(conteudo: string): ModerationResult {
    const detectedPatterns: string[] = [];
    let motivo: string | undefined;

    // Verificar padrões bloqueados
    for (const pattern of this.blockedPatterns) {
      const match = conteudo.match(pattern);
      if (match) {
        const matchedText = match[0];
        
        // Verificar se é uma exceção permitida
        const isAllowed = this.allowedPatterns.some(allowed => 
          conteudo.match(allowed)
        );
        
        if (!isAllowed) {
          detectedPatterns.push(matchedText);
          
          // Determinar o motivo específico
          if (!motivo) {
            if (pattern.source.includes('whatsapp') || pattern.source.includes('zap') || pattern.source.includes('wa')) {
              motivo = 'Tentativa de compartilhar contato do WhatsApp detectada';
            } else if (pattern.source.includes('instagram') || pattern.source.includes('insta')) {
              motivo = 'Tentativa de compartilhar perfil do Instagram detectada';
            } else if (pattern.source.includes('facebook') || pattern.source.includes('fb')) {
              motivo = 'Tentativa de compartilhar perfil do Facebook detectada';
            } else if (pattern.source.includes('telegram')) {
              motivo = 'Tentativa de compartilhar contato do Telegram detectada';
            } else if (pattern.source.includes('email') || pattern.source.includes('@')) {
              motivo = 'Tentativa de compartilhar email detectada';
            } else if (pattern.source.includes('\\d') && matchedText.length >= 10) {
              motivo = 'Tentativa de compartilhar número de telefone detectada';
            } else if (pattern.source.includes('http')) {
              motivo = 'Tentativa de compartilhar link externo detectada';
            } else {
              motivo = 'Conteúdo bloqueado por tentativa de contato externo';
            }
          }
        }
      }
    }

    const isBlocked = detectedPatterns.length > 0;

    if (isBlocked) {
      logger.warn('Mensagem bloqueada por moderação:', {
        motivo,
        detectedPatterns,
        conteudoLength: conteudo.length,
      });
    }

    return {
      isBlocked,
      motivo,
      conteudoOriginal: conteudo,
      detectedPatterns,
    };
  }

  /**
   * Sanitiza o conteúdo removendo informações de contato
   * (Usado para logs, mas a mensagem não é salva)
   */
  public sanitizeContent(conteudo: string): string {
    let sanitized = conteudo;

    // Remover números de telefone
    sanitized = sanitized.replace(/(\+55\s?)?\d{2}\s?\d{4,5}-?\d{4}/g, '[TELEFONE REMOVIDO]');
    
    // Remover emails
    sanitized = sanitized.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REMOVIDO]');
    
    // Remover @mentions suspeitas
    sanitized = sanitized.replace(/@\w+/g, '[@USUARIO REMOVIDO]');
    
    // Remover URLs
    sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[LINK REMOVIDO]');

    return sanitized;
  }

  /**
   * Verifica se a mensagem contém apenas conteúdo permitido
   */
  public isContentAllowed(conteudo: string): boolean {
    const result = this.moderateMessage(conteudo);
    return !result.isBlocked;
  }
}

// Instância singleton
export const messageModerationService = new MessageModerationService();

