# Limpeza de Comentários e Logs Temporários

## Objetivo
Remover `console.log`, TODOs obsoletos e comentários duplicados que poluíam o frontend/backend, reduzindo ruído nos commits e nos consoles de desenvolvimento.

## Escopo da limpeza
- **Frontend**: componentes e páginas (`app/`, `components/`, `services/api.ts`) com logs de debug antigos, placeholders e comentários redundantes.
- **Backend**: controllers e serviços que continham logs de inspeção, especialmente em fluxos de autenticação/social login.
- **Documentação**: arquivos com cabeçalhos repetidos ou instruções desatualizadas.

## Resultado
- Consoles mais limpos durante desenvolvimento (principalmente admin panel).
- Logs relevantes condicionados a ambientes de debug (`window.__API_DEBUG__`, `DEBUG_SOCKET`).
- Documentação padronizada sem cabeçalhos redundantes.

## Recomendações futuras
1. Habilitar logs detalhados apenas via feature flag (ex.: `process.env.NEXT_PUBLIC_DEBUG`).
2. Manter comentários focados em regras de negócio ou TODOs próximos de execução.
3. Adotar lint/CI para rejeitar `console.log` não autorizados em PRs.
