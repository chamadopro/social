# Troubleshooting – Acesso pelo Mobile

Situação comum: PC acessa normalmente, mas o celular exibe “Não foi possível conectar ao servidor”.

## ✅ O que já está feito
- Normalização de URLs no backend (`backend/src/utils/urlNormalizer.ts`).
- Logs de debug no frontend (`app/page.tsx`, `services/api.ts`).
- CORS liberado para IPs da rede local em desenvolvimento.

---

## 🔍 Checklist de diagnóstico

1. **Backend rodando?**
   ```bash
   curl http://localhost:3001/api/posts?is_apresentacao=true
   ```

2. **Backend acessível pelo IP?**
   ```bash
   curl http://192.168.15.2:3001/api/posts?is_apresentacao=true
   ```

3. **IP correto?**
   ```bash
   ipconfig | findstr IPv4   # Windows
   ```

4. **`.env.local` (frontend)**
   ```env
   NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
   NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
   NEXT_PUBLIC_APP_URL=http://192.168.15.2:3000
   ```

5. **Rebuild frontend**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

6. **Celular e PC na mesma rede Wi-Fi.**

7. **Teste direto no celular**
   ```
   http://192.168.15.2:3001/api/posts?is_apresentacao=true
   ```

8. **Firewall**
   - Liberar portas TCP 3000 e 3001 no Windows Defender.

---

## 🧰 Comandos úteis
```powershell
# Testar porta 3001 no Windows
Test-NetConnection -ComputerName localhost -Port 3001
```

---

## Logs no navegador (mobile/desktop)
Procure por `🔍 API Configuration` ou `API Response` para confirmar que a aplicação está usando o IP e não `localhost`.

---

## Informações úteis ao relatar o problema
1. IP atual do computador (`ipconfig`).
2. Conteúdo de `frontend/.env.local` (apagar senhas antes de enviar).
3. Captura do console do navegador (mobile/devtools).
4. Resultado do teste direto `http://<IP>:3001/api/posts?is_apresentacao=true`.

---

## Checklist rápido antes do teste
- [ ] Backend ativo (porta 3001).
- [ ] Frontend ativo (porta 3000).
- [ ] `.env.local` atualizado com IP correto.
- [ ] `.next` removido e servidor reiniciado.
- [ ] Firewall permitindo 3000/3001.
- [ ] Celular e PC na mesma rede.
- [ ] Teste direto no celular retorna JSON.

---

**Referências**
- [`docs/infra/CONFIGURACAO_MOBILE_DEV.md`](./CONFIGURACAO_MOBILE_DEV.md)
- [`docs/infra/GUIA_TESTE_MOBILE_DEV.md`](./GUIA_TESTE_MOBILE_DEV.md)
