# Git instalado – próximos passos

Após instalar o Git:

1. **Feche e reabra** o terminal (PowerShell ou CMD) para atualizar o `PATH`.
2. Navegue até o projeto:
   ```powershell
   cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro
   ```
3. Confirme a instalação:
   ```powershell
   git --version
   ```

Se o comando não responder, use **Git Bash** (`git --version` deve funcionar). Caso continue sem resposta:
- Verifique se `C:\Program Files\Git\cmd` está no `PATH`.
- Adicione manualmente via `sysdm.cpl` → Variáveis de Ambiente → `Path` → `Novo` → `C:\Program Files\Git\cmd`.
- Reinicie o computador ou reinstale o Git marcando “Add Git to PATH”.

---

## Alternativa (Git Bash)
```bash
cd /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro
```
Siga os comandos usuais (init, add, commit, push).

---

## Fluxo básico (após confirmar o Git)
```powershell
git init
git branch -M main
git add .
git commit -m "feat: Implementação inicial do sistema ChamadoPro ..."
git remote add origin https://github.com/chamadopro/social.git
git push -u origin main
```

---

## Se ainda houver problemas
- Use **GitHub Desktop** ou a interface do VS Code.
- Execute os comandos pelo Git Bash (funciona mesmo se o PATH do PowerShell não estiver configurado).

**Última atualização:** 06/11/2025
