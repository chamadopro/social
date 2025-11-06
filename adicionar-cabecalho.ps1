# Script para adicionar cabeçalho de autoria nos arquivos de código
# Autor: Alexandro Trova
# Data: 04/11/2025

$extensoes = @('.ts', '.tsx', '.js', '.jsx')
$pastasExcluir = @('node_modules', '.next', '.git', 'dist', 'build', '_snapshot', 'migrations')

# Função para verificar se o arquivo já tem o cabeçalho
function Test-CabecalhoExiste {
    param([string]$conteudo)
    
    return $conteudo -match 'Autor Intelectual do sistema.*Alexandro Trova'
}

# Função para obter a data de criação do arquivo
function Get-DataCriacao {
    param([System.IO.FileInfo]$arquivo)
    
    return $arquivo.CreationTime.ToString('dd/MM/yyyy')
}

# Função para gerar o cabeçalho
function Get-Cabecalho {
    param([string]$data)
    
    $cabecalho = @"
/**
 * ============================================================================
 * SISTEMA CHAMADOPRO
 * ============================================================================
 * 
 * Autor Intelectual do sistema: Alexandro Trova
 * Propriedade do código: Alexandro Trova
 * 
 * Desenvolvido em colaboração com execução de partes do código 
 * como orientado pelo Autor.
 * 
 * Data de criação: $data
 * 
 * ============================================================================
 */

"@
    return $cabecalho
}

# Contador de arquivos processados
$totalProcessados = 0
$totalAdicionados = 0
$totalIgnorados = 0

Write-Host "`n=== ADICIONANDO CABEÇALHOS DE AUTORIA ===" -ForegroundColor Cyan
Write-Host "Procurando arquivos de código..." -ForegroundColor Yellow

# Buscar todos os arquivos de código (excluindo node_modules e outras pastas)
$arquivos = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $extensoes -contains $_.Extension -and 
    -not ($pastasExcluir | Where-Object { $_.FullName -like "*\$_*" })
} | Where-Object {
    # Excluir também arquivos dentro de dist e node_modules
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\.next\\' -and
    $_.FullName -notmatch '\\.git\\'
}

Write-Host "Encontrados $($arquivos.Count) arquivos para processar`n" -ForegroundColor Green

foreach ($arquivo in $arquivos) {
    try {
        $totalProcessados++
        $caminhoRelativo = $arquivo.FullName.Replace((Get-Location).Path + '\', '')
        
        # Ler conteúdo do arquivo
        $encoding = [System.Text.Encoding]::UTF8
        $conteudo = Get-Content -Path $arquivo.FullName -Raw -Encoding UTF8
        
        # Verificar se já tem cabeçalho
        if (Test-CabecalhoExiste -conteudo $conteudo) {
            Write-Host "[IGNORADO] $caminhoRelativo (já possui cabeçalho)" -ForegroundColor Gray
            $totalIgnorados++
            continue
        }
        
        # Obter data de criação
        $dataCriacao = Get-DataCriacao -arquivo $arquivo
        
        # Gerar cabeçalho
        $cabecalho = Get-Cabecalho -data $dataCriacao
        
        # Verificar se tem diretivas especiais no início (como 'use client', 'use server', etc.)
        $novoConteudo = $conteudo
        $diretivasEspeciais = @()
        
        # Verificar diretivas no início do arquivo
        if ($conteudo -match "^(?:'use (client|server|strict)';?\s*\n?)+") {
            $diretivas = $Matches[0]
            $diretivasEspeciais += $diretivas
            $novoConteudo = $conteudo -replace "^(?:'use (client|server|strict)';?\s*\n?)+", ""
        }
        
        # Montar conteúdo final
        $conteudoFinal = ""
        
        # Adicionar diretivas especiais primeiro (se houver)
        if ($diretivasEspeciais.Count -gt 0) {
            $conteudoFinal += $diretivasEspeciais -join "`n"
            $conteudoFinal += "`n`n"
        }
        
        # Adicionar cabeçalho
        $conteudoFinal += $cabecalho
        
        # Adicionar conteúdo original (sem as diretivas se foram removidas)
        $conteudoFinal += $novoConteudo.TrimStart()
        
        # Se não tinha diretivas, adicionar linha em branco após cabeçalho se necessário
        if ($diretivasEspeciais.Count -eq 0 -and -not $novoConteudo.TrimStart().StartsWith("`n")) {
            $conteudoFinal = $cabecalho + "`n" + $novoConteudo.TrimStart()
        }
        
        # Salvar arquivo
        [System.IO.File]::WriteAllText($arquivo.FullName, $conteudoFinal, $encoding)
        
        Write-Host "[OK] $caminhoRelativo (cabeçalho adicionado - criado em $dataCriacao)" -ForegroundColor Green
        $totalAdicionados++
        
    } catch {
        Write-Host "[ERRO] $($arquivo.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== RESUMO ===" -ForegroundColor Cyan
Write-Host "Total processado: $totalProcessados" -ForegroundColor White
Write-Host "Cabeçalhos adicionados: $totalAdicionados" -ForegroundColor Green
Write-Host "Arquivos ignorados (já possuem cabeçalho): $totalIgnorados" -ForegroundColor Gray
Write-Host "`nConcluído!`n" -ForegroundColor Green

