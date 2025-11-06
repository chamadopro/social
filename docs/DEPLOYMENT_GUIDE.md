# ChamadoPro - Guia de Deploy e Produção

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Configuração do Servidor](#configuração-do-servidor)
4. [Deploy do Backend](#deploy-do-backend)
5. [Deploy do Frontend](#deploy-do-frontend)
6. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
7. [Configuração de Produção](#configuração-de-produção)
8. [Monitoramento](#monitoramento)
9. [Backup e Recuperação](#backup-e-recuperação)
10. [Manutenção](#manutenção)

---

## 🎯 Visão Geral

Este guia detalha o processo completo de deploy do ChamadoPro em ambiente de produção, incluindo configurações de servidor, banco de dados, monitoramento e manutenção.

### Arquitetura de Produção
```
Internet → Load Balancer → Nginx → Backend (Node.js)
                              ↓
                         PostgreSQL
                              ↓
                         Redis (Cache)
                              ↓
                         AWS S3 (Storage)
```

---

## ⚙️ Pré-requisitos

### Servidor
- **OS**: Ubuntu 20.04+ ou CentOS 8+
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recomendado)
- **Storage**: 50GB+ SSD
- **Rede**: IP público com porta 80/443

### Software
- Node.js 18+
- PostgreSQL 13+
- Redis 6+
- Nginx
- PM2
- Git

### Serviços Externos
- AWS S3 (storage)
- Pagar.me (pagamentos)
- OpenAI API (moderação)
- SMTP (emails)

---

## 🖥️ Configuração do Servidor

### 1. Atualização do Sistema
```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y

# CentOS
sudo yum update -y
```

### 2. Instalação do Node.js
```bash
# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalação do PostgreSQL
```bash
# Ubuntu
sudo apt install postgresql postgresql-contrib -y

# CentOS
sudo yum install postgresql-server postgresql-contrib -y
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4. Instalação do Redis
```bash
# Ubuntu
sudo apt install redis-server -y

# CentOS
sudo yum install redis -y
sudo systemctl enable redis
sudo systemctl start redis
```

### 5. Instalação do Nginx
```bash
# Ubuntu
sudo apt install nginx -y

# CentOS
sudo yum install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Instalação do PM2
```bash
sudo npm install -g pm2
```

---

## 🔧 Deploy do Backend

### 1. Preparação do Ambiente
```bash
# Criar usuário para a aplicação
sudo adduser chamadopro
sudo usermod -aG sudo chamadopro
su - chamadopro

# Criar diretório da aplicação
mkdir -p /home/chamadopro/app
cd /home/chadopro/app
```

### 2. Clone do Repositório
```bash
git clone https://github.com/seu-usuario/chamadopro.git .
cd backend
```

### 3. Instalação de Dependências
```bash
npm ci --production
```

### 4. Configuração do Ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar variáveis de ambiente
nano .env
```

**Arquivo .env de produção:**
```env
# Banco de Dados
DATABASE_URL="postgresql://chamadopro:senha_segura@localhost:5432/chamadopro_prod"

# JWT
JWT_SECRET="secreto_super_seguro_producao_2024"
JWT_EXPIRES_IN="7d"

# Servidor
PORT=3001
NODE_ENV=production

# APIs Externas
PAGARME_API_KEY="ak_live_sua_chave_pagarme"
OPENAI_API_KEY="sk-sua_chave_openai"

# AWS S3
AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="chamadopro-uploads-prod"

# Email
EMAIL_SERVICE_HOST="smtp.gmail.com"
EMAIL_SERVICE_PORT="587"
EMAIL_SERVICE_USER="noreply@chamadopro.com"
EMAIL_SERVICE_PASS="senha_app_gmail"
EMAIL_FROM="noreply@chamadopro.com"

# Redis
REDIS_URL="redis://localhost:6379"
```

### 5. Configuração do Banco
```bash
# Executar migrações
npx prisma migrate deploy

# Gerar cliente Prisma
npx prisma generate

# Seed do banco (opcional)
npx prisma db seed
```

### 6. Build da Aplicação
```bash
npm run build
```

### 7. Configuração do PM2
```bash
# Criar arquivo de configuração
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'chamadopro-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/chamadopro/api-error.log',
    out_file: '/var/log/chamadopro/api-out.log',
    log_file: '/var/log/chamadopro/api-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

### 8. Iniciar Aplicação
```bash
# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar com o sistema
pm2 startup
```

---

## 🎨 Deploy do Frontend

### 1. Preparação
```bash
cd /home/chamadopro/app/frontend
```

### 2. Instalação de Dependências
```bash
npm ci --production
```

### 3. Configuração do Ambiente
```bash
# Copiar arquivo de exemplo
cp env.local.example .env.local

# Editar variáveis
nano .env.local
```

**Arquivo .env.local de produção:**
```env
NEXT_PUBLIC_API_URL="https://api.chamadopro.com/api"
NEXT_PUBLIC_SOCKET_URL="https://api.chamadopro.com"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyBvOkBwv9wJhKJhKJhKJhKJhKJhKJhKJhKJhK"
NEXT_PUBLIC_AWS_S3_BUCKET="chamadopro-uploads-prod"
NEXT_PUBLIC_APP_NAME="ChamadoPro"
NEXT_PUBLIC_APP_VERSION="3.2.0"
NEXT_PUBLIC_APP_URL="https://chamadopro.com"
```

### 4. Build da Aplicação
```bash
npm run build
```

### 5. Configuração do PM2 para Frontend
```bash
# Adicionar ao ecosystem.config.js
nano ecosystem.config.js
```

**ecosystem.config.js atualizado:**
```javascript
module.exports = {
  apps: [
    {
      name: 'chamadopro-api',
      script: 'dist/server.js',
      cwd: '/home/chamadopro/app/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'chamadopro-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/chamadopro/app/frontend',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
```

### 6. Iniciar Frontend
```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 🗄️ Configuração do Banco de Dados

### 1. Configuração do PostgreSQL
```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER chamadopro WITH PASSWORD 'senha_segura';
CREATE DATABASE chamadopro_prod OWNER chamadopro;
GRANT ALL PRIVILEGES ON DATABASE chamadopro_prod TO chamadopro;
\q
```

### 2. Configuração de Segurança
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/13/main/postgresql.conf

# Configurações importantes:
# listen_addresses = 'localhost'
# port = 5432
# max_connections = 100
# shared_buffers = 256MB
# effective_cache_size = 1GB
```

### 3. Configuração de Backup
```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-chamadopro.sh
```

**Script de backup:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/chamadopro"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="chamadopro_prod"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U chamadopro $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup realizado: backup_$DATE.sql.gz"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-chamadopro.sh

# Agendar backup diário
sudo crontab -e
# Adicionar linha:
# 0 2 * * * /usr/local/bin/backup-chamadopro.sh
```

---

## ⚙️ Configuração de Produção

### 1. Configuração do Nginx
```bash
# Criar configuração do site
sudo nano /etc/nginx/sites-available/chamadopro
```

**Configuração do Nginx:**
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

# Upstream para API
upstream api_backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

# Upstream para Frontend
upstream frontend_backend {
    server 127.0.0.1:3000;
    keepalive 32;
}

# Servidor principal
server {
    listen 80;
    server_name chamadopro.com www.chamadopro.com;
    
    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name chamadopro.com www.chamadopro.com;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/chamadopro.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chamadopro.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Rate limiting para login
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://api_backend;
        # ... outros headers proxy
    }
    
    # Arquivos estáticos
    location /static/ {
        alias /home/chamadopro/app/frontend/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Logs
    access_log /var/log/nginx/chamadopro_access.log;
    error_log /var/log/nginx/chamadopro_error.log;
}
```

### 2. Ativar Site
```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/chamadopro /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 3. Configuração de SSL
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d chamadopro.com -d www.chamadopro.com

# Testar renovação automática
sudo certbot renew --dry-run
```

---

## 📊 Monitoramento

### 1. Configuração do PM2 Monitor
```bash
# Instalar PM2 Plus
pm2 install pm2-server-monit

# Configurar monitoramento
pm2 set pm2-server-monit:email your-email@example.com
pm2 set pm2-server-monit:webhook https://hooks.slack.com/your-webhook
```

### 2. Configuração de Logs
```bash
# Criar diretório de logs
sudo mkdir -p /var/log/chamadopro
sudo chown chamadopro:chamadopro /var/log/chamadopro

# Configurar rotação de logs
sudo nano /etc/logrotate.d/chamadopro
```

**Configuração do logrotate:**
```
/var/log/chamadopro/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 chamadopro chamadopro
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Monitoramento de Sistema
```bash
# Instalar htop para monitoramento
sudo apt install htop iotop nethogs -y

# Script de monitoramento
sudo nano /usr/local/bin/monitor-chamadopro.sh
```

**Script de monitoramento:**
```bash
#!/bin/bash
# Verificar status dos serviços
echo "=== Status dos Serviços ==="
pm2 status

echo -e "\n=== Uso de Memória ==="
free -h

echo -e "\n=== Uso de Disco ==="
df -h

echo -e "\n=== Uso de CPU ==="
top -bn1 | grep "Cpu(s)"

echo -e "\n=== Conexões de Rede ==="
netstat -tuln | grep -E ":(80|443|3000|3001|5432|6379)"

echo -e "\n=== Logs de Erro Recentes ==="
tail -n 10 /var/log/chamadopro/api-error.log
```

### 4. Alertas por Email
```bash
# Instalar mailutils
sudo apt install mailutils -y

# Configurar email
sudo nano /etc/postfix/main.cf
```

---

## 💾 Backup e Recuperação

### 1. Backup Automático
```bash
# Script de backup completo
sudo nano /usr/local/bin/backup-completo.sh
```

**Script de backup completo:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/chamadopro"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/chamadopro/app"

# Criar diretório
mkdir -p $BACKUP_DIR

# Backup do banco
pg_dump -h localhost -U chamadopro chamadopro_prod > $BACKUP_DIR/db_$DATE.sql
gzip $BACKUP_DIR/db_$DATE.sql

# Backup do código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz -C $APP_DIR .

# Backup das configurações
tar -czf $BACKUP_DIR/config_$DATE.tar.gz /etc/nginx/sites-available/chamadopro /etc/letsencrypt/

# Upload para S3 (opcional)
aws s3 cp $BACKUP_DIR/ s3://chamadopro-backups/ --recursive

# Limpar backups antigos
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completo realizado: $DATE"
```

### 2. Recuperação de Desastres
```bash
# Script de recuperação
sudo nano /usr/local/bin/restore-chamadopro.sh
```

**Script de recuperação:**
```bash
#!/bin/bash
BACKUP_DATE=$1
BACKUP_DIR="/var/backups/chamadopro"

if [ -z "$BACKUP_DATE" ]; then
    echo "Uso: $0 YYYYMMDD_HHMMSS"
    exit 1
fi

# Parar aplicações
pm2 stop all

# Restaurar banco
gunzip -c $BACKUP_DIR/db_$BACKUP_DATE.sql.gz | psql -h localhost -U chamadopro chamadopro_prod

# Restaurar código
tar -xzf $BACKUP_DIR/code_$BACKUP_DATE.tar.gz -C /home/chamadopro/app/

# Restaurar configurações
tar -xzf $BACKUP_DIR/config_$BACKUP_DATE.tar.gz -C /

# Reiniciar serviços
pm2 start all
pm2 save

echo "Recuperação concluída: $BACKUP_DATE"
```

---

## 🔧 Manutenção

### 1. Atualizações de Segurança
```bash
# Script de atualização
sudo nano /usr/local/bin/update-chamadopro.sh
```

**Script de atualização:**
```bash
#!/bin/bash
echo "Iniciando atualização do ChamadoPro..."

# Backup antes da atualização
/usr/local/bin/backup-completo.sh

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar dependências
cd /home/chamadopro/app/backend
npm update
npm audit fix

cd /home/chamadopro/app/frontend
npm update
npm audit fix

# Executar migrações
cd /home/chamadopro/app/backend
npx prisma migrate deploy

# Rebuild aplicações
npm run build
cd ../frontend
npm run build

# Reiniciar serviços
pm2 restart all

echo "Atualização concluída!"
```

### 2. Limpeza de Logs
```bash
# Script de limpeza
sudo nano /usr/local/bin/cleanup-chamadopro.sh
```

**Script de limpeza:**
```bash
#!/bin/bash
echo "Iniciando limpeza do ChamadoPro..."

# Limpar logs antigos
find /var/log/chamadopro -name "*.log" -mtime +30 -delete

# Limpar backups antigos
find /var/backups/chamadopro -name "*.sql.gz" -mtime +30 -delete
find /var/backups/chamadopro -name "*.tar.gz" -mtime +30 -delete

# Limpar cache do PM2
pm2 flush

# Limpar cache do Nginx
sudo rm -rf /var/cache/nginx/*

echo "Limpeza concluída!"
```

### 3. Verificação de Saúde
```bash
# Script de verificação
sudo nano /usr/local/bin/health-check.sh
```

**Script de verificação:**
```bash
#!/bin/bash
echo "=== Verificação de Saúde do ChamadoPro ==="

# Verificar PM2
if pm2 status | grep -q "online"; then
    echo "✅ PM2: OK"
else
    echo "❌ PM2: ERRO"
fi

# Verificar PostgreSQL
if systemctl is-active --quiet postgresql; then
    echo "✅ PostgreSQL: OK"
else
    echo "❌ PostgreSQL: ERRO"
fi

# Verificar Redis
if systemctl is-active --quiet redis; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: ERRO"
fi

# Verificar Nginx
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx: OK"
else
    echo "❌ Nginx: ERRO"
fi

# Verificar conectividade da API
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ API: OK"
else
    echo "❌ API: ERRO"
fi

# Verificar conectividade do Frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: ERRO"
fi

echo "=== Verificação Concluída ==="
```

---

## 📞 Suporte e Contato

### Equipe de DevOps
- **Lead DevOps**: [Nome] - [email]
- **SRE**: [Nome] - [email]
- **DBA**: [Nome] - [email]

### Ferramentas de Monitoramento
- **PM2 Plus**: https://pm2.keymetrics.io
- **Grafana**: http://monitoring.chamadopro.com
- **Logs**: /var/log/chamadopro/

### Procedimentos de Emergência
1. **Site fora do ar**: Verificar PM2 e Nginx
2. **Banco indisponível**: Verificar PostgreSQL
3. **Alto uso de CPU**: Verificar processos e logs
4. **Falta de espaço**: Executar limpeza

---

*Guia de Deploy - Versão 3.2.0*  
*Última atualização: Janeiro 2025*

