# 🏢 Configurar Git com Email da Empresa

## 📧 Email Correto da Empresa

**Email**: `trova.assessoria@gmail.com`  
**Empresa**: A.C Trova Acessoria LTDA

---

## ✅ Configuração do Git

Execute no Git Bash:

```bash
# Configurar nome
git config --global user.name "Alexandro Trova"

# Configurar email da empresa
git config --global user.email "trova.assessoria@gmail.com"
```

---

## 🔍 Verificar Configuração

Depois de configurar, verifique:

```bash
git config --global user.name
git config --global user.email
```

**Deve mostrar**:
```
Alexandro Trova
trova.assessoria@gmail.com
```

---

## 🔗 Adicionar Email no GitHub (Importante!)

Para que os commits apareçam no seu perfil GitHub:

### Passo a Passo:

1. **Acesse**: https://github.com/settings/emails
2. **Clique em**: "Add email address"
3. **Digite**: `trova.assessoria@gmail.com`
4. **Clique em**: "Add"
5. **Verifique o email**:
   - Verifique sua caixa de entrada (ou spam)
   - Você receberá um email do GitHub
   - Clique no link de verificação
   - Ou copie o código e cole no GitHub
6. **Confirme**: Após verificar, o email aparecerá na lista

Agora os commits com esse email aparecerão no seu perfil GitHub! ✅

---

## 📝 Fazer Commits

Depois de configurar, você pode fazer commits normalmente:

```bash
# Adicionar arquivos
git add .

# Fazer commit
git commit -m "feat: Implementação inicial do sistema ChamadoPro"

# Os commits aparecerão com:
# Author: Alexandro Trova <trova.assessoria@gmail.com>
```

---

## ✅ Sequência Completa de Comandos

Execute na ordem:

```bash
# 1. Configurar identidade
git config --global user.name "Alexandro Trova"
git config --global user.email "trova.assessoria@gmail.com"

# 2. Verificar
git config --global user.name
git config --global user.email

# 3. Navegar até a pasta (se necessário)
cd /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro

# 4. Inicializar (se ainda não fez)
git init

# 5. Renomear branch
git branch -M main

# 6. Adicionar arquivos
git add .

# 7. Fazer commit
git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"

# 8. Adicionar remote
git remote add origin https://github.com/chamadopro/social.git

# 9. Verificar
git remote -v

# 10. Fazer push
git push -u origin main
```

---

## 🏢 Opção: Usar Nome da Empresa

Se você quiser que os commits apareçam com o nome da empresa:

```bash
git config --global user.name "A.C Trova Acessoria LTDA"
git config --global user.email "trova.assessoria@gmail.com"
```

**Ou manter seu nome pessoal** (recomendado):

```bash
git config --global user.name "Alexandro Trova"
git config --global user.email "trova.assessoria@gmail.com"
```

Ambas funcionam! A escolha é sua.

---

## 🎯 Resumo

1. ✅ Configure: `git config --global user.email "trova.assessoria@gmail.com"`
2. ✅ Adicione o email no GitHub (https://github.com/settings/emails)
3. ✅ Faça commits normalmente
4. ✅ Os commits aparecerão com o email da empresa no GitHub

---

**Pronto!** Agora você pode fazer commits com o email da empresa! 🚀
