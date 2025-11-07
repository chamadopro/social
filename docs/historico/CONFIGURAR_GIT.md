# Configurar Identidade do Git

Antes de qualquer commit, configure o nome e e-mail. Essa informação aparece nos históricos do GitHub.

## 1. Configuração global
```bash
git config --global user.name "Alexandro Trova"
git config --global user.email "seu_email@exemplo.com"
```
> Use o **mesmo e-mail** cadastrado na conta GitHub para vincular os commits ao perfil.

Verificar:
```bash
git config --global user.name
git config --global user.email
```

## 2. E-mails aceitos
- **Email público** (principal) do GitHub.
- **Email privado** (`usuario@users.noreply.github.com`) se a privacidade estiver ativa.
- Email corporativo (`@chamadopro.com`) – adicionar também em https://github.com/settings/emails.

## 3. Configuração apenas local (opcional)
```bash
git config user.name "Nome Projeto"
git config user.email "email-projeto@empresa.com"
```
Sem `--global`, vale apenas para o repositório atual.

## 4. Fluxo completo (recap)
```bash
# 1. Identidade
git config --global user.name "Alexandro Trova"
git config --global user.email "trova2012@gmail.com"

# 2. Inicialização (se necessário)
git init
git branch -M main

# 3. Adicionar + commit
git add .
git commit -m "feat: Implementação inicial do sistema ChamadoPro ..."

# 4. Remoto + push
git remote add origin https://github.com/chamadopro/social.git
git push -u origin main
```

## 5. Problemas comuns
| Mensagem | Solução |
|----------|---------|
| `Author identity unknown` | Configurar nome e e-mail (`git config --global ...`). |
| `unable to auto-detect email address` | Definir `git config --global user.email ...`. |
| Precisa alterar depois? | `git config --global user.name "Novo Nome"`. |

**Dica**: confirme no GitHub (`https://github.com/settings/emails`) que o e-mail está verificado.
