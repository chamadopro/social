# Guia do Primeiro Commit

## 1. Pré-requisitos
- Git instalado (`git --version`).
- Nome e email configurados: `git config --global user.name "Alexandro Trova"` e `git config --global user.email "trova.assessoria@gmail.com"` (ou o e-mail cadastrado no GitHub).
- Token do GitHub criado em https://github.com/settings/tokens com permissão `repo`.

## 2. Sequência de comandos
```bash
cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro

git init
git branch -M main

git add .

git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"

git remote add origin https://github.com/chamadopro/social.git
git remote -v

git push -u origin main
```
> Ao executar `git push`, use seu usuário GitHub e cole o token como senha.

## 3. Conferências úteis
```bash
git status          # Verificar o que será enviado
 git log --oneline   # Histórico resumido
```
Certifique-se de que arquivos sensíveis (`.env`, `uploads/`) estão no `.gitignore`.

## 4. Problemas comuns
| Mensagem | Ação |
|----------|------|
| `remote origin already exists` | `git remote remove origin` e adicionar novamente |
| `failed to push some refs` | `git pull origin main --allow-unrelated-histories` e repetir o push |
| `authentication failed` | Conferir token/permissões ou usar `gh auth login` |

## 5. Próximos passos
- Criar branches para novas features: `git checkout -b feature/nova-funcionalidade`.
- Realizar commits frequentes com mensagens claras.
- Abrir pull requests sempre que concluir um conjunto de alterações.
