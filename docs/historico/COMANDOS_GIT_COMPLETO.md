# Comandos Git – Fluxo Completo

> ⚠️ Execute os comandos na ordem indicada.

## 1️⃣ Inicializar repositório
```bash
git init
git branch -M main
```

## 2️⃣ Adicionar arquivos
```bash
git add .
```

## 3️⃣ Commit inicial
```bash
git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"
```

## 4️⃣ Configurar remoto
```bash
git remote add origin https://github.com/chamadopro/social.git
git remote -v
```

## 5️⃣ Enviar para o GitHub
```bash
git push -u origin main
```

---

## Diferença para o “repositório vazio” do GitHub
- ❌ **Não use** `echo "# repo" >> README.md` + `git add README.md`.
- ✅ **Use** `git add .` + commit completo conforme exemplos acima.

---

## Autenticação com Personal Access Token
1. Acesse https://github.com/settings/tokens
2. **Generate new token (classic)**
3. Nome sugerido: `ChamadoPro Local`
4. Marcar permissão `repo`
5. Gerar e copiar o token (mostrado apenas uma vez)
6. Ao executar `git push`, use:
   - Username: seu usuário GitHub
   - Password: cole o token

---

## Conferir antes do push
```bash
git status
```
Verifique se não há arquivos sensíveis (`.env`, `*.log`, etc.) no staging.

---

## Problemas comuns
| Erro | Solução |
|------|---------|
| `remote origin already exists` | `git remote remove origin` → adicionar novamente |
| `authentication failed` | Usar token/permissões corretas |
| `failed to push some refs` | `git pull origin main --allow-unrelated-histories` → novo push |
| `nothing to commit, working tree clean` | Verificar se `git add .` foi executado |

---

**Última atualização:** 06/11/2025
