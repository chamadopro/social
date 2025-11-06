# 🔧 Corrigir arquivo .env.local

## ❌ Problema Encontrado

Seu arquivo `.env.local` tem **duas linhas** com `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api  ❌ REMOVER ESTA
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api  ✅ MANTER ESTA
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

O Next.js pode estar usando a primeira linha (localhost), por isso não funciona no celular!

---

## ✅ Solução

Abra o arquivo `frontend/.env.local` e deixe EXATAMENTE assim:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
```

**⚠️ IMPORTANTE:**
- Remova a linha `NEXT_PUBLIC_API_URL=http://localhost:3001/api`
- Mantenha apenas a linha com o IP `192.168.15.2`
- Sem espaços, sem aspas, sem linhas vazias desnecessárias

---

## 🔄 Após Corrigir

1. **Salve o arquivo**
2. **Pare o servidor Next.js** (Ctrl+C)
3. **Limpe o cache:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   ```
4. **Reinicie:**
   ```bash
   npm run dev
   ```
5. **Recarregue no celular**

---

## ✅ Verificação

No console do navegador (F12), deve aparecer:

```
🔍 API Configuration: {
  NEXT_PUBLIC_API_URL: 'http://192.168.15.2:3001/api',  ✅
  ...
}
```

Se ainda mostrar `localhost`, o arquivo não foi salvo corretamente ou o servidor não foi reiniciado.

