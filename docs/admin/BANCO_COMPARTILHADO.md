# Arquitetura – Banco Compartilhado entre App e Painel Admin

## 1. Objetivo
Definir como o **ChamadoPro Admin** opera de forma independente, compartilhando o **mesmo banco PostgreSQL** com o sistema público (ChamadoPro App), garantindo consistência, segurança e escalabilidade.

> Estratégia adotada: **Shared Database, Separate Systems** – código e deploy separados, banco de dados único com permissões controladas.

---

## 2. Estrutura recomendada de diretórios
```
chamadopro/
├── frontend-app/
├── frontend-admin/
├── backend-app/
├── backend-admin/
├── shared/
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

- Cada backend usa seu próprio serviço, credenciais e autenticação.
- O diretório `shared/` mantém apenas tipos/utilitários reaproveitados.

---

## 3. Banco de dados (PostgreSQL)

### Schemas
```
ChamadoProDB
├── app      # dados do aplicativo público
│   ├── usuarios
│   ├── posts
│   ├── propostas
│   ├── contratos
│   ├── mensagens
│   └── pagamentos
└── admin    # dados do painel administrativo
    ├── verificacoes
    ├── auditoria
    ├── logs
    ├── disputas
    └── configuracoes
```

### Políticas de acesso (exemplo)
```sql
REVOKE ALL ON SCHEMA app FROM app_user;
GRANT USAGE ON SCHEMA app TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA app TO app_user;

REVOKE ALL ON SCHEMA admin FROM app_user;
GRANT USAGE ON SCHEMA admin TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA admin TO admin_user;
```

| Role             | Schema(s)        | Permissões principais                        |
|------------------|------------------|----------------------------------------------|
| `app_user`       | `app`            | SELECT / INSERT / UPDATE próprios            |
| `admin_user`     | `app`, `admin`   | SELECT / UPDATE / DELETE (operadores admin) |
| `service_user`   | `admin`          | INSERT / UPDATE (jobs automáticos)           |

---

## 4. Conexão e deploy

### Strings de conexão
```
DATABASE_URL=postgresql://app_user:senha@db:5432/chamadoprodb
DATABASE_URL_ADMIN=postgresql://admin_user:senha@db:5432/chamadoprodb
```

### Docker Compose (exemplo)
```yaml
version: "3.9"
services:
  app:
    build: ./frontend-app
    ports: ["3000:3000"]

  api-app:
    build: ./backend-app
    ports: ["3001:3001"]
    environment:
      - DATABASE_URL=${DATABASE_URL}

  admin:
    build: ./frontend-admin
    ports: ["4000:4000"]

  api-admin:
    build: ./backend-admin
    ports: ["4001:4001"]
    environment:
      - DATABASE_URL=${DATABASE_URL_ADMIN}

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chamadoprodb
      POSTGRES_USER: chamadopro
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

---

## 5. Autenticação e segurança

### JWTs independentes
- App (`/api/login`): payload `{ role: "user" }`
- Admin (`/api/admin/login`): `{ role: "admin", permissions: [...] }`

### Sessão / logs
```sql
INSERT INTO admin.logs (admin_id, acao, data, ip)
VALUES (7, 'login_sucesso', NOW(), '192.168.0.45');
```

- Cookies HttpOnly separados por domínio/subdomínio.
- Recomenda-se 2FA para autenticação administrativa.

---

## 6. Fluxos de dados

### a) Aprovação de cadastro
1. Usuário cria conta (`usuarios.status = 'pendente'`).
2. Admin revisa via painel (`SELECT * FROM app.usuarios WHERE status='pendente'`).
3. Decisão aplicada:
   ```sql
   UPDATE app.usuarios
   SET status='verificado', verificado_por=admin_id
   WHERE id=432;
   ```

### b) Liberação financeira
1. Pagamento entra (`app.pagamentos.status='aguardando_liberacao'`).
2. Admin autoriza via painel (`UPDATE app.pagamentos SET status='liberado'`).
3. App reflete imediatamente o status liberado.

### c) Disputas
1. Cliente abre disputa → registro em `app.disputas`.
2. Admin analisa e decide → registro em `admin.auditoria` e `admin.logs`.

---

## 7. Logs e auditoria

Tabelas recomendadas:
```sql
CREATE TABLE admin.logs (
  id SERIAL PRIMARY KEY,
  admin_id INT,
  acao TEXT,
  alvo TEXT,
  ip VARCHAR(45),
  data TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin.auditoria (
  id SERIAL PRIMARY KEY,
  tipo TEXT,
  referencia_id INT,
  admin_id INT,
  detalhes JSONB,
  data TIMESTAMP DEFAULT NOW()
);
```

- `admin.logs`: rastreia ações (login, alterações, liberações).
- `admin.auditoria`: registros imutáveis de decisões críticas.

---

## 8. Segurança e governança
- Conexões ao banco restritas por IP e role.
- Aplicar 2FA e IP whitelist para login admin.
- Views seguras para relatórios (evitar acesso direto às tabelas).
- Backups diários (`pg_dump`) e testes de restauração.
- Logs imutáveis e armazenados por período mínimo definido (auditoria/legislação).

---

## 9. Escalabilidade futura
| Etapa | Ação | Benefício |
|-------|------|-----------|
| 1 | Mover admin para servidor/dominio dedicado | Maior isolamento e segurança |
| 2 | Criar réplica de leitura | Relatórios sem impactar operações |
| 3 | Introduzir fila (Redis/RabbitMQ) | Processamento assíncrono |
| 4 | Integrar observabilidade (Grafana/ELK) | Monitoramento unificado |

---

## ✅ Conclusão
- **Fase atual**: banco compartilhado com roles e schemas distintos.
- **Próximo passo**: implementar Fase 2 quando houver necessidade de isolamento pleno (ver [`ARQUITETURA_FASES.md`](./ARQUITETURA_FASES.md)).
- **Documentos relacionados**: [`PAINEL_ADMIN.md`](./PAINEL_ADMIN.md), [`DEPLOY_QA.md`](./DEPLOY_QA.md).

**Última atualização:** 06/11/2025
