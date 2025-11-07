# Guia de Configuração do Git

Este guia explica como preparar o repositório local, alterar o remoto e garantir que os primeiros commits sejam feitos corretamente.

## 1. Verificar se o diretório é um repositório Git
```bash
ls -la .git        # Linux/macOS
Test-Path .git     # PowerShell
```

- Se **não** for repositório:
  ```bash
  git init
  git branch -M main
  ```
- Se **já** for repositório:
  ```bash
  git remote -v    # conferir remoto atual
  git remote remove origin  # opcional
  git remote add origin https://github.com/chamadopro/social.git
  ```

## 2. `.gitignore`
Certifique-se de ignorar arquivos sensíveis:
```gitignore
node_modules/
.env
.env.local
logs/
.next/
dist/
uploads/
backend/prisma/migrations/
```

## 3. Primeiro commit
```bash
git add .

git commit -m "feat: Implementação inicial do painel administrativo

- Sistema de login admin
- Dashboard com estatísticas
- Gerenciamento de usuários, posts, financeiro e disputas
- Relatórios avançados e auditoria
- WebSocket para notificações em tempo real
- Exportação de dados (CSV/JSON)
- Documentação completa"
```

## 4. Push inicial
```bash
git push -u origin main
```
> Para autenticação via HTTPS, utilize Personal Access Token (`repo`).

## 5. Autenticação SSH (opcional)
```bash
ssh-keygen -t ed25519 -C "email@empresa.com"
ssh-add ~/.ssh/id_ed25519
# Copiar chave pública e cadastrar na conta GitHub/GitLab/Bitbucket
```

## 6. Convenções de commit
Sugestão de padrão (Conventional Commits):
- `feat:` nova feature
- `fix:` correção
- `docs:` documentação
- `chore:` tarefas auxiliares

Exemplo:
```bash
git commit -m "feat(admin): adiciona exportação de relatórios"
```

## 7. Checklist antes do push
- [ ] `.gitignore` atualizado
- [ ] E-mails configurados (`git config --global user.email ...`)
- [ ] `git status` sem arquivos sensíveis
- [ ] Remoto apontando para repositório correto
- [ ] Token/SSH configurado

**Última atualização:** 06/11/2025
