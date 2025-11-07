# 📘 Arquitetura do Painel Administrativo – Plano de Fases

## 🎯 Objetivo
Documentar a evolução do painel administrativo do ChamadoPro, começando por uma solução integrada (Fase 1) até alcançar uma arquitetura independente e escalável (Fase 2).

---

## 📋 Fase 1 – Sistema Administrativo Integrado (implementação atual)

### Visão geral
- Admin e aplicação pública compartilham o mesmo monorepo, backend e autenticação.
- Ideal para entregar rápido, validar funcionalidades e manter manutenção simples.

### Estrutura resumida
```
chamadopro/
├── frontend/src/app/admin/*   # rotas administrativas (Next.js)
├── backend/src/routes/admin.ts
├── backend/src/controllers/AdminController.ts
└── backend/src/middleware/auth.ts (requireAdmin)
```

### Principais componentes
- **Autenticação**: Middleware `requireAdmin` reutilizando JWT do sistema principal.
- **Rotas**: `/api/admin/*` protegidas por `authenticate` + `requireAdmin`.
- **Frontend**: layout dedicado em `/admin/layout.tsx`, páginas para dashboard, usuários, posts, financeiro, disputas, relatórios, auditoria e configurações.

### Vantagens
- ✅ Implementação rápida e baixo custo inicial.
- ✅ Manutenção simples (mesmo deploy e infraestrutura).
- ✅ Compartilha autenticação e estado com o app principal.

### Limitações
- ⚠️ Deploy acoplado (admin + app juntos).
- ⚠️ Escalabilidade e segurança limitadas para times maiores.
- ⚠️ Código administrativo misturado ao público.

### Quando migrar para Fase 2?
- Time administrativo > 5 pessoas.
- Necessidade de deploy/infra independentes.
- Requisitos de segurança adicionais (2FA, IP whitelist, auditoria avançada).
- Alto volume de operações administrativas.

---

## 🚀 Fase 2 – Sistema Administrativo Independente (planejado)

### Visão geral
- Admin e app público separados em projetos distintos.
- Banco de dados compartilhado com schemas e roles específicos.
- Autenticação, deploy e infraestrutura desacoplados.

### Estrutura proposta
```
chamadopro/
├── frontend-app/       # aplicação pública
├── backend-app/        # API pública
├── frontend-admin/     # painel administrativo (novo)
├── backend-admin/      # API administrativa (nova)
├── shared/             # tipos/utils reutilizados
└── docker-compose.yml  # orquestração de serviços
```

### Banco de dados
- Schemas separados (`app`, `admin`).
- Roles específicas (`app_user`, `admin_user`) com permissões distintas.
- Logs administrativos armazenados em tabelas dedicadas (`admin.admin_logs`, `admin.auditoria`).

### Backend admin
- Projeto Node/Express isolado (`backend-admin`).
- Conexão via role `admin_user` com Prisma.
- Autenticação independente (token com role `admin`, opção de 2FA).
- CORS restritivo ao domínio admin.

### Frontend admin
- Projeto Next.js ou outra stack desacoplada (`frontend-admin`).
- Layout e componentes 100% independentes.
- Comunicação via `NEXT_PUBLIC_API_URL` apontando para `backend-admin`.

### Deploy (docker-compose exemplo)
```yaml
services:
  app:
    build: ./frontend-app
    ports: ["3000:3000"]
  api-app:
    build: ./backend-app
    ports: ["3001:3001"]
  admin:
    build: ./frontend-admin
    ports: ["4000:4000"]
  api-admin:
    build: ./backend-admin
    ports: ["4001:4001"]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chamadoprodb
      POSTGRES_USER: chamadopro
      POSTGRES_PASSWORD: ${DB_PASSWORD}
```

### Vantagens Fase 2
- ✅ Isolamento completo (segurança e desempenho).
- ✅ Deploys independentes (admin/app).
- ✅ Escalabilidade específica para operações administrativas.

### Desafios Fase 2
- ⚠️ Maior complexidade técnica (infra + CI/CD).
- ⚠️ Migração de dados para schemas específicos.
- ⚠️ Custo operacional mais alto (infra/dns/certs).

---

## 📊 Comparativo rápido

| Aspecto | Fase 1 | Fase 2 |
|---------|--------|--------|
| Tempo de implementação | 1–2 semanas | 6–8 semanas |
| Complexidade | Baixa | Alta |
| Deploy | Único | Independente |
| Escalabilidade | Limitada | Alta |
| Segurança | Boa | Excelente |
| Manutenção | Simples | Dividida por sistema |

---

## 🔄 Roadmap de migração (Fase 1 → Fase 2)

1. **Preparação**: organizar monorepo ou repositórios separados.
2. **Banco**: criar schemas/roles, migrar tabelas, testar permissões.
3. **Backend admin**: novo projeto, migrar controllers, autenticação dedicada.
4. **Frontend admin**: novo projeto, migrar páginas e componentes.
5. **Deploy/QA**: docker-compose, staging, smoke tests.
6. **Corte**: redirecionar rotas, desativar código antigo, documentar.

Tempo estimado: ~7-8 semanas (dependendo de equipe e validações).

---

## ✅ Recomendações

- **Comece com Fase 1** para rapidez e validação.
- **Planeje Fase 2** assim que requisitos de segurança, escalabilidade ou independência de deploy se tornarem críticos.
- Use este documento em conjunto com:
  - [`PAINEL_ADMIN.md`](./PAINEL_ADMIN.md)
  - [`BANCO_COMPARTILHADO.md`](./BANCO_COMPARTILHADO.md)
  - [`DEPLOY_QA.md`](./DEPLOY_QA.md)

**Última atualização:** 06/11/2025
