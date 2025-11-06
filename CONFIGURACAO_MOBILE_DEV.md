# ⚡ Configuração Rápida para Teste no Celular

## ✅ Já está configurado!

O backend já foi atualizado para aceitar conexões da rede local (IPs 192.168.x.x, 10.x.x.x, 172.16-31.x.x).

---

## 🚀 Passos para Testar

### 1. Descobrir IP do seu computador

**Seu IP atual:** `192.168.15.2` (já identificado)

Se mudar, execute:
```cmd
ipconfig
```

### 2. Configurar Frontend

Criar arquivo `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

**⚠️ IMPORTANTE:** Substitua `192.168.15.2` pelo IP do seu computador!

### 3. Reiniciar Frontend

```bash
cd frontend
npm run dev
```

### 4. Acessar no Celular

1. **Certifique-se que celular está na mesma rede Wi-Fi**
2. **Acesse no navegador:**
   ```
   http://192.168.15.2:3000
   ```

---

## 🔧 Se Der Erro

### Erro: CORS bloqueado
- ✅ Backend já aceita IPs da rede local
- Verificar se backend está rodando na porta 3001
- Verificar se frontend está rodando na porta 3000

### Erro: Não conecta
- Verificar Firewall do Windows (liberar portas 3000 e 3001)
- Verificar se celular está na mesma rede Wi-Fi
- Verificar IP do computador novamente

### Liberar Portas no Firewall

1. Windows → Firewall do Windows Defender
2. Configurações Avançadas
3. Regras de Entrada → Nova Regra
4. Porta → TCP → `3000, 3001`
5. Permitir conexão

---

## ✅ Pronto!

Agora você pode testar no celular acessando `http://192.168.15.2:3000`

**Lembre-se:** Se o IP mudar, atualize o `.env.local`!

