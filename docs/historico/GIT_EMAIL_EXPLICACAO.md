# E-mail do Git x E-mail do GitHub

> Alinhar os dois endereços evita que os commits fiquem “desconhecidos” no GitHub.

## Precisa ser o mesmo?
- **Não é obrigatório**, mas **fortemente recomendado**.
- Quando o e-mail do Git coincide com o do GitHub:
  - ✅ Commits aparecem no perfil automaticamente.
  - ✅ Gráfico de contribuições contabiliza corretamente.
  - ✅ Histórico fica centralizado.

## Opções
| Opção | Configuração | Resultado |
|-------|--------------|-----------|
| Email público | `git config --global user.email "trova2012@gmail.com"` | Commits visíveis com e-mail real. |
| Email privado GitHub | `git config --global user.email "usuario@users.noreply.github.com"` | Commits visíveis mantendo privacidade. |
| Email diferente | Outro endereço qualquer | Commits não aparecem até adicionar o e-mail manualmente no GitHub. |

### Como ver o email cadastrado no GitHub
1. https://github.com/settings/emails
2. Copiar o e-mail público ou o formato `usuario@users.noreply.github.com`.

### Adicionar novo e-mail ao GitHub
1. `Settings > Emails > Add email address`
2. Confirmar via link/código recebido por e-mail.

## Recomendação para o projeto
```bash
git config --global user.name "Alexandro Trova"
git config --global user.email "trova2012@gmail.com"
```
Ou, se utilizar e-mail privado:
```bash
git config --global user.email "seu_usuario@users.noreply.github.com"
```

## Ajustes posteriores
```bash
git config --global user.name "Novo Nome"
git config --global user.email "novo_email@exemplo.com"
```

**Última atualização:** 06/11/2025
