# 🔍 Análise de Duplicação de Código

## ⚠️ Duplicações Identificadas

### 1. **Orçamentos** - Código Duplicado

**Problema:**
- ❌ `frontend/src/hooks/useOrcamentos.ts` - Classe `OrcamentoManager` usando `fetch` diretamente
- ✅ `frontend/src/services/orcamentos.ts` - Classe `OrcamentosService` usando `api` corretamente

**Solução:**
- `useOrcamentos.ts` deveria usar `orcamentosService` ao invés de `OrcamentoManager`
- Ou usar `api` diretamente

**Arquivos que usam:**
- `frontend/src/app/orcamentos/page.tsx`
- `frontend/src/components/CriarOrcamentoModal.tsx`
- `frontend/src/store/orcamentos.ts`

---

### 2. **Busca** - Código Duplicado

**Problema:**
- ❌ `frontend/src/hooks/useSearch.ts` - Classe `SearchManager` usando `fetch` diretamente
- ✅ Já existe `api` que pode ser usado

**Solução:**
- `SearchManager` deveria usar `api` ao invés de `fetch` direto

**Arquivos que usam:**
- `frontend/src/app/search/page.tsx`
- Vários outros arquivos

---

### 3. **Variáveis de Ambiente** - Múltiplas Leituras

**Problema:**
- `process.env.NEXT_PUBLIC_API_URL` sendo lido em vários lugares:
  - `frontend/src/services/api.ts` ✅ (centralizado)
  - `frontend/src/utils/socket.ts` ✅ (necessário)
  - `frontend/src/hooks/useOrcamentos.ts` ❌ (duplicado)
  - `frontend/src/hooks/useSearch.ts` ❌ (duplicado)
  - `frontend/src/app/page.tsx` (apenas para log - OK)

**Solução:**
- Usar `api` centralizado ou `getApiUrl()` de `socket.ts`

---

## ✅ Código Correto (Já Existe)

### `frontend/src/services/api.ts`
- ✅ Classe `ApiService` centralizada
- ✅ Lê `process.env.NEXT_PUBLIC_API_URL` uma vez
- ✅ Singleton exportado como `api`
- ✅ Métodos: `get`, `post`, `put`, `delete`, `getPaginated`

### `frontend/src/services/orcamentos.ts`
- ✅ Usa `api` corretamente
- ✅ Exporta `orcamentosService` singleton

---

## 🔧 Recomendações

### Prioridade Alta:
1. **Substituir `OrcamentoManager` por `orcamentosService`** em `useOrcamentos.ts`
2. **Substituir `SearchManager` por `api`** em `useSearch.ts`

### Prioridade Baixa:
3. Criar função utilitária `getApiUrl()` centralizada
4. Remover leituras diretas de `process.env.NEXT_PUBLIC_API_URL`

---

## 📝 Nota Importante

**NÃO fazer mudanças drásticas sem testar!**

- Verificar se `OrcamentoManager` tem alguma funcionalidade específica que `OrcamentosService` não tem
- Verificar se `SearchManager` tem alguma funcionalidade específica
- Testar todos os arquivos que usam esses hooks antes de remover

---

## 🎯 Próximos Passos

1. ✅ Documentado (este arquivo)
2. ⏳ Revisar uso de `OrcamentoManager` vs `OrcamentosService`
3. ⏳ Revisar uso de `SearchManager` vs `api`
4. ⏳ Consolidar quando seguro

