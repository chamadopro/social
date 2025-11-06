# Guia de Configuração do Git para ChamadoPro

## 📋 Situação Atual

O Git não está configurado no PATH do sistema, mas você pode configurá-lo para usar um repositório diferente do que está cadastrado.

## ✅ Não há problema em mudar o repositório remoto!

Você pode:
- ✅ Mudar o repositório remoto sem perder código
- ✅ Manter todo o histórico local
- ✅ Configurar um novo repositório remoto

---

## 🔧 Passo a Passo

### 1. Verificar se há repositório Git inicializado

Abra o terminal na pasta do projeto e execute:

```bash
# Verificar se já existe repositório
ls -la .git
# ou no Windows PowerShell:
Test-Path .git
```

### 2. Se NÃO existe repositório Git

#### Opção A: Inicializar novo repositório
```bash
git init
git branch -M main
```

#### Opção B: Clonar repositório existente
```bash
git clone <URL_DO_SEU_REPOSITORIO> .
```

### 3. Se JÁ existe repositório Git

#### Verificar repositório remoto atual
```bash
git remote -v
```

#### Remover repositório remoto antigo (se necessário)
```bash
git remote remove origin
```

#### Adicionar novo repositório remoto
```bash
git remote add origin <URL_DO_SEU_NOVO_REPOSITORIO>
```

**Exemplos de URLs:**
- GitHub: `https://github.com/usuario/chamadopro.git`
- GitLab: `https://gitlab.com/usuario/chamadopro.git`
- Bitbucket: `https://bitbucket.org/usuario/chamadopro.git`
- SSH: `git@github.com:usuario/chamadopro.git`

### 4. Verificar configuração
```bash
git remote -v
```

Deve mostrar:
```
origin  <URL_DO_SEU_NOVO_REPOSITORIO> (fetch)
origin  <URL_DO_SEU_NOVO_REPOSITORIO> (push)
```

---

## 📝 Preparar para o Primeiro Commit

### 1. Criar/Verificar .gitignore

Certifique-se de ter um `.gitignore` adequado. Exemplo básico:

```gitignore
# Dependencies
node_modules/
package-lock.json

# Environment variables
.env
.env.local
.env*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
logs/
*.log
npm-debug.log*

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Uploads (se não quiser versionar)
uploads/
backend/uploads/

# Prisma
backend/prisma/migrations/
```

### 2. Adicionar arquivos ao staging
```bash
# Ver o que será commitado
git status

# Adicionar todos os arquivos (exceto os do .gitignore)
git add .

# Ou adicionar arquivos específicos
git add frontend/
git add backend/
git add *.md
```

### 3. Fazer o primeiro commit
```bash
git commit -m "feat: Implementação inicial do painel administrativo

- Sistema de login admin
- Dashboard com estatísticas
- Gerenciamento de usuários, posts, financeiro e disputas
- Relatórios avançados e auditoria
- WebSocket para notificações em tempo real
- Exportação de dados (CSV/JSON)
- Documentação completa"
```

### 4. Enviar para o repositório remoto
```bash
# Primeira vez (criar branch main no remoto)
git push -u origin main

# Ou se a branch for 'master'
git push -u origin master
```

---

## 🔐 Configurar Autenticação

### GitHub/GitLab/Bitbucket (HTTPS)

Você precisará de um **Personal Access Token**:

1. **GitHub**: Settings → Developer settings → Personal access tokens → Generate new token
2. **GitLab**: User Settings → Access Tokens → Create personal access token
3. **Bitbucket**: Personal settings → App passwords → Create app password

Ao fazer push, use o token como senha:
```bash
git push origin main
# Username: seu_usuario
# Password: seu_token
```

### SSH (Recomendado)

1. **Gerar chave SSH** (se não tiver):
```bash
ssh-keygen -t ed25519 -C "seu_email@exemplo.com"
```

