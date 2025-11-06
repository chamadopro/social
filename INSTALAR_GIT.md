# 🔧 Como Instalar o Git no Windows

## ❌ Problema: "git não é reconhecido como comando"

Isso significa que o Git não está instalado ou não está no PATH do sistema.

---

## ✅ Solução: Instalar o Git

### Opção 1: Instalar via Winget (Mais Rápido) ⚡

Se você tem o Windows 10/11 com winget instalado:

```powershell
winget install --id Git.Git -e --source winget
```

Depois de instalar, **feche e reabra o PowerShell** para carregar o PATH.

### Opção 2: Baixar e Instalar Manualmente 📥

1. **Acesse**: https://git-scm.com/download/win
2. **Baixe** o instalador (64-bit Git for Windows Setup)
3. **Execute** o instalador
4. **Durante a instalação**:
   - ✅ Mantenha as opções padrão
   - ✅ Marque "Add Git to PATH" (importante!)
   - ✅ Escolha "Git from the command line and also from 3rd-party software"
5. **Conclua** a instalação
6. **Feche e reabra** o PowerShell/Terminal

### Opção 3: Instalar via Chocolatey 🍫

Se você tem Chocolatey instalado:

```powershell
choco install git
```

---

## 🔍 Verificar se o Git foi Instalado

Depois de instalar e **reabrir o PowerShell**, execute:

```powershell
git --version
```

Deve mostrar algo como:
```
git version 2.42.0.windows.2
```

Se ainda não funcionar, continue lendo abaixo.

---

## 🔄 Atualizar o PATH Manualmente (Se Necessário)

Se o Git foi instalado mas ainda não funciona:

### 1. Encontrar onde o Git foi instalado

Normalmente está em:
```
C:\Program Files\Git\cmd
```

### 2. Adicionar ao PATH

1. Pressione `Win + R`
2. Digite: `sysdm.cpl` e pressione Enter
3. Vá na aba **"Avançado"**
4. Clique em **"Variáveis de Ambiente"**
5. Em **"Variáveis do sistema"**, encontre **"Path"**
6. Clique em **"Editar"**
7. Clique em **"Novo"**
8. Adicione: `C:\Program Files\Git\cmd`
9. Clique em **"OK"** em todas as janelas
10. **Feche e reabra** o PowerShell

---

## 🎯 Alternativas (Se Não Quiser Instalar Git)

### Opção A: Usar GitHub Desktop 🖥️

1. Baixe: https://desktop.github.com/
2. Instale e faça login
3. Use a interface gráfica para fazer commits e push

### Opção B: Usar Git Bash 🐚

Se o Git foi instalado, você pode usar o **Git Bash** em vez do PowerShell:

1. Procure por "Git Bash" no menu Iniciar
2. Abra o Git Bash
3. Navegue até a pasta do projeto:
   ```bash
   cd /c/Users/trova/Documents/Projetos_Alex/chamadopro_social/chamadopro
   ```
4. Execute os comandos Git normalmente

### Opção C: Usar VS Code com Extensão Git 📝

1. Abra o VS Code
2. Instale a extensão "Git" (já vem instalada por padrão)
3. Use a interface gráfica do VS Code para:
   - Inicializar repositório
   - Fazer commits
   - Fazer push

---

## ✅ Depois de Instalar o Git

Quando o Git estiver funcionando, execute os comandos na ordem:

```powershell
# 1. Navegar até a pasta do projeto (se necessário)
cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro

# 2. Verificar se o Git funciona
git --version

# 3. Inicializar repositório
git init

# 4. Renomear branch
git branch -M main

# 5. Adicionar arquivos
git add .

# 6. Fazer commit
git commit -m "feat: Implementação inicial do sistema ChamadoPro"

# 7. Adicionar remote
git remote add origin https://github.com/chamadopro/social.git

# 8. Fazer push
git push -u origin main
```

---

## 🆘 Problemas Comuns

### "git: comando não encontrado" após instalar

**Solução**: Feche e reabra o PowerShell/Terminal completamente.

### "git não é reconhecido" mesmo após instalar

**Solução**: 
1. Verifique se o Git está instalado em `C:\Program Files\Git\`
2. Adicione manualmente ao PATH (veja instruções acima)
3. Reinicie o computador (último recurso)

### Prefere interface gráfica?

Use **GitHub Desktop** ou **VS Code** com extensão Git.

---

## 📚 Recursos Adicionais

- **Documentação oficial**: https://git-scm.com/doc
- **Tutorial interativo**: https://learngitbranching.js.org/
- **GitHub Guides**: https://guides.github.com/

---

**Dica**: A forma mais rápida é usar `winget install Git.Git` se você tiver o Windows 10/11 atualizado! 🚀

