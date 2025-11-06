# 🔧 Corrigir Erro de Autenticação do Banco de Dados

## ❌ Erro Atual

```
Authentication failed against database server at `localhost`, 
the provided database credentials for `usuario` are not valid.
```

## 🔍 Causa

O arquivo `backend/.env` está usando credenciais de **exemplo** (`usuario:senha`) que não são válidas.

## ✅ Solução

### Passo 1: Identificar suas credenciais do PostgreSQL

Você precisa saber:
- **Usuário:** Normalmente é `postgres` (padrão)
- **Senha:** A senha que você configurou ao instalar o PostgreSQL
- **Nome do banco:** `chamadopro` (já existe)

### Passo 2: Editar o arquivo `.env`

Abra o arquivo `backend/.env` e encontre a linha:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/chamadopro?schema=public"
```

**Substitua** `usuario` e `senha` pelas suas credenciais reais.

### Exemplo:

Se seu usuário é `postgres` e sua senha é `123456`:

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/chamadopro?schema=public"
```

### Passo 3: Verificar se o banco existe

Se o banco `chamadopro` não existir, crie-o:

```sql
-- Conecte no PostgreSQL (pgAdmin, psql, etc.)
CREATE DATABASE chamadopro;
```

### Passo 4: Reiniciar o backend

Após corrigir o `.env`, reinicie o servidor:

```powershell
# Pare o servidor (Ctrl+C)
# Depois reinicie
npm run dev
```

---

## 🔑 Como descobrir suas credenciais?

### Se você não lembra da senha:

1. **pgAdmin:** Abra o pgAdmin e veja as conexões salvas
2. **psql:** Tente conectar com `psql -U postgres`
3. **Reinstalação:** Se necessário, pode resetar a senha do PostgreSQL

### Credenciais padrão comuns:

- Usuário: `postgres`
- Senha: (a que você configurou na instalação)
- Porta: `5432` (padrão)
- Host: `localhost`

---

## ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env` com credenciais reais no Git
- O arquivo já deve estar no `.gitignore`
- Use credenciais seguras em produção

---

## 🆘 Se ainda não funcionar

1. Verifique se o PostgreSQL está rodando
2. Verifique se a porta 5432 está aberta
3. Teste a conexão manualmente:
   ```powershell
   psql -U postgres -h localhost -d chamadopro
   ```

