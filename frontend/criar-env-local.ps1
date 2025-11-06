# Script para criar/recriar o arquivo .env.local corretamente

Write-Host "`n=== Criando arquivo .env.local ===" -ForegroundColor Cyan

# Verificar se arquivo existe
if (Test-Path ".env.local") {
    Write-Host "Arquivo .env.local existe. Será substituído." -ForegroundColor Yellow
    Remove-Item ".env.local" -Force
}

# Criar novo arquivo
$content = @"
NEXT_PUBLIC_API_URL=http://192.168.15.9:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.9:3000
"@

$content | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "Arquivo .env.local criado com sucesso!`n" -ForegroundColor Green

# Verificar conteúdo
Write-Host "=== Conteúdo do arquivo ===" -ForegroundColor Cyan
Get-Content ".env.local"
Write-Host "`n=== FIM ===" -ForegroundColor Cyan

Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "1. Pare o servidor Next.js (Ctrl+C)" -ForegroundColor White
Write-Host "2. Delete a pasta .next: Remove-Item -Recurse -Force .next" -ForegroundColor White
Write-Host "3. Reinicie: npm run dev" -ForegroundColor White

