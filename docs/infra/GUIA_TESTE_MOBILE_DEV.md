# Guia de Testes no Celular Durante o Desenvolvimento

> Método recomendado: acessar a aplicação web pelo IP da rede local enquanto o backend e frontend rodam na máquina de desenvolvimento.

---

## 1. Descobrir o IP da máquina

**Windows**
```cmd
ipconfig
```

**macOS / Linux**
```bash
ifconfig | grep "inet "
# ou
ip addr show
```

Procure por `Endereço IPv4` (ex.: `192.168.15.2`).

---

## 2. Backend
- Já configurado para aceitar conexões da rede local.
- Porta padrão: **3001**.

---

## 3. Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```
Substitua `192.168.15.2` pelo IP identificado.

Reinicie o frontend:
```bash
cd frontend
npm run dev
```

---

## 4. Acesso pelo celular
1. Conecte o celular na **mesma rede Wi-Fi** do computador.
2. Abra o navegador e acesse:
   ```
   http://192.168.15.2:3000
   ```
3. Atualize o IP sempre que ele mudar.

---

## 5. Configurações avançadas

### Backend (`.env`)
```env
ALLOWED_IPS=http://192.168.15.2:3000,http://192.168.15.3:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
```

---

## 6. Troubleshooting

### CORS bloqueado
- Backend e frontend devem estar rodando (3001 e 3000).
- Celular e PC na **mesma rede**.
- IP correto no `.env.local`.

### Não conecta
- Verificar firewall (liberar portas 3000 e 3001).
- Verificar se IP mudou (`ipconfig`).
- Confirmar que não está em rede convidado/isolada.

### Socket.IO não conecta
- `NEXT_PUBLIC_SOCKET_URL` com IP correto.
- Backend em execução.
- Verificar console do navegador.

### Firewall (Windows)
1. Abrir “Firewall do Windows Defender”.
2. Configurações avançadas → Regras de Entrada → Nova Regra.
3. Tipo Porta → TCP → `3000, 3001` → Permitir conexão.

---

## 7. Vantagens vs Limitações

| Vantagem | Limitação |
|----------|-----------|
| Simples e rápido | Funciona apenas na mesma rede |
| Gratuito | IP pode mudar (DHCP) |
| Teste real em smartphone | Não funciona fora da rede local |

---

## 8. Alternativas
- **ngrok** – túnel público (`ngrok http 3000`).
- **Capacitor** – gerar APK (ver [`GUIA_CONVERSAO_APK_CAPACITOR.md`](./GUIA_CONVERSAO_APK_CAPACITOR.md)).
- **Emuladores** – Android Studio / Xcode.

---

## 9. Checklist rápido
- [ ] Backend ativo (`npm run dev` na pasta `backend`).
- [ ] Frontend ativo (`npm run dev` na pasta `frontend`).
- [ ] `.env.local` configurado com IP correto.
- [ ] Celular na mesma rede Wi-Fi.
- [ ] Firewall liberando portas 3000/3001.
- [ ] Acesso via `http://<IP>:3000` no celular.

---

**Última atualização:** 04/11/2025
