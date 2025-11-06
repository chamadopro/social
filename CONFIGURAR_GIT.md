# ⚙️ Configurar Identidade do Git

## 📝 O Git Precisa Saber Quem Você É

Antes de fazer commits, você precisa configurar seu nome e email no Git.

---

## ✅ Configuração Rápida

Execute estes comandos no Git Bash (ou PowerShell):

```bash
# Configurar seu nome
git config --global user.name "Alexandro Trova"

# Configurar seu email (use o email da sua conta GitHub)
git config --global user.email "seu_email@exemplo.com"
```

**⚠️ IMPORTANTE**: Use o **mesmo email** da sua conta GitHub para que os commits sejam associados corretamente!

---

## 🔍 Verificar Configuração

Depois de configurar, verifique:

```bash
git config --global user.name
git config --global user.email
```

---

## 📧 Qual Email Usar?

### Opção 1: Email Público do GitHub
- Use o email que você cadastrou no GitHub
- Pode ser seu email pessoal ou corporativo

### Opção 2: Email Privado do GitHub
Se você configurou um email privado no GitHub:
1. Acesse: https://github.com/settings/emails
2. Veja seu email privado (formato: `usuario@users.noreply.github.com`)
3. Use esse email na configuração

### Opção 3: Email da Conta ChamadoPro
Se você tem um email específico para o projeto:
- Use: `admin@chamadopro.com` ou similar

---

## 🎯 Exemplo Completo

```bash
# Configurar nome
git config --global user.name "Alexandro Trova"

# Configurar email (SUBSTITUA pelo seu email do GitHub)
git config --global user.email "trova2012@gmail.com"

# Verificar
git config --global user.name
git config --global user.email

# Agora pode fazer commit
git commit -m "feat: Implementação inicial do sistema ChamadoPro"
```

---

## 🔄 Configuração Apenas para Este Repositório

Se você quiser usar uma identidade diferente apenas para este projeto (sem `--global`):

```bash
git config user.name "Alexandro Trova"
git config user.email "seu_email@exemplo.com"
```

Isso configura apenas para o repositório atual, não globalmente.

---

## ✅ Depois de Configurar

Agora você pode fazer o commit normalmente:

```bash
git commit -m "feat: Implementação inicial do sistema ChamadoPro"
```

---

## 📚 Comandos Completos (Do Início)

Se você ainda não fez o commit, execute tudo na ordem:

```bash
# 1. Configurar identidade
git config --global user.name "Alexandro Trova"
git config --global user.email "seu_email@exemplo.com"

# 2. Verificar se está na pasta correta
pwd
# Deve mostrar: /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro

# 3. Inicializar (se ainda não fez)
git init

# 4. Renomear branch
git branch -M main

# 5. Adicionar arquivos
git add .

# 6. Fazer commit
git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"

# 7. Adicionar remote
git remote add origin https://github.com/chamadopro/social.git

# 8. Fazer push
git push -u origin main
```

---

## 🆘 Problemas Comuns

### "Author identity unknown"
**Solução**: Execute os comandos `git config --global user.name` e `git config --global user.email`

### "fatal: unable to auto-detect email address"
**Solução**: Configure o email manualmente com `git config --global user.email`

### Quer mudar depois?
```bash
# Mudar nome
git config --global user.name "Novo Nome"

# Mudar email
git config --global user.email "novo_email@exemplo.com"
```

---

**Dica**: Use o mesmo email da sua conta GitHub para que os commits apareçam corretamente no seu perfil! 🚀

