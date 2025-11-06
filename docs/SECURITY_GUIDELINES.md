# ChamadoPro - Diretrizes de Segurança

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Segurança da Aplicação](#segurança-da-aplicação)
3. [Segurança do Banco de Dados](#segurança-do-banco-de-dados)
4. [Segurança da Infraestrutura](#segurança-da-infraestrutura)
5. [Segurança de Dados](#segurança-de-dados)
6. [Monitoramento de Segurança](#monitoramento-de-segurança)
7. [Resposta a Incidentes](#resposta-a-incidentes)
8. [Auditoria e Compliance](#auditoria-e-compliance)

---

## 🎯 Visão Geral

Este documento estabelece as diretrizes de segurança para o ChamadoPro, garantindo a proteção de dados sensíveis, prevenção de ataques e conformidade com regulamentações como LGPD.

### Princípios de Segurança
- **Confidencialidade**: Dados protegidos contra acesso não autorizado
- **Integridade**: Dados mantidos íntegros e precisos
- **Disponibilidade**: Serviços acessíveis quando necessário
- **Rastreabilidade**: Todas as ações são logadas e auditáveis

---

## 🔐 Segurança da Aplicação

### 1. Autenticação e Autorização

#### JWT (JSON Web Tokens)
```typescript
// Configuração segura do JWT
const token = jwt.sign(
  { 
    userId: user.id, 
    userType: user.tipo,
    iat: Math.floor(Date.now() / 1000)
  },
  process.env.JWT_SECRET, // Chave forte (mín. 256 bits)
  { 
    expiresIn: '7d',
    issuer: 'chamadopro.com',
    audience: 'chamadopro-users'
  }
);
```

**Boas Práticas:**
- Chave JWT com mínimo de 256 bits
- Tokens com expiração curta (7 dias)
- Refresh tokens para renovação
- Blacklist de tokens inválidos
- Validação de issuer e audience

#### Controle de Acesso
```typescript
// Middleware de autorização
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.tipo)) {
      return res.status(403).json({ 
        message: 'Acesso negado',
        code: 'FORBIDDEN'
      });
    }
    next();
  };
};
```

### 2. Validação de Dados

#### Sanitização de Entrada
```typescript
// Validação com Joi
const userSchema = Joi.object({
  nome: Joi.string()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Nome deve conter apenas letras e espaços'
    }),
  
  email: Joi.string()
    .email()
    .max(255)
    .required()
    .normalize()
    .lowercase(),
  
  senha: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base': 'Senha deve conter: 1 minúscula, 1 maiúscula, 1 número e 1 símbolo'
    }),
  
  cpf_cnpj: Joi.string()
    .custom((value, helpers) => {
      if (!validateCPF(value) && !validateCNPJ(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
});
```

#### Prevenção de Injeção
```typescript
// Uso de prepared statements com Prisma
const user = await prisma.user.findFirst({
  where: {
    email: email, // Prisma automaticamente previne SQL injection
    ativo: true
  }
});

// Sanitização de HTML
import DOMPurify from 'isomorphic-dompurify';

const cleanContent = DOMPurify.sanitize(userInput, {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
  ALLOWED_ATTR: []
});
```

### 3. Rate Limiting

#### Configuração Global
```typescript
// Rate limiting por IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: {
    error: 'Muitas requisições',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Pular rate limiting para IPs confiáveis
    return trustedIPs.includes(req.ip);
  }
});
```

#### Rate Limiting Específico
```typescript
// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 tentativas por IP
  message: {
    error: 'Muitas tentativas de login',
    code: 'LOGIN_RATE_LIMIT',
    retryAfter: 15 * 60
  },
  skipSuccessfulRequests: true
});

// Rate limiting para registro
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 registros por IP por hora
  message: {
    error: 'Muitos registros',
    code: 'REGISTER_RATE_LIMIT'
  }
});
```

### 4. Headers de Segurança

#### Configuração do Helmet
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "*.amazonaws.com"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.pagarme.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));
```

### 5. Criptografia

#### Hash de Senhas
```typescript
import bcrypt from 'bcryptjs';

// Hash da senha
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verificação da senha
const isValid = await bcrypt.compare(password, hashedPassword);
```

#### Criptografia de Dados Sensíveis
```typescript
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Criptografar dados sensíveis
function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('chamadopro', 'utf8'));
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
}
```

---

## 🗄️ Segurança do Banco de Dados

### 1. Configuração de Conexão

#### String de Conexão Segura
```env
# .env
DATABASE_URL="postgresql://chamadopro_user:senha_super_segura@localhost:5432/chamadopro?sslmode=require&connect_timeout=10"
```

#### Configuração do Prisma
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
});

// Log de queries suspeitas
prisma.$on('query', (e) => {
  if (e.duration > 1000) { // Queries lentas
    logger.warn(`Slow query detected: ${e.query} - Duration: ${e.duration}ms`);
  }
});
```

### 2. Controle de Acesso

#### Usuário do Banco
```sql
-- Criar usuário específico para a aplicação
CREATE USER chamadopro_user WITH PASSWORD 'senha_super_segura';

-- Conceder apenas permissões necessárias
GRANT CONNECT ON DATABASE chamadopro TO chamadopro_user;
GRANT USAGE ON SCHEMA public TO chamadopro_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO chamadopro_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO chamadopro_user;

-- Revogar permissões administrativas
REVOKE CREATE ON SCHEMA public FROM chamadopro_user;
REVOKE DROP ON SCHEMA public FROM chamadopro_user;
```

### 3. Auditoria de Dados

#### Tabela de Logs
```sql
-- Tabela de auditoria
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger para auditoria automática
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas sensíveis
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### 4. Backup Seguro

#### Script de Backup Criptografado
```bash
#!/bin/bash
# backup-seguro.sh

BACKUP_DIR="/var/backups/chamadopro"
DATE=$(date +%Y%m%d_%H%M%S)
ENCRYPTION_KEY="chave_de_criptografia_256_bits"

# Backup do banco
pg_dump -h localhost -U chamadopro_user chamadopro > $BACKUP_DIR/backup_$DATE.sql

# Criptografar backup
openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/backup_$DATE.sql -out $BACKUP_DIR/backup_$DATE.sql.enc -k $ENCRYPTION_KEY

# Remover backup não criptografado
rm $BACKUP_DIR/backup_$DATE.sql

# Upload para S3 com criptografia
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.enc s3://chamadopro-backups/ --sse aws:kms

echo "Backup criptografado realizado: backup_$DATE.sql.enc"
```

---

## 🏗️ Segurança da Infraestrutura

### 1. Firewall

#### Configuração do UFW
```bash
# Configuração básica do firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow ssh

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir apenas IPs específicos para PostgreSQL
sudo ufw allow from 127.0.0.1 to any port 5432

# Ativar firewall
sudo ufw enable
```

#### Regras do iptables
```bash
# Script de configuração avançada
#!/bin/bash

# Limpar regras existentes
iptables -F
iptables -X
iptables -t nat -F
iptables -t nat -X

# Política padrão
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Permitir loopback
iptables -A INPUT -i lo -j ACCEPT

# Permitir conexões estabelecidas
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Permitir SSH apenas de IPs específicos
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT

# Permitir HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# Rate limiting para conexões
iptables -A INPUT -p tcp --dport 80 -m limit --limit 25/minute --limit-burst 100 -j ACCEPT

# Bloquear portas desnecessárias
iptables -A INPUT -p tcp --dport 5432 -j DROP
iptables -A INPUT -p tcp --dport 6379 -j DROP

# Log de tentativas suspeitas
iptables -A INPUT -m limit --limit 5/min -j LOG --log-prefix "iptables denied: " --log-level 7
```

### 2. SSL/TLS

#### Configuração do Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name chamadopro.com;
    
    # Certificado SSL
    ssl_certificate /etc/letsencrypt/live/chamadopro.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chamadopro.com/privkey.pem;
    
    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Outros headers de segurança
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Configuração da aplicação
    location / {
        proxy_pass http://localhost:3000;
        # ... outras configurações proxy
    }
}
```

### 3. Monitoramento de Segurança

#### Fail2Ban
```bash
# Instalar Fail2Ban
sudo apt install fail2ban -y

# Configuração personalizada
sudo nano /etc/fail2ban/jail.local
```

**Configuração do Fail2Ban:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
```

#### Logs de Segurança
```bash
# Script de monitoramento de segurança
#!/bin/bash

# Verificar tentativas de login suspeitas
echo "=== Tentativas de Login Suspeitas ==="
grep "Failed password" /var/log/auth.log | tail -20

# Verificar tentativas de acesso a arquivos sensíveis
echo -e "\n=== Tentativas de Acesso Suspeitas ==="
grep -E "(\.env|config|admin)" /var/log/nginx/access.log | tail -10

# Verificar IPs bloqueados pelo Fail2Ban
echo -e "\n=== IPs Bloqueados ==="
fail2ban-client status sshd

# Verificar uso de recursos
echo -e "\n=== Uso de Recursos ==="
ps aux --sort=-%cpu | head -10
```

---

## 🔒 Segurança de Dados

### 1. Classificação de Dados

#### Dados Pessoais (LGPD)
- **Nome completo**
- **CPF/CNPJ**
- **Endereço completo**
- **Telefone**
- **Email**
- **Data de nascimento**

#### Dados Sensíveis
- **Senhas** (hash bcrypt)
- **Tokens de autenticação**
- **Dados de pagamento** (tokenizados)
- **Fotos pessoais**

### 2. Criptografia de Dados

#### Criptografia em Repouso
```typescript
// Criptografia de campos sensíveis
import crypto from 'crypto';

class DataEncryption {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;
  
  constructor() {
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  }
  
  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('chamadopro', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  }
  
  decrypt(encryptedData: string): string {
    const [ivHex, tagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('chamadopro', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 3. Anonimização de Dados

#### Script de Anonimização
```typescript
// Anonimização para relatórios
function anonymizeUserData(user: User): AnonymizedUser {
  return {
    id: user.id,
    tipo: user.tipo,
    cidade: user.endereco?.cidade,
    estado: user.endereco?.estado,
    dataCadastro: user.dataCadastro,
    reputacao: user.reputacao,
    // Dados pessoais removidos
    nome: `Usuario_${user.id.substring(0, 8)}`,
    email: `user_${user.id.substring(0, 8)}@anonimo.com`,
    telefone: null,
    cpf_cnpj: null,
    endereco: {
      cidade: user.endereco?.cidade,
      estado: user.endereco?.estado
    }
  };
}
```

### 4. Retenção de Dados

#### Política de Retenção
```typescript
// Script de limpeza de dados antigos
async function cleanupOldData() {
  const retentionPeriods = {
    logs: 90, // dias
    backups: 365, // dias
    sessions: 30, // dias
    tempFiles: 7 // dias
  };
  
  // Limpar logs antigos
  await prisma.log.deleteMany({
    where: {
      dataCriacao: {
        lt: new Date(Date.now() - retentionPeriods.logs * 24 * 60 * 60 * 1000)
      }
    }
  });
  
  // Limpar sessões expiradas
  await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });
}
```

---

## 📊 Monitoramento de Segurança

### 1. Logs de Segurança

#### Configuração de Logs
```typescript
// Logger de segurança
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: '/var/log/chamadopro/security.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.Console()
  ]
});

// Função para log de eventos de segurança
function logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical') {
  securityLogger.log({
    level: severity === 'critical' ? 'error' : 'info',
    message: event,
    details,
    severity,
    timestamp: new Date().toISOString(),
    ip: details.ip,
    userAgent: details.userAgent
  });
}
```

### 2. Detecção de Anomalias

#### Monitoramento de Login
```typescript
// Detecção de tentativas suspeitas
async function detectSuspiciousLogin(email: string, ip: string, userAgent: string) {
  const recentAttempts = await prisma.loginAttempt.findMany({
    where: {
      email,
      createdAt: {
        gte: new Date(Date.now() - 15 * 60 * 1000) // últimos 15 minutos
      }
    }
  });
  
  // Muitas tentativas de login
  if (recentAttempts.length > 5) {
    logSecurityEvent('MULTIPLE_LOGIN_ATTEMPTS', {
      email,
      ip,
      attempts: recentAttempts.length
    }, 'high');
    
    // Bloquear IP temporariamente
    await blockIP(ip, 15 * 60 * 1000); // 15 minutos
  }
  
  // Login de localização diferente
  const lastLogin = await prisma.loginAttempt.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' }
  });
  
  if (lastLogin && lastLogin.ip !== ip) {
    // Verificar se é de localização muito diferente
    const location = await getLocationFromIP(ip);
    const lastLocation = await getLocationFromIP(lastLogin.ip);
    
    if (isLocationSuspicious(location, lastLocation)) {
      logSecurityEvent('SUSPICIOUS_LOCATION_LOGIN', {
        email,
        ip,
        location,
        lastLocation
      }, 'medium');
    }
  }
}
```

### 3. Alertas de Segurança

#### Sistema de Alertas
```typescript
// Configuração de alertas
const securityAlerts = {
  multipleFailedLogins: {
    threshold: 5,
    timeWindow: 15 * 60 * 1000, // 15 minutos
    action: 'block_ip'
  },
  suspiciousFileAccess: {
    patterns: ['.env', 'config', 'admin', 'backup'],
    action: 'alert_admin'
  },
  dataExfiltration: {
    threshold: 1000, // MB
    timeWindow: 60 * 60 * 1000, // 1 hora
    action: 'block_user'
  }
};

// Função de envio de alertas
async function sendSecurityAlert(alert: SecurityAlert) {
  // Enviar email para administradores
  await sendEmail({
    to: 'security@chamadopro.com',
    subject: `[ALERTA] ${alert.type}`,
    html: `
      <h2>Alerta de Segurança</h2>
      <p><strong>Tipo:</strong> ${alert.type}</p>
      <p><strong>Severidade:</strong> ${alert.severity}</p>
      <p><strong>Descrição:</strong> ${alert.description}</p>
      <p><strong>Timestamp:</strong> ${alert.timestamp}</p>
      <p><strong>IP:</strong> ${alert.ip}</p>
      <p><strong>User Agent:</strong> ${alert.userAgent}</p>
    `
  });
  
  // Enviar para Slack
  await sendSlackMessage({
    channel: '#security-alerts',
    text: `🚨 Alerta de Segurança: ${alert.type}`,
    attachments: [{
      color: alert.severity === 'critical' ? 'danger' : 'warning',
      fields: [
        { title: 'Tipo', value: alert.type, short: true },
        { title: 'Severidade', value: alert.severity, short: true },
        { title: 'IP', value: alert.ip, short: true },
        { title: 'Descrição', value: alert.description, short: false }
      ]
    }]
  });
}
```

---

## 🚨 Resposta a Incidentes

### 1. Plano de Resposta

#### Classificação de Incidentes
- **Crítico**: Comprometimento total do sistema
- **Alto**: Comprometimento parcial com dados expostos
- **Médio**: Tentativa de ataque bloqueada
- **Baixo**: Atividade suspeita detectada

#### Procedimentos de Resposta
```bash
#!/bin/bash
# incident-response.sh

INCIDENT_TYPE=$1
SEVERITY=$2

case $SEVERITY in
  "critical")
    echo "🚨 INCIDENTE CRÍTICO DETECTADO"
    
    # 1. Isolar sistema
    sudo ufw deny from any to any
    
    # 2. Notificar equipe
    curl -X POST "https://hooks.slack.com/your-webhook" \
      -H "Content-Type: application/json" \
      -d '{"text":"🚨 INCIDENTE CRÍTICO - Sistema isolado"}'
    
    # 3. Preservar evidências
    sudo cp /var/log/chamadopro/security.log /var/backups/incident-$(date +%Y%m%d_%H%M%S).log
    
    # 4. Ativar modo de manutenção
    echo "Sistema em manutenção" > /var/www/html/index.html
    
    ;;
    
  "high")
    echo "⚠️ INCIDENTE DE ALTA PRIORIDADE"
    
    # 1. Bloquear IPs suspeitos
    sudo fail2ban-client set sshd banip $SUSPICIOUS_IP
    
    # 2. Notificar administradores
    echo "Incidente de alta prioridade detectado" | mail -s "Alerta de Segurança" admin@chamadopro.com
    
    # 3. Aumentar monitoramento
    sudo fail2ban-client set sshd addignoreip $TRUSTED_IP
    
    ;;
esac
```

### 2. Comunicação de Incidentes

#### Template de Comunicação
```markdown
# Comunicado de Incidente de Segurança

**Data/Hora**: [Data e hora do incidente]
**Severidade**: [Crítica/Alta/Média/Baixa]
**Status**: [Investigando/Contido/Resolvido]

## Resumo
[Breve descrição do incidente]

## Impacto
- **Usuários afetados**: [Número estimado]
- **Serviços afetados**: [Lista de serviços]
- **Dados comprometidos**: [Sim/Não - detalhes se aplicável]

## Ações Tomadas
1. [Primeira ação]
2. [Segunda ação]
3. [Terceira ação]

## Próximos Passos
1. [Investigação adicional]
2. [Correções implementadas]
3. [Medidas preventivas]

## Contato
Para dúvidas sobre este incidente, entre em contato com security@chamadopro.com
```

---

## 📋 Auditoria e Compliance

### 1. Checklist de Segurança

#### Checklist Diário
- [ ] Verificar logs de segurança
- [ ] Monitorar tentativas de login
- [ ] Verificar status dos serviços
- [ ] Validar backups
- [ ] Verificar atualizações de segurança

#### Checklist Semanal
- [ ] Revisar configurações de firewall
- [ ] Verificar certificados SSL
- [ ] Analisar relatórios de vulnerabilidade
- [ ] Testar procedimentos de backup
- [ ] Revisar permissões de usuário

#### Checklist Mensal
- [ ] Auditoria de logs
- [ ] Teste de penetração
- [ ] Revisão de políticas de segurança
- [ ] Atualização de dependências
- [ ] Treinamento da equipe

### 2. Relatórios de Compliance

#### Relatório de Segurança Mensal
```typescript
// Geração de relatório de segurança
async function generateSecurityReport() {
  const report = {
    period: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    metrics: {
      totalLogins: await prisma.loginAttempt.count(),
      failedLogins: await prisma.loginAttempt.count({
        where: { success: false }
      }),
      blockedIPs: await prisma.blockedIP.count(),
      securityAlerts: await prisma.securityAlert.count()
    },
    incidents: await prisma.securityIncident.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    recommendations: [
      "Implementar autenticação de dois fatores",
      "Atualizar certificados SSL",
      "Revisar políticas de senha"
    ]
  };
  
  return report;
}
```

### 3. Conformidade LGPD

#### Direitos dos Titulares
```typescript
// Implementação dos direitos LGPD
class LGPDService {
  // Direito de acesso
  async getPersonalData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        cpf_cnpj: true,
        dataNascimento: true,
        endereco: true,
        dataCadastro: true
      }
    });
    
    return user;
  }
  
  // Direito de retificação
  async updatePersonalData(userId: string, data: Partial<User>) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        nome: data.nome,
        telefone: data.telefone,
        endereco: data.endereco
      }
    });
  }
  
  // Direito de exclusão
  async deletePersonalData(userId: string) {
    // Anonimizar dados em vez de deletar
    return await prisma.user.update({
      where: { id: userId },
      data: {
        nome: `Usuario_${userId.substring(0, 8)}`,
        email: `deleted_${userId}@anonimo.com`,
        telefone: null,
        cpf_cnpj: null,
        endereco: null,
        ativo: false
      }
    });
  }
  
  // Direito de portabilidade
  async exportPersonalData(userId: string) {
    const userData = await this.getPersonalData(userId);
    const posts = await prisma.post.findMany({
      where: { usuarioId: userId }
    });
    const orcamentos = await prisma.orcamento.findMany({
      where: { OR: [{ prestadorId: userId }, { clienteId: userId }] }
    });
    
    return {
      personalData: userData,
      posts,
      orcamentos,
      exportDate: new Date().toISOString()
    };
  }
}
```

---

## 📞 Contatos de Segurança

### Equipe de Segurança
- **CISO**: [Nome] - [email] - [telefone]
- **Security Lead**: [Nome] - [email] - [telefone]
- **Incident Response**: [Nome] - [email] - [telefone]

### Contatos de Emergência
- **24/7 Security Hotline**: +55 11 99999-9999
- **Email de Emergência**: security@chamadopro.com
- **Slack**: #security-alerts

### Recursos Externos
- **CERT.br**: https://www.cert.br/
- **LGPD**: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd
- **OWASP**: https://owasp.org/

---

*Diretrizes de Segurança - Versão 3.2.0*  
*Última atualização: Janeiro 2025*  
*Próxima revisão: Março 2025*

