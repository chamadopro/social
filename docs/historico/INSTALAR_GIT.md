# Instalação do Git (Windows)

## 1. Baixar e instalar
1. Acesse https://git-scm.com/download/win e faça o download da versão mais recente.
2. Execute o instalador e marque as opções recomendadas:
   - "Git from the command line and also from 3rd-party software" (adiciona ao PATH).
   - "Checkout Windows-style, commit Unix-style line endings".
   - "Use MinTTY" (padrão do instalador) ou PowerShell, conforme preferência.
3. Conclua a instalação.

## 2. Verificar instalação
Feche e reabra o terminal, depois execute:
```powershell
git --version
```
Se o comando não for reconhecido, reinicie o computador ou execute o instalador novamente garantindo que a opção de adicionar ao PATH esteja marcada.

## 3. Opções alternativas
- **Winget (Windows 10/11)**: `winget install --id Git.Git -e -h`
- **Chocolatey**: `choco install git`

## 4. Após instalar
1. Configurar identificação:
   ```powershell
   git config --global user.name "Alexandro Trova"
   git config --global user.email "trova.assessoria@gmail.com"
   ```
2. Reiniciar o terminal e seguir com o fluxo de commits descrito em `docs/historico/PRIMEIRO_COMMIT.md`.

## 5. Solução de problemas
| Sintoma | Solução |
|---------|---------|
| `git` não é reconhecido | Verificar PATH: `C:\Program Files\Git\cmd` deve constar nas variáveis de ambiente. |
| Instalação falhou | Reinstalar com privilégios de administrador. |
| Git funciona apenas no Git Bash | Atualizar PATH manualmente ou usar Git Bash por enquanto. |
