# 🔍 Debug: Variáveis de Ambiente

## Problema: Next.js não está carregando .env.local

Se você criou o arquivo `.env.local` mas o erro persiste, siga estes passos:

---

## ✅ Solução Passo a Passo

### 1. Verificar conteúdo do arquivo `.env.local`

O arquivo deve estar em `frontend/.env.local` e ter EXATAMENTE este formato:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

**⚠️ IMPORTANTE:**
- Sem espaços antes ou depois do `=`
- Sem aspas
- Sem espaços no final das linhas
- Substitua `192.168.15.2` pelo IP do seu computador

### 2. Parar COMPLETAMENTE o servidor Next.js

No terminal onde o `npm run dev` está rodando:
1. Pressione `Ctrl+C`
2. Aguarde alguns segundos
3. Verifique se o processo terminou

### 3. Limpar cache do Next.js (Opcional mas recomendado)

```bash
cd frontend
rm -rf .next
```

Ou no Windows PowerShell:
```powershell
cd frontend
Remove-Item -Recurse -Force .next
```

### 4. Reiniciar o servidor

```bash
cd frontend
npm run dev
```

### 5. Verificar no console do navegador

Abra o console do navegador (F12) e procure por:
```
🔍 API Configuration: { NEXT_PUBLIC_API_URL: '...', ... }
🔧 ApiService initialized with baseURL: '...'
```

Se ainda mostrar `localhost`, o Next.js não carregou o arquivo.

---

## 🐛 Problemas Comuns

### Problema: Ainda mostra "localhost"

**Solução:**
1. Verifique se o arquivo está na pasta `frontend/` (não `backend/`)
2. Verifique se o nome é exatamente `.env.local` (com ponto no início)
3. Verifique se não há espaços ou caracteres especiais
4. Tente deletar a pasta `.next` e reiniciar

### Problema: Arquivo não existe

**Solução:**
Crie manualmente:
1. Abra o Windows Explorer
2. Navegue até `frontend/`
3. Crie um novo arquivo chamado `.env.local` (com o ponto!)
4. Cole o conteúdo:
```
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

### Problema: Windows não deixa criar arquivo começando com ponto

**Solução:**
1. Abra o PowerShell na pasta `frontend/`
2. Execute:
```powershell
New-Item -ItemType File -Name ".env.local" -Force
Set-Content -Path ".env.local" -Value "NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api`nNEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001"
```

---

## ✅ Verificação Final

Após reiniciar, verifique no console do navegador:

✅ **Deve mostrar:**
```
🔍 API Configuration: {
  NEXT_PUBLIC_API_URL: 'http://192.168.15.2:3001/api',
  ...
}
```

❌ **Se ainda mostrar:**
```
NEXT_PUBLIC_API_URL: undefined
```
Ou
```
API_BASE_URL: 'http://localhost:3001/api'
```

Então o arquivo não foi carregado. Siga os passos acima novamente.

---

## 📝 Nota

O Next.js só carrega variáveis de ambiente que começam com `NEXT_PUBLIC_` no cliente.

Após modificar `.env.local`, você **DEVE** reiniciar o servidor Next.js completamente.

