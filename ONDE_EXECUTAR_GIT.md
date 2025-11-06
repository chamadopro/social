# 📍 Onde Executar os Comandos Git

## ✅ Pasta Correta: **RAIZ DO PROJETO**

Execute os comandos Git na **pasta raiz** do projeto ChamadoPro:

```
C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro
```

## 📁 Estrutura do Projeto

A pasta raiz deve conter:

```
chamadopro/                    ← EXECUTE OS COMANDOS AQUI! ✅
├── backend/                   ← Subpasta
├── frontend/                  ← Subpasta
├── docs/                      ← Subpasta
├── Checklist/                 ← Subpasta
├── README.md                  ← Arquivo na raiz
├── .gitignore                 ← Arquivo na raiz
├── PRIMEIRO_COMMIT.md         ← Arquivo na raiz
└── ...                        ← Outros arquivos na raiz
```

## 🔍 Como Verificar se Está na Pasta Correta

### No PowerShell:
```powershell
# Ver o caminho atual
pwd

# Deve mostrar:
# C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro

# Verificar se existe README.md na pasta atual
Test-Path README.md
# Deve retornar: True

# Verificar se existe a pasta backend
Test-Path backend
# Deve retornar: True

# Verificar se existe a pasta frontend
Test-Path frontend
# Deve retornar: True
```

### No Git Bash:
```bash
# Ver o caminho atual
pwd

# Listar arquivos na raiz
ls -la | grep -E "README|backend|frontend"
```

## ❌ NÃO Execute Nestas Pastas:

```
❌ chamadopro/backend/          ← NÃO execute aqui!
❌ chamadopro/frontend/        ← NÃO execute aqui!
❌ chamadopro/docs/            ← NÃO execute aqui!
```

## ✅ Execute Na Pasta Raiz:

```
✅ chamadopro/                 ← EXECUTE AQUI!
```

## 🚀 Passos para Navegar até a Pasta Correta

### Se você estiver em outra pasta:

```powershell
# No PowerShell, navegue até a pasta raiz:
cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro

# Verificar se está correto
pwd
# Deve mostrar o caminho acima

# Verificar arquivos
ls
# Deve mostrar: backend, frontend, README.md, etc.
```

## 📝 Comandos Git na Pasta Correta

Depois de confirmar que está na pasta raiz, execute:

```bash
git init
git branch -M main
git add .
git commit -m "feat: Implementação inicial do sistema ChamadoPro"
git remote add origin https://github.com/chamadopro/social.git
git push -u origin main
```

## ⚠️ Importante

- ✅ Execute `git init` na **pasta raiz** do projeto
- ✅ O comando `git add .` adicionará todos os arquivos e subpastas
- ✅ O `.gitignore` na raiz protegerá arquivos sensíveis
- ❌ Não execute dentro de `backend/` ou `frontend/`

---

**Resumo**: Execute todos os comandos Git na pasta que contém `backend/`, `frontend/`, `README.md` e `.gitignore` na mesma pasta!

