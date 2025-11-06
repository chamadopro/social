# 🔧 Troubleshooting: Erro no Mobile

## Problema Atual
- ❌ Celular: "Não foi possível conectar ao servidor"
- ✅ PC: Funciona normalmente

---

## ✅ O que já foi implementado:

1. **Normalização de URLs** (`backend/src/utils/urlNormalizer.ts`)
   - Substitui `localhost` por IP automaticamente nas URLs das imagens
   - Detecta IP do cliente pelo header `Origin`

2. **Logs de debug** (`frontend/src/app/page.tsx` e `frontend/src/services/api.ts`)
   - Logs detalhados para identificar o problema

3. **Configuração CORS** (`backend/src/server.ts`)
   - Aceita IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x)

---

## 🔍 Verificações Necessárias (quando retornar):

### 1. Verificar se o Backend está rodando
```powershell
# Verificar se porta 3001 está aberta
Test-NetConnection -ComputerName localhost -Port 3001
```

### 2. Verificar arquivo `.env.local` do Frontend
**Localização:** `frontend/.env.local`

**Deve conter:**
```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
```

**⚠️ IMPORTANTE:**
- Sem duplicatas
- Sem espaços
- Sem aspas
- IP correto (verificar com `ipconfig`)

### 3. Verificar IP do computador
```powershell
ipconfig | findstr IPv4
```

**Atualizar `.env.local` se o IP mudou!**

### 4. Rebuild completo do Frontend
```powershell
cd frontend

# Parar servidor (Ctrl+C)

# Deletar cache
Remove-Item -Recurse -Force .next

# Reiniciar
npm run dev
```

### 5. Verificar arquivo `.env` do Backend
**Localização:** `backend/.env`

**Recomendado adicionar:**
```env
BACKEND_URL=http://192.168.15.2:3001
```

**Depois reiniciar o backend!**

### 6. Testar conexão direta no mobile
No navegador do celular, acesse:
```
http://192.168.15.2:3001/api/posts?is_apresentacao=true
```

**Se funcionar:** Backend está acessível ✅
**Se não funcionar:** Problema de rede/firewall ❌

### 7. Verificar Firewall do Windows
- Porta 3001 deve estar aberta
- Porta 3000 deve estar aberta

### 8. Verificar console do navegador mobile
No celular, abra o console (se possível via Chrome DevTools):
- Procurar por: `🔍 API Configuration`
- Verificar se mostra o IP correto ou `localhost`

---

## 🆘 Se ainda não funcionar:

### Diagnóstico Passo a Passo:

1. **Backend está rodando?**
   ```powershell
   # Testar no PC
   curl http://localhost:3001/api/posts?is_apresentacao=true
   ```

2. **Backend acessível pelo IP?**
   ```powershell
   # Testar no PC (substitua pelo seu IP)
   curl http://192.168.15.2:3001/api/posts?is_apresentacao=true
   ```

3. **Frontend está usando IP correto?**
   - Verificar console do navegador
   - Procurar logs: `🔍 API Configuration`

4. **Celular e PC na mesma rede?**
   - Verificar se ambos estão no mesmo Wi-Fi

5. **Firewall bloqueando?**
   - Windows Defender Firewall
   - Antivírus

---

## 📝 Checklist Rápido:

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] IP do computador verificado (`ipconfig`)
- [ ] `.env.local` do frontend configurado com IP correto
- [ ] `.env` do backend tem `BACKEND_URL` (opcional)
- [ ] Pasta `.next` deletada e frontend reiniciado
- [ ] Celular e PC na mesma rede Wi-Fi
- [ ] Firewall permitindo portas 3000 e 3001
- [ ] Teste direto no mobile: `http://IP:3001/api/posts?is_apresentacao=true`

---

## 🔄 Quando retornar:

1. Verificar IP atual: `ipconfig`
2. Atualizar `.env.local` do frontend se necessário
3. Deletar `.next` e reiniciar frontend
4. Testar no celular
5. Verificar console do navegador para logs de debug

---

## 📞 Informações para Debug:

Quando retornar, me envie:
1. IP atual do computador
2. Conteúdo do `frontend/.env.local`
3. Mensagens do console do navegador mobile (se possível)
4. Resultado do teste direto: `http://IP:3001/api/posts?is_apresentacao=true`

