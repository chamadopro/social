# Comandos Git (Execução Manual)

Sequência mínima para publicar o projeto no GitHub.

1. **Inicializar repositório**
   ```bash
   git init
   git branch -M main
   ```
2. **Adicionar arquivos**
   ```bash
   git add .
   ```
3. **Commit inicial**
   ```bash
   git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"
   ```
4. **Configurar remoto**
   ```bash
   git remote add origin https://github.com/chamadopro/social.git
   git remote -v
   ```
5. **Enviar para o GitHub**
   ```bash
   git push -u origin main
   ```

---

## Autenticação
- Não use a senha do GitHub.
- Gere um Personal Access Token em: https://github.com/settings/tokens
- Permissão necessária: `repo`.
- Username = seu usuário GitHub / Password = token.

## Problemas comuns
- `remote origin already exists` → `git remote remove origin` e adicionar novamente.
- `authentication failed` → conferir token/permissões ou usar `gh auth login`.
- `failed to push some refs` → `git pull origin main --allow-unrelated-histories` → `git push`.

**Última atualização:** 06/11/2025
