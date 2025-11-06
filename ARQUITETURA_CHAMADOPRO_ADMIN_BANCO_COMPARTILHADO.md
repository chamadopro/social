# 📘 ARQUITETURA_CHAMADOPRO_ADMIN_BANCO_COMPARTILHADO.md

## 1️⃣ Objetivo
Definir a arquitetura técnica do **ChamadoPro Admin**, sistema administrativo independente responsável pela gestão, validação e intermediação da plataforma ChamadoPro.  
O objetivo é garantir que o **painel administrativo** opere de forma **autônoma**, mas **compartilhando o mesmo banco de dados** com o sistema público (ChamadoPro App), assegurando consistência, segurança e escalabilidade futura.

---

## 2️⃣ Princípio Arquitetural

O modelo adotado segue a filosofia **“Shared Database, Separate Systems”**:

> App (cliente/prestador) e Admin (operadores internos) são sistemas distintos, com deploy, código e autenticação próprios, porém conectados ao mesmo banco de dados PostgreSQL.

---

## 3️⃣ Estrutura de Diretórios Recomendada

```
chamadopro/
├── frontend-app/           # Sistema público (Next.js)
├── frontend-admin/         # Painel administrativo (Next.js)
├── backend-app/            # API pública (usuários e operações)
├── backend-admin/          # API administrativa (cadastros, finanças, disputas)
├── shared/                 # Tipos e utilitários comuns
│   ├── types/
│   ├── utils/
│   └── config/
├── database/
│   ├── prisma/
│   ├── migrations/
│   ├── seeds/
│   └── scripts/
└── docker-compose.yml
```

### Detalhes
- Cada backend possui seu próprio serviço (porta e autenticação).
- O banco é o mesmo, mas os **roles SQL** e **schemas** são distintos.
- O diretório `/shared` contém apenas tipos TypeScript e constantes reutilizáveis (ex: enums de status, schemas de resposta).

---

## 4️⃣ Banco de Dados (PostgreSQL)

### Estrutura de Schemas
```
ChamadoProDB
├── schema app
│   ├── usuarios
│   ├── posts
│   ├── propostas
│   ├── contratos
│   ├── mensagens
│   └── pagamentos
└── schema admin
    ├── verificacoes
    ├── auditoria
    ├── logs
    ├── disputas
    └── configuracoes
```

### Políticas de Acesso
| Role | Schema | Permissões |
|------|---------|-------------|
| `app_user` | `app` | SELECT / INSERT / UPDATE próprios |
| `admin_user` | `app` + `admin` | SELECT / UPDATE / DELETE |
| `service_user` | `admin` | UPDATE / INSERT (jobs automáticos) |

Exemplo de política:
```sql
REVOKE ALL ON SCHEMA app FROM app_user;
GRANT USAGE ON SCHEMA app TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA app TO app_user;

REVOKE ALL ON SCHEMA admin FROM app_user;
GRANT USAGE ON SCHEMA admin TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA admin TO admin_user;
```

---

## 5️⃣ Conexão e Deploy

### Banco compartilhado
Ambos os sistemas usam a mesma conexão base, mudando apenas o role:

```
DATABASE_URL=postgresql://app_user:senha@db:5432/chamadoprodb
DATABASE_URL_ADMIN=postgresql://admin_user:senha@db:5432/chamadoprodb
```

---

### Docker Compose

```yaml
version: "3.9"
services:
  app:
    build: ./frontend-app
    ports:
      - "3000:3000"

  api-app:
    build: ./backend-app
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}

  admin:
    build: ./frontend-admin
    ports:
      - "4000:4000"

  api-admin:
    build: ./backend-admin
    ports:
      - "4001:4001"
    environment:
      - DATABASE_URL=${DATABASE_URL_ADMIN}

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chamadoprodb
      POSTGRES_USER: chamadopro
      POSTGRES_PASSWORD: senha
```

---

## 6️⃣ Autenticação e Segurança

### JWTs independentes
- App: `/api/login` → `{ role: "user" }`
- Admin: `/api/admin/login` → `{ role: "admin", permissions: ["finance", "disputes"] }`

### Sessão
- Cookies HttpOnly (separados por domínio)
- Tokens curtos + refresh tokens
- Logs de login:
```sql
INSERT INTO admin_logs (admin_id, acao, data, ip) VALUES (7, 'login_sucesso', NOW(), '192.168.0.45');
```

---

## 7️⃣ Fluxos de Dados Principais

### a) Liberação de cadastros
1. Usuário cria conta (`usuarios.status = 'pendente'`)
2. Admin analisa (`SELECT * FROM usuarios WHERE status='pendente'`)
3. Valida e atualiza:
   ```sql
   UPDATE usuarios SET status='verificado', verificado_por=admin_id WHERE id=432;
   ```

### b) Análise financeira
1. Pagamento entra (`pagamentos.status='aguardando_liberacao'`)
2. Admin vê no painel e autoriza (`UPDATE pagamentos SET status='liberado'`)
3. App reflete instantaneamente o status.

### c) Intermediações e disputas
1. Usuário abre disputa → registro em `app.disputas`
2. Admin acessa, analisa e registra decisão em `admin.auditoria`
3. Logs automáticos armazenam data, responsável e decisão.

---

## 8️⃣ Logs e Auditoria

Tabela `admin_logs`:
```sql
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT,
  acao TEXT,
  alvo TEXT,
  ip VARCHAR(45),
  data TIMESTAMP DEFAULT NOW()
);
```

Tabela `auditoria`:
```sql
CREATE TABLE auditoria (
  id SERIAL PRIMARY KEY,
  tipo TEXT,
  referencia_id INT,
  admin_id INT,
  detalhes JSONB,
  data TIMESTAMP DEFAULT NOW()
);
```

---

## 9️⃣ Segurança e Governança

- **Conexões restritas** por IP e role.
- **2FA** em logins administrativos.
- **Views seguras** para relatórios.
- **Backup diário** do banco.
- **Histórico imutável** de ações críticas.

---

## 🔮 10️⃣ Escalabilidade Futura

Quando o time crescer (> 50 administradores):
| Etapa | Ação | Impacto |
|--------|-------|----------|
| 1 | Mover o Admin para servidor dedicado | Aumenta isolamento e segurança |
| 2 | Criar réplica de leitura do banco | Relatórios mais rápidos |
| 3 | Adicionar fila (Redis/RabbitMQ) | Processamento de jobs |
| 4 | Integrar logs no Grafana | Observabilidade completa |

---

## ✅ Conclusão

> O **ChamadoPro Admin** é um sistema independente, seguro e escalável, que compartilha o mesmo banco de dados do ChamadoPro App.  
> Toda comunicação entre ambos é feita **via banco**, sem integração dinâmica direta.  
> O design garante consistência, simplicidade e expansão futura sem refatorações.
