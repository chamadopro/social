# ⚡ Solução Rápida: Erro "Failed to fetch" no Mobile

## 🔴 Problema

Ao acessar pelo celular, aparece erro "Failed to fetch" ou "Erro ao carregar posts".

## ✅ Solução

O frontend está tentando usar `localhost`, que não funciona no celular. Você precisa criar o arquivo `.env.local` com o IP do seu computador.

---

## 🚀 Passos

### 1. Descobrir IP do computador

**Windows:**
```cmd
ipconfig
```
Procure por "Endereço IPv4" (exemplo: `192.168.15.2`)

### 2. Criar arquivo `.env.local`

Na pasta `frontend/`, crie um arquivo chamado `.env.local` com:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

**⚠️ IMPORTANTE:** Substitua `192.168.15.2` pelo IP do SEU computador!

### 3. Reiniciar o Frontend

```bash
cd frontend
# Parar o servidor (Ctrl+C)
npm run dev
```

### 4. Recarregar no celular

Recarregue a página no navegador do celular.

---

## ✅ Pronto!

Agora deve funcionar. Se ainda der erro:

1. **Verificar backend:** Backend está rodando na porta 3001?
2. **Verificar firewall:** Portas 3000 e 3001 estão liberadas?
3. **Verificar rede:** Celular e computador estão na mesma Wi-Fi?
4. **Verificar IP:** IP do computador mudou? Execute `ipconfig` novamente.

---

## 📝 Exemplo Completo

Se seu IP for `192.168.15.2`, o arquivo `frontend/.env.local` deve ter:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

E acesse no celular: `http://192.168.15.2:3000`

