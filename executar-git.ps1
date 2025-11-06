# Script para executar o primeiro commit no Git
# Execute este script no PowerShell: .\executar-git.ps1

Write-Host "🚀 Iniciando configuração do Git..." -ForegroundColor Green
Write-Host ""

# 1. Inicializar Git
Write-Host "1️⃣ Inicializando repositório Git..." -ForegroundColor Yellow
git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro: Git não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "   Instale o Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# 2. Renomear branch para main
Write-Host ""
Write-Host "2️⃣ Renomeando branch para 'main'..." -ForegroundColor Yellow
git branch -M main

# 3. Adicionar arquivos
Write-Host ""
Write-Host "3️⃣ Adicionando arquivos ao staging..." -ForegroundColor Yellow
git add .
Write-Host "   ✅ Arquivos adicionados" -ForegroundColor Green

# 4. Verificar status
Write-Host ""
Write-Host "4️⃣ Verificando status..." -ForegroundColor Yellow
git status --short | Select-Object -First 20
Write-Host "   ..." -ForegroundColor Gray

# 5. Fazer commit
Write-Host ""
Write-Host "5️⃣ Fazendo primeiro commit..." -ForegroundColor Yellow
git commit -m "feat: Implementação inicial do sistema ChamadoPro

- Sistema completo de chamados e serviços
- Painel administrativo completo
- Autenticação e autorização
- Sistema de pagamentos e escrow
- WebSocket para notificações em tempo real
- Documentação completa"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Commit realizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Nenhum arquivo para commitar ou erro no commit" -ForegroundColor Yellow
}

# 6. Adicionar remote
Write-Host ""
Write-Host "6️⃣ Adicionando repositório remoto..." -ForegroundColor Yellow
git remote add origin https://github.com/chamadopro/social.git
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Remote adicionado: https://github.com/chamadopro/social.git" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Remote já existe ou erro ao adicionar" -ForegroundColor Yellow
    Write-Host "   Verificando remotes existentes..." -ForegroundColor Yellow
    git remote -v
}

# 7. Verificar configuração
Write-Host ""
Write-Host "7️⃣ Verificando configuração..." -ForegroundColor Yellow
Write-Host "   Remotes configurados:" -ForegroundColor Cyan
git remote -v

# 8. Instruções finais
Write-Host ""
Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Próximo passo: Fazer push para o GitHub" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute o comando:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Você precisará autenticar!" -ForegroundColor Yellow
Write-Host "   - Use um Personal Access Token (não sua senha)" -ForegroundColor Gray
Write-Host "   - Crie em: GitHub → Settings → Developer settings → Personal access tokens" -ForegroundColor Gray
Write-Host ""