2. **Adicionar chave ao agente SSH**:
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

3. **Copiar chave pública**:
```bash
# Windows PowerShell
cat ~/.ssh/id_ed25519.pub | clip

# Linux/Mac
cat ~/.ssh/id_ed25519.pub
```

4. **Adicionar chave no GitHub/GitLab/Bitbucket**:
   - GitHub: Settings → SSH and GPG keys → New SSH key
   - GitLab: User Settings → SSH Keys → Add SSH Key
   - Bitbucket: Personal settings → SSH keys → Add key

5. **Usar URL SSH**:
```bash
git remote set-url origin git@github.com:usuario/chamadopro.git
```

---

## 📦 Estrutura Recomendada para o Commit

### Commits organizados por funcionalidade

```bash
# 1. Commit da documentação
git add DOCUMENTACAO_ADMIN_PAINEL.md
git add ARQUITETURA_CHAMADOPRO_ADMIN_*.md
git commit -m "docs: Documentação completa do painel administrativo"

# 2. Commit do backend
git add backend/src/controllers/AdminController.ts
git add backend/src/routes/admin.ts
git add backend/src/middleware/auth.ts
git commit -m "feat(backend): Implementação do sistema administrativo

- Controller admin com todas as funcionalidades
- Rotas protegidas com autenticação
- Logs de auditoria
- WebSocket para notificações"

# 3. Commit do frontend
git add frontend/src/app/admin/
git commit -m "feat(frontend): Interface do painel administrativo

- Layout responsivo com sidebar
- Páginas de gerenciamento (usuários, posts, financeiro, disputas)
- Dashboard com estatísticas
- Relatórios e auditoria
- Integração WebSocket"

# 4. Commit de configurações
git add frontend/next.config.ts
git add backend/src/server.ts
git commit -m "config: Configurações para admin e WebSocket"
```

---

## ⚠️ Importante: Arquivos Sensíveis

**NUNCA commite**:
- ❌ `.env` ou `.env.local`
- ❌ Senhas ou tokens
- ❌ Chaves de API
- ❌ Credenciais de banco de dados

**Use**:
- ✅ `.env.example` (com valores de exemplo)
- ✅ Variáveis de ambiente no servidor
- ✅ Secrets do GitHub/GitLab Actions

---

## 🚀 Comandos Úteis

### Ver histórico
```bash
git log --oneline
```

### Ver diferenças
```bash
git diff
```

### Desfazer mudanças não commitadas
```bash
git restore <arquivo>
# ou
git checkout -- <arquivo>
```

### Verificar status
```bash
git status
```

### Criar branch para nova feature
```bash
git checkout -b feature/nome-da-feature
```

### Voltar para main
```bash
git checkout main
```

---

## 📚 Convenções de Commit (Opcional)

Usar **Conventional Commits** facilita a organização:

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

Exemplo:
```bash
git commit -m "feat(admin): Adiciona exportação de relatórios em PDF"
git commit -m "fix(auth): Corrige redirecionamento após login admin"
git commit -m "docs: Atualiza documentação do painel administrativo"
```

---

## ✅ Checklist Antes do Primeiro Push

- [ ] Repositório remoto configurado
- [ ] `.gitignore` criado e configurado
- [ ] Arquivos sensíveis não estão no staging
- [ ] Primeiro commit feito
- [ ] Autenticação configurada (HTTPS token ou SSH)
- [ ] Testar push: `git push -u origin main`

---

## 🆘 Problemas Comuns

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin <NOVA_URL>
```

### Erro: "failed to push some refs"
```bash
# Se o repositório remoto já tem commits
git pull origin main --allow-unrelated-histories
git push origin main
```

### Erro: "authentication failed"
- Verificar token/credenciais
- Usar SSH em vez de HTTPS
- Verificar permissões do token

---

**Pronto para começar!** 🚀

Se precisar de ajuda com algum passo específico, me avise!

