# 🔍 Verificação: Por que não funciona no Mobile?

## Problema

- ✅ **PC funciona:** Posts carregam normalmente
- ❌ **Mobile não funciona:** Erro "Não foi possível conectar ao servidor"

## Possíveis Causas

### 1. Variável de Ambiente Não Carregada

O Next.js pode não ter recarregado as variáveis após criar o `.env.local`.

**Solução:**
1. **Pare COMPLETAMENTE o servidor** (Ctrl+C)
2. **Delete a pasta `.next`:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   ```
3. **Reinicie:**
   ```bash
   npm run dev
   ```

### 2. Verificar Console do Navegador Mobile

No celular, abra o console do navegador (se possível) ou use Chrome DevTools:

1. **No PC:** Abra `chrome://inspect`
2. **Conecte o celular** via USB
3. **Ative "Inspect"** no dispositivo
4. **Procure por estes logs:**
   ```
   🔍 API Configuration: { ... }
   🔧 ApiService initialized with baseURL: ...
   📱 HomePage - Verificando autenticação: { ... }
   🔍 API Request Details: { ... }
   ```

### 3. Verificar se Ainda Usa localhost

No console, verifique:
- Se `NEXT_PUBLIC_API_URL` mostra `http://192.168.15.2:3001/api` ✅
- Ou se mostra `http://localhost:3001/api` ❌

Se ainda mostrar `localhost`, o Next.js não carregou o `.env.local`.

### 4. Verificar Arquivo .env.local

O arquivo `frontend/.env.local` deve ter EXATAMENTE:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
```

**Sem duplicatas, sem espaços, sem aspas!**

### 5. Testar Conexão Direta

No celular, tente acessar diretamente no navegador:
```
http://192.168.15.2:3001/api/posts?is_apresentacao=true
```

Se funcionar, o backend está acessível. Se não funcionar, problema de rede/firewall.

---

## 🔧 Solução Definitiva

Se nada funcionar, tente criar o arquivo via PowerShell:

```powershell
cd frontend

# Remover arquivo antigo se existir
if (Test-Path .env.local) { Remove-Item .env.local }

# Criar novo arquivo
@"
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
"@ | Out-File -FilePath .env.local -Encoding utf8

# Verificar conteúdo
Get-Content .env.local
```

Depois:
1. Delete `.next`
2. Reinicie o servidor

---

## 📊 Checklist de Verificação

- [ ] Arquivo `.env.local` existe em `frontend/`
- [ ] Arquivo não tem duplicatas
- [ ] IP correto (192.168.15.2)
- [ ] Pasta `.next` foi deletada
- [ ] Servidor foi reiniciado completamente
- [ ] Console mostra IP correto (não localhost)
- [ ] Backend acessível via IP (teste direto no navegador mobile)

---

## 🆘 Se Ainda Não Funcionar

1. **Verifique o IP do computador novamente:**
   ```cmd
   ipconfig | findstr IPv4
   ```

2. **Atualize o `.env.local` com o IP correto**

3. **Reinicie TUDO:**
   - Backend
   - Frontend
   - Navegador mobile (limpe cache)

4. **Verifique firewall** - portas 3000 e 3001 devem estar liberadas

