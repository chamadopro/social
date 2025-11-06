# ✅ Git Instalado - Próximos Passos

## ⚠️ Importante: Feche e Reabra o PowerShell!

Após instalar o Git, você **DEVE** fechar e reabrir o PowerShell para que o PATH seja atualizado.

---

## 🔄 Passo a Passo

### 1. Fechar o PowerShell Atual
- Feche completamente o PowerShell/Terminal atual
- Não apenas minimize, **feche mesmo**

### 2. Reabrir o PowerShell
- Abra um **NOVO** PowerShell
- Navegue até a pasta do projeto:
  ```powershell
  cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro
  ```

### 3. Verificar se o Git Funciona
```powershell
git --version
```

**Deve mostrar**: `git version 2.xx.x.windows.x`

Se ainda não funcionar, continue lendo abaixo.

---

## 🎯 Alternativa: Usar Git Bash

Se o PowerShell ainda não reconhecer o Git, use o **Git Bash**:

### 1. Abrir Git Bash
- Procure por "Git Bash" no menu Iniciar
- Clique para abrir

### 2. Navegar até a Pasta
```bash
cd /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro
```

### 3. Verificar Git
```bash
git --version
```

### 4. Executar Comandos
```bash
git init
git branch -M main
git add .
git commit -m "feat: Implementação inicial do sistema ChamadoPro"
git remote add origin https://github.com/chamadopro/social.git
git push -u origin main
```

---

## 🔍 Se Ainda Não Funcionar

### Verificar Instalação do Git

1. Verifique se o Git foi instalado em:
   ```
   C:\Program Files\Git\
   ```

2. Se estiver lá, adicione manualmente ao PATH:
   - Pressione `Win + R`
   - Digite: `sysdm.cpl`
   - Aba "Avançado" → "Variáveis de Ambiente"
   - Em "Variáveis do sistema", encontre "Path"
   - Clique em "Editar" → "Novo"
   - Adicione: `C:\Program Files\Git\cmd`
   - Clique "OK" em todas as janelas
   - **Reinicie o computador**

### Ou Reinstalar o Git

1. Desinstale o Git atual
2. Baixe novamente: https://git-scm.com/download/win
3. Durante a instalação, certifique-se de marcar:
   - ✅ "Add Git to PATH"
   - ✅ "Git from the command line and also from 3rd-party software"

---

## ✅ Quando o Git Estiver Funcionando

Execute os comandos na ordem:

```powershell
# 1. Verificar Git
git --version

# 2. Navegar até a pasta (se necessário)
cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro

# 3. Inicializar repositório
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

# 8. Verificar
git remote -v

# 9. Fazer push
git push -u origin main
```

---

## 🆘 Ainda com Problemas?

Use uma das alternativas:

1. **GitHub Desktop** (interface gráfica)
   - https://desktop.github.com/
   - Mais fácil para iniciantes

2. **VS Code com Git**
   - Abra o projeto no VS Code
   - Use a interface gráfica do Git integrada

3. **Git Bash** (já mencionado acima)
   - Funciona imediatamente após instalação
   - Não depende do PATH do PowerShell

---

**Dica**: O Git Bash geralmente funciona imediatamente após a instalação, mesmo que o PowerShell ainda não reconheça! 🚀

