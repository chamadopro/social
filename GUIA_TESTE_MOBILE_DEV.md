# Guia: Testar App no Celular Durante Desenvolvimento

## 📱 Método Recomendado

**Sim, é uma boa forma de testar!** Acessar pelo IP da rede local é o método mais prático para testar em dispositivos móveis durante desenvolvimento.

---

## 🚀 Configuração Rápida

### Passo 1: Descobrir o IP do seu computador

**Windows:**
```cmd
ipconfig
```
Procure por "Endereço IPv4" (exemplo: `192.168.15.2`)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
ou
```bash
ip addr show
```

### Passo 2: Configurar o Backend

O backend já está configurado para aceitar conexões da rede local! ✅

**Porta do Backend:** `3001`

### Passo 3: Configurar o Frontend

**Opção A: Usar variável de ambiente (Recomendado)**

1. Criar arquivo `.env.local` na pasta `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```

2. Reiniciar o servidor Next.js:
```bash
cd frontend
npm run dev
```

**Opção B: Usar IP diretamente (Temporário)**

Se não quiser criar `.env.local`, você pode acessar diretamente:
```
http://192.168.15.2:3000
```

Mas as chamadas de API ainda usarão `localhost:3001`, então você precisa configurar o `.env.local`.

### Passo 4: Acessar pelo Celular

1. **Certifique-se de que o celular está na mesma rede Wi-Fi que o computador**

2. **Acesse no navegador do celular:**
```
http://192.168.15.2:3000
```

**Substitua `192.168.15.2` pelo IP do seu computador!**

---

## ⚙️ Configurações Avançadas

### Backend (.env)

Se quiser especificar IPs permitidos manualmente:

```env
# Permitir IPs específicos (opcional)
ALLOWED_IPS=http://192.168.15.2:3000,http://192.168.15.3:3000
```

### Frontend (.env.local)

```env
# API Backend
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001

# App URL (opcional)
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
```

---

## 🔧 Troubleshooting

### Erro: CORS bloqueado

**Solução:** O backend já está configurado para aceitar IPs da rede local (192.168.x.x, 10.x.x.x, 172.16-31.x.x) em desenvolvimento.

Se ainda tiver erro, verifique:
1. Backend está rodando na porta 3001
2. Frontend está rodando na porta 3000
3. Celular está na mesma rede Wi-Fi
4. Firewall do Windows não está bloqueando as portas

### Erro: Não consegue conectar

**Possíveis causas:**
1. **Firewall bloqueando:** Liberar portas 3000 e 3001 no firewall do Windows
2. **Rede diferente:** Celular e computador devem estar na mesma rede Wi-Fi
3. **IP mudou:** Verificar IP novamente com `ipconfig`

### Liberar Portas no Firewall (Windows)

1. Abrir "Firewall do Windows Defender"
2. "Configurações Avançadas"
3. "Regras de Entrada" → "Nova Regra"
4. Porta → TCP → Portas específicas: `3000, 3001`
5. Permitir conexão
6. Aplicar para todos os perfis

### Socket.IO não conecta

**Verificar:**
1. `NEXT_PUBLIC_SOCKET_URL` está configurado com o IP correto
2. Backend está rodando
3. Verificar console do navegador para erros

---

## 📊 Vantagens deste Método

✅ **Simples:** Não precisa de configuração complexa
✅ **Rápido:** Testa imediatamente no dispositivo real
✅ **Realista:** Testa em condições reais (tela pequena, touch, etc.)
✅ **Gratuito:** Não precisa de serviços externos

## ⚠️ Limitações

⚠️ **Mesma rede:** Celular e computador devem estar na mesma Wi-Fi
⚠️ **IP dinâmico:** Se o IP mudar, precisa atualizar `.env.local`
⚠️ **Não funciona fora de casa:** Apenas na rede local

---

## 🎯 Alternativas (Para referência)

### 1. ngrok (Túnel público)
```bash
npm install -g ngrok
ngrok http 3000
```
Acessa de qualquer lugar, mas requer conta grátis.

### 2. Capacitor (APK)
Gerar APK e instalar no celular (mais complexo, mas testa app real).

### 3. Emulador Android/iOS
Testa no computador, mas não é dispositivo real.

---

## 📝 Checklist

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] IP do computador identificado
- [ ] `.env.local` configurado com IP correto
- [ ] Celular na mesma rede Wi-Fi
- [ ] Firewall liberado (se necessário)
- [ ] Acessar `http://[IP]:3000` no celular

---

**Última atualização:** 04/11/2025

