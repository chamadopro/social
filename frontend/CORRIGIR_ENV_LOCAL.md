# 🔧 Corrigir Erro no .env.local

## ⚠️ Erro comum no .env.local

O Next.js pode reclamar do arquivo `.env.local` se:
- ✅ Tem linhas duplicadas
- ✅ Tem espaços antes ou depois do `=`
- ✅ Tem aspas desnecessárias
- ✅ Tem caracteres especiais
- ✅ Tem linhas vazias com espaços

---

## ✅ Formato Correto

O arquivo `frontend/.env.local` deve ter **EXATAMENTE** este conteúdo:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.9:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.9:3000
```

**⚠️ IMPORTANTE:**
- Sem espaços antes ou depois do `=`
- Sem aspas nas URLs
- Sem linhas vazias no meio
- Sem comentários com `#` no meio (apenas no final se necessário)
- Sem duplicatas

---

## 🔧 Como Corrigir (PowerShell)

### Opção 1: Criar arquivo novo (RECOMENDADO)

```powershell
cd frontend

# Deletar arquivo antigo
if (Test-Path .env.local) { Remove-Item .env.local }

# Criar novo arquivo corretamente
@"
NEXT_PUBLIC_API_URL=http://192.168.15.9:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.9:3000
"@ | Out-File -FilePath .env.local -Encoding utf8 -NoNewline

# Verificar conteúdo
Get-Content .env.local
```

### Opção 2: Editar manualmente

1. Abra o arquivo `frontend/.env.local` no editor
2. **Delete tudo**
3. Cole exatamente estas 3 linhas (sem espaços extras):

```
NEXT_PUBLIC_API_URL=http://192.168.15.9:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.9:3000
```

4. Salve o arquivo
5. Certifique-se de que não há linha em branco no final

---

## 🔍 Verificar se está correto

```powershell
cd frontend

# Ver conteúdo do arquivo
Get-Content .env.local

# Verificar se tem duplicatas
$content = Get-Content .env.local
$lines = $content | Where-Object { $_ -match '=' }
$unique = $lines | Select-Object -Unique
if ($lines.Count -ne $unique.Count) {
    Write-Host "⚠️ ERRO: Há linhas duplicadas!" -ForegroundColor Red
} else {
    Write-Host "✅ Sem duplicatas" -ForegroundColor Green
}
```

---

## 🚨 Problemas Comuns

### ❌ ERRADO:
```env
NEXT_PUBLIC_API_URL = "http://192.168.15.9:3001/api"  # Com espaços e aspas
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Duplicado
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
```

### ✅ CORRETO:
```env
NEXT_PUBLIC_API_URL=http://192.168.15.9:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.9:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.9:3000
```

---

## 🔄 Depois de corrigir

1. **Pare o servidor Next.js** (Ctrl+C)
2. **Delete a pasta `.next`:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   ```
3. **Reinicie:**
   ```powershell
   npm run dev
   ```

---

## 📝 Verificar no Console

Depois de reiniciar, abra o console do navegador e procure por:

```
🔍 API Configuration: {
  NEXT_PUBLIC_API_URL: 'http://192.168.15.9:3001/api',
  API_BASE_URL: 'http://192.168.15.9:3001/api',
  NEXT_PUBLIC_SOCKET_URL: 'http://192.168.15.9:3001'
}
```

Se aparecer `undefined` ou `localhost`, o arquivo não está sendo lido corretamente.

