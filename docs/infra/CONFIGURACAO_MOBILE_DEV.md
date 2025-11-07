# ⚡ Configuração Rápida para Testes no Celular

O backend já está configurado para aceitar conexões da rede local (`192.168.x.x`, `10.x.x.x`, `172.16-31.x.x`). Basta apontar o frontend para o IP da máquina que executa o backend.

---

## 1. Descobrir o IP do computador

```bash
ipconfig
```

> Exemplo: `192.168.15.2`

---

## 2. Configurar `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://192.168.15.2:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.2:3001
```
Substitua `192.168.15.2` pelo IP atual do computador.

---

## 3. Reiniciar o frontend
```bash
cd frontend
npm run dev
```

---

## 4. Testar no celular
1. Certifique-se que o celular está na **mesma rede Wi-Fi** do computador.
2. Acesse pelo navegador:
   ```
   http://192.168.15.2:3000
   ```

---

## 5. Problemas comuns

### CORS bloqueado
- Backend precisa estar rodando na porta 3001.
- Frontend rodando na porta 3000.
- Variáveis `NEXT_PUBLIC_*` apontando para o IP correto.

### Não conecta
- Verificar se o IP mudou (`ipconfig`).
- Verificar se o firewall libera as portas 3000/3001.
- Celular e computador devem estar na mesma rede.

### Liberar portas no Firewall (Windows)
1. Abrir “Firewall do Windows Defender”.
2. Configurações avançadas → Regras de Entrada → Nova Regra.
3. Tipo “Porta” → TCP → `3000, 3001`.
4. Permitir conexão.

---

## ✅ Pronto
Acesse pelo celular `http://<IP_DO_PC>:3000`. Atualize o `.env.local` sempre que o IP mudar.
