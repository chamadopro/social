# Onde Executar os Comandos Git

## Estrutura do projeto
```
chamadopro/
├─ backend/
├─ frontend/
├─ docs/
└─ ...
```

## Diretório base
Execute os comandos Git **sempre na raiz do projeto**:
```powershell
cd C:\Users\trova\Documents\Projetos_Alex\chamadopro_social\chamadopro
```

## Motivo
- O repositório controla arquivos de `backend/`, `frontend/`, `docs/` e demais pastas ao mesmo tempo.
- Executar comandos fora da raiz pode gerar commits parciais ou múltiplos repositórios desnecessários.

## Verificações úteis
```powershell
pwd            # Confirmar caminho atual
git status     # Deve listar alterações relativas à raiz
```

## Quando usar subpastas
- `backend/` e `frontend/` possuem seus próprios scripts (`npm run dev`, `npx prisma migrate`, etc.), mas não possuem repositórios Git independentes.
- Use subpastas apenas para executar comandos específicos da stack (npm, prisma), nunca `git init` ou `git commit` isolados nelas.

## Dica
Se estiver usando VS Code ou Git Bash, abra o terminal integrado a partir da raiz (`code .` ou botão “Open in Integrated Terminal”).
