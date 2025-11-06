'use client';

import { useEffect } from 'react';

/**
 * Componente que detecta e configura o idioma do HTML dinamicamente
 * Evita problemas de hidratação ao sincronizar servidor e cliente
 */
export function LanguageDetector() {
  useEffect(() => {
    // Detectar idioma do navegador
    const browserLang = navigator.language || navigator.languages?.[0] || 'pt-BR';
    
    // Normalizar para formato adequado (ex: 'pt' -> 'pt-BR', 'en-US' -> 'en-US')
    let lang = browserLang.toLowerCase();
    
    // Mapear idiomas comuns para formatos padrão
    if (lang.startsWith('pt')) {
      lang = 'pt-BR';
    } else if (lang.startsWith('en')) {
      lang = 'en-US';
    } else if (lang.startsWith('es')) {
      lang = 'es-ES';
    } else {
      // Manter formato original se já estiver correto, ou usar 'pt-BR' como fallback
      lang = lang.includes('-') ? lang : `${lang}-${lang.toUpperCase()}`;
    }
    
    // Atualizar atributo lang do HTML apenas no cliente
    if (typeof document !== 'undefined') {
      const htmlElement = document.documentElement;
      if (htmlElement.getAttribute('lang') !== lang) {
        htmlElement.setAttribute('lang', lang);
      }
    }
  }, []);

  return null; // Componente não renderiza nada
}

