# 🔧 Criar Arquivo .env para o Backend

## ⚠️ IMPORTANTE

O backend usa `.env` (não `.env.local`).

O `.env.local` é específico do **Next.js/Frontend**.

---

## 📝 Como Criar

### Opção 1: Copiar do exemplo (RECOMENDADO)

```powershell
cd backend
Copy-Item env.example .env
```

Depois, **edite o arquivo `.env`** e configure:
- `DATABASE_URL` - URL do seu banco PostgreSQL
- `JWT_SECRET` - Chave secreta para JWT (gere uma aleatória)
- `BACKEND_URL` - IP do computador para teste mobile (ex: `http://192.168.15.9:3001`)

### Opção 2: Criar manualmente

Crie um arquivo `backend/.env` com pelo menos:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/chamadopro?schema=public
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001
BACKEND_URL=http://192.168.15.9:3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=sua_chave_secreta_aqui
```

---

## 🔑 Variáveis Essenciais

### Obrigatórias:
- ✅ `DATABASE_URL` - Conexão com PostgreSQL
- ✅ `JWT_SECRET` - Chave para tokens JWT

### Recomendadas para Mobile:
- ✅ `BACKEND_URL` - IP do computador (ex: `http://192.168.15.9:3001`)

### Opcionais (com defaults):
- `PORT` - Porta do servidor (default: 3001)
- `NODE_ENV` - Ambiente (default: development)
- `API_URL` - URL da API (default: http://localhost:3001)
- `FRONTEND_URL` - URL do frontend (default: http://localhost:8000)

---

## 🚨 Segurança

**NUNCA commite o arquivo `.env` no Git!**

O arquivo já deve estar no `.gitignore`.

---

## ✅ Verificar se Funcionou

Após criar o `.env`, reinicie o backend:

```powershell
cd backend
npm run dev
```

Se não der erro de conexão com banco, está funcionando! ✅

