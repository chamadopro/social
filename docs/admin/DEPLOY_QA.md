# 🚀 Guia de Deploy em Homologação (QA)

> Ambiente dedicado para testes de QA/homologação do ChamadoPro.

## 📋 Objetivo
Preparar, provisionar e manter um ambiente de homologação em nuvem. Este guia documenta todas as etapas necessárias para que QA e stakeholders possam testar a aplicação com segurança, isolada do ambiente de produção.

---

## 🧰 Visão Geral do Ambiente

| Componente | Porta | Observações |
|------------|-------|-------------|
| Frontend (Next.js) | 3000 | `npm run start` em modo produção |
| Backend (Node/Express) | 3001 | `npm run start`/PM2, API REST |
| Banco de Dados | 5432 | PostgreSQL dedicado ou gerenciado |
| Proxy Reverso | 80/443 | Nginx ou Caddy com SSL (Let’s Encrypt) |

> **Domínios sugeridos**: `qa.chamadopro.com.br` (frontend) e `api-qa.chamadopro.com.br` (backend).

---

## 1. ☁️ Provisionamento do Servidor

### 1.1 Requisitos mínimos
- 2 vCPU
- 4–8 GB RAM
- 40 GB SSD
- Ubuntu 22.04 LTS (recomendado)
- Acesso SSH com chave pública

### 1.2 Passos iniciais
```bash
sudo adduser chamadopro
sudo usermod -aG sudo chamadopro
sudo su - chamadopro

sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential curl git nginx ufw
```

---

## 2. 🛠️ Configuração do Backend

```bash
cd ~
git clone https://github.com/chamadopro/social.git
cd social/backend
```

### `.env`
```env
NODE_ENV=production
PORT=3001
DATABASE_URL="postgresql://usuario:senha@host:5432/chamadopro_qa"
JWT_SECRET="segredo_seguro"
JWT_EXPIRES_IN="7d"
FRONTEND_URL=https://qa.chamadopro.com.br
BACKEND_URL=https://api-qa.chamadopro.com.br
# Integrações sociais (opcional em QA)
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
# Serviços externos (opcional)
EMAIL_SERVICE_HOST=
EMAIL_SERVICE_USER=
EMAIL_SERVICE_PASS=
AWS_S3_BUCKET=
```

### Build e Prisma
```bash
npm ci
npm run build
npx prisma migrate deploy
npx prisma db seed   # opcional (cria admin padrão)
```

### Execução (PM2 recomendado)
```bash
sudo npm install -g pm2
pm2 start dist/server.js --name chamadopro-backend
pm2 save
pm2 startup systemd
```

Logs:
```bash
pm2 logs chamadopro-backend
pm2 status
```

---

## 3. 🌐 Configuração do Frontend

```bash
cd ~/social/frontend
cp env.local.example .env.local
```

`.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api-qa.chamadopro.com.br/api
NEXT_PUBLIC_SOCKET_URL=https://api-qa.chamadopro.com.br
```

Build e start:
```bash
npm ci
npm run build
npm run start -- -p 3000
```

PM2 opcional:
```bash
pm2 start npm --name chamadopro-frontend -- run start -- -p 3000
pm2 save
```

---

## 4. 🔐 Proxy Reverso + SSL (Nginx)

Configuração base (`/etc/nginx/sites-available/chamadopro-qa`):
```nginx
server {
    server_name qa.chamadopro.com.br;
    location / {
        proxy_pass http://127.0.0.1:3000;
        include proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

server {
    server_name api-qa.chamadopro.com.br;
    location / {
        proxy_pass http://127.0.0.1:3001;
        include proxy_params;
    }
}
```

Ativar site + SSL:
```bash
sudo ln -s /etc/nginx/sites-available/chamadopro-qa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo snap install core && sudo snap refresh core
sudo snap install --classic certbot
sudo certbot --nginx -d qa.chamadopro.com.br -d api-qa.chamadopro.com.br
```

Firewall (UFW):
```bash
sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw enable
```

---

## 5. 🧪 Preparar Ambiente de QA

1. Contas seed: `admin@chamadopro.com / 123456789` (alterar se necessário).
2. Criar usuários QA (cliente/prestador) ou rodar seeds específicos.
3. Preencher dados de teste (posts, orçamentos, contratos) conforme cenários de QA.
4. Checklist inicial:
   - Acesso ao frontend via domínio QA.
   - Login/Logout admin e usuário final.
   - Dashboard exibe métricas.
   - APIs principais respondem (`/health`, `/api/admin/dashboard`, `/api/posts`).
   - Upload funcional (se aplicável).
   - Logs acessíveis (`backend/logs/`).

---

## 6. 🔁 Fluxo de Deploy/Atualização

```bash
# Backend
cd ~/social/backend
git pull
npm ci
npm run build
npx prisma migrate deploy
pm2 restart chamadopro-backend

# Frontend
cd ~/social/frontend
git pull
npm ci
npm run build
pm2 restart chamadopro-frontend
```

Finalize com smoke tests (login, páginas críticas). Para automatizar, considere scripts shell ou GitHub Actions manuais.

---

## 7. 📈 Monitoramento e Logs

| Recurso | Comando |
|---------|---------|
| PM2 status | `pm2 status` |
| Backend logs | `pm2 logs chamadopro-backend` |
| Frontend logs | `pm2 logs chamadopro-frontend` |
| Nginx | `/var/log/nginx/access.log` / `error.log` |
| Saúde API | `curl https://api-qa.chamadopro.com.br/health` |

### Alertas
- Configurar logrotate para PM2/Nginx.
- Opcional: integrar com New Relic, Datadog ou similar.

---

## 8. 🔐 Segurança

- Atualizar sistema regularmente (`sudo apt update && sudo apt upgrade`).
- Restringir SSH (whitelist de IPs, fail2ban).
- Manter `.env` fora do versionamento e com permissões restritas.
- Usar credenciais distintas para QA vs produção.
- Revisar permissões em AWS S3, SMTP, etc.

---

## 9. 📦 Backups e Rollback

```bash
pg_dump "postgresql://usuario:senha@host:5432/chamadopro_qa" > chamadopro_qa_$(date +%Y%m%d).sql
```

- Criar snapshots/tags (`vX.Y.Z-qa`) para rollback rápido.
- Manter backups seguros e testados periodicamente.

---

## 10. ✅ Checklist Final Pré-QA

- [ ] Servidor provisionado e seguro
- [ ] Backend e frontend rodando com PM2
- [ ] Domínios e SSL configurados
- [ ] `.env` preenchidos com credenciais QA
- [ ] Seeds/dados de teste carregados
- [ ] Logs ativos e acessíveis
- [ ] Documentação atualizada (`PAINEL_ADMIN.md`, `DEPLOY_QA.md`)
- [ ] QA informado sobre URLs, credenciais e escopo de testes

---

## 📚 Referências Relacionadas
- [`PAINEL_ADMIN.md`](./PAINEL_ADMIN.md)
- [`ARQUITETURA_FASES.md`](./ARQUITETURA_FASES.md)
- [`BANCO_COMPARTILHADO.md`](./BANCO_COMPARTILHADO.md)
- [`../DEPLOYMENT_GUIDE.md`](../DEPLOYMENT_GUIDE.md)
- [`../historico/PRIMEIRO_COMMIT.md`](../historico/PRIMEIRO_COMMIT.md)

---

**Data:** 06/11/2025  
**Responsável:** Time ChamadoPro  
**Status:** ✅ Guia atualizado e pronto para uso
