# Documentação do Painel Administrativo - ChamadoPro

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Acesso e Autenticação](#acesso-e-autenticação)
3. [Estrutura do Sistema](#estrutura-do-sistema)
4. [Funcionalidades Implementadas](#funcionalidades-implementadas)
5. [Endpoints da API](#endpoints-da-api)
6. [Componentes Frontend](#componentes-frontend)
7. [WebSocket e Notificações em Tempo Real](#websocket-e-notificações-em-tempo-real)
8. [Configuração e Deploy](#configuração-e-deploy)
9. [Segurança](#segurança)
10. [Logs e Auditoria](#logs-e-auditoria)
11. [Troubleshooting](#-troubleshooting)
12. [Documentação Relacionada](#-documentação-relacionada)
13. [Próximos Passos](#-próximos-passos)
14. [Checklist de Implementação](#-checklist-de-implementação)

---

## 🔍 Visão Geral

O Painel Administrativo do ChamadoPro é um sistema completo de gestão que permite aos administradores gerenciar usuários, posts, finanças, disputas e monitorar o sistema através de relatórios e auditoria.

**Status**: ✅ **FASE 1 - IMPLEMENTADO E FUNCIONAL**

**Arquitetura**: Sistema integrado ao backend principal, compartilhando o mesmo banco de dados (Fase 1 conforme `ARQUITETURA_CHAMADOPRO_ADMIN_FASES.md`).

---

## 🔐 Acesso e Autenticação

### URL de Acesso
- **Desenvolvimento**: `http://[IP_DO_SERVIDOR]:3000/admin/login`
- **Produção**: `https://chamadopro.com.br/admin/login`

### Credenciais Padrão
```
Email: admin@chamadopro.com
Senha: 123456789
```

⚠️ **IMPORTANTE**: Altere as credenciais padrão em produção!

### Controle de Acesso
- Apenas usuários com `tipo: 'ADMIN'` podem acessar o painel
- Autenticação via JWT token
- Redirecionamento automático para login se não autenticado
- Redirecionamento automático para home se não for admin

---

## 🏗️ Estrutura do Sistema

### Backend

#### Rotas (`backend/src/routes/admin.ts`)
- Todas as rotas protegidas com `authenticate` e `requireAdmin`
- Prefixo: `/api/admin/*`

#### Controller (`backend/src/controllers/AdminController.ts`)
- Lógica de negócio centralizada
- Validações e tratamento de erros
- Integração com Prisma ORM
- Logs de auditoria

#### Middleware (`backend/src/middleware/auth.ts`)
- `requireAdmin`: Valida que o usuário é do tipo 'ADMIN'
- `authenticate`: Valida JWT token

### Frontend

#### Layout (`frontend/src/app/admin/layout.tsx`)
- Layout responsivo com sidebar e header
- Proteção de rotas
- Gerenciamento de estado de autenticação
- Integração com WebSocket para notificações

#### Páginas principais
- `/admin/login` – Login administrativo
- `/admin/dashboard` – Dashboard principal
- `/admin/usuarios` – Gerenciamento de usuários
- `/admin/posts` – Moderação de posts
- `/admin/financeiro` – Gestão financeira
- `/admin/disputas` – Resolução de disputas
- `/admin/relatorios` – Relatórios avançados
- `/admin/auditoria` – Histórico de auditoria
- `/admin/configuracoes` – Configurações do sistema (placeholder)

---

## ⚙️ Funcionalidades Implementadas

### 1. Dashboard (`/admin/dashboard`)
- Estatísticas gerais (usuários, posts, pagamentos, disputas)
- Receitas financeiras (total, pendentes, liberadas)
- Cards com métricas principais e links rápidos
- Atualização em tempo real
- **Endpoint**: `GET /api/admin/dashboard`

### 2. Gerenciamento de Usuários (`/admin/usuarios`)
- Listagem paginada, filtros e busca server-side
- Ativação/Desativação de usuários
- Visualização de detalhes
- **Endpoints**:
  - `GET /api/admin/usuarios`
  - `PUT /api/admin/usuarios/:id/toggle`

### 3. Moderação de Posts (`/admin/posts`)
- Listagem paginada, filtros por status e busca
- Arquivar/restaurar posts e remoção definitiva
- **Endpoints**:
  - `GET /api/admin/posts`
  - `PUT /api/admin/posts/:id/toggle`
  - `DELETE /api/admin/posts/:id`

### 4. Gestão Financeira (`/admin/financeiro`)
- Listagem de pagamentos, filtros e busca
- Liberação manual de pagamentos
- **Endpoints**:
  - `GET /api/admin/pagamentos`
  - `PUT /api/admin/pagamentos/:id/liberar`

### 5. Disputas (`/admin/disputas`)
- Listagem, filtros, modal de resolução
- Decisão com observações e registro em auditoria
- **Endpoints**:
  - `GET /api/admin/disputas`
  - `PUT /api/admin/disputas/:id/resolver`

### 6. Relatórios (`/admin/relatorios`)
- Seleção de tipo/tempo, visualização e exportação
- **Endpoints**:
  - `GET /api/admin/relatorios/avancados`
  - `POST /api/admin/exportar`

### 7. Auditoria (`/admin/auditoria`)
- Tabela com filtros avançados e busca
- **Endpoint**: `GET /api/admin/auditoria`

### 8. Configurações (`/admin/configuracoes`)
- Página placeholder para configurações futuras.

---

## 🔌 Endpoints da API
```
Authorization: Bearer <token>
```

| Categoria | Endpoint |
|-----------|----------|
| Dashboard | `GET /api/admin/dashboard` |
| Usuários | `GET /api/admin/usuarios`
|  | `PUT /api/admin/usuarios/:id/toggle` |
| Posts | `GET /api/admin/posts`
|  | `PUT /api/admin/posts/:id/toggle`
|  | `DELETE /api/admin/posts/:id` |
| Pagamentos | `GET /api/admin/pagamentos`
|  | `PUT /api/admin/pagamentos/:id/liberar` |
| Disputas | `GET /api/admin/disputas`
|  | `PUT /api/admin/disputas/:id/resolver` |
| Relatórios | `GET /api/admin/relatorios/avancados`
|  | `POST /api/admin/exportar` |
| Auditoria | `GET /api/admin/auditoria` |

---

## 🎨 Componentes Frontend

- **AdminLayout**: estrutura base, proteção de rotas e toasts de notificações.
- **AdminDashboard**: cards, métricas e links rápidos.
- **AdminUsers**: tabela paginada, filtros e ações de status.
- **AdminPosts**: moderação e status de posts.
- **AdminFinanceiro**: pagamentos e liberação manual.
- **AdminDisputas**: resolução de disputas em modal.
- **AdminRelatorios**: relatórios avançados e exportação.
- **AdminAuditoria**: logs e filtros por evento/usuário/data.

---

## 🔔 WebSocket e Notificações em Tempo Real

### Implementação
- **Backend**: Socket.IO integrado ao `NotificationService`.
- **Frontend**: cliente Socket.IO inicializado em `AdminLayout`.

### Eventos
- `join_admin`, `leave_admin`
- `admin_notification` → dispara toast com título/mensagem

### Configuração
```typescript
// backend/src/server.ts
socket.on('join_admin', (adminId: string) => {
  socket.join(`admin_${adminId}`);
  socket.join('admins');
});

// frontend/src/app/admin/layout.tsx
socket.emit('join_admin', userId);
socket.on('admin_notification', (data) => {
  addToast({ type: data.type, title: data.title, description: data.message });
});
```

---

## 🔧 Configuração e Deploy

### Variáveis de ambiente
```env
# Backend (.env)
JWT_SECRET=...
DATABASE_URL=...
FRONTEND_URL=https://qa.chamadopro.com.br
DEBUG_SOCKET=false

# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api-qa.chamadopro.com.br/api
NEXT_PUBLIC_SOCKET_URL=https://api-qa.chamadopro.com.br
```

### Prisma & Seed
```bash
cd backend
npm ci
npm run build
npx prisma migrate deploy
npx prisma db seed
```

### Execução
- Backend: `pm2 start dist/server.js --name chamadopro-backend`
- Frontend: `pm2 start npm --name chamadopro-frontend -- run start -- -p 3000`

---

## 🔒 Segurança

1. **JWT + RBAC**: middleware de autenticação e `requireAdmin`.
2. **Logs de auditoria**: cada ação admin registrada com `auditLog`.
3. **Validação de dados**: Zod + Prisma.
4. **Rate limiting**: ativo em produção.
5. **CORS**: controlado para origens permitidas.

**Recomendações**
- Alterar credenciais padrão.
- Usar HTTPS em produção.
- Monitorar logs e configurar alertas.
- Backups periódicos do banco.

---

## 📝 Logs e Auditoria

| Tipo | Descrição |
|------|-----------|
| AUDIT | Ações administrativas (usuário, post, finanças, disputas, exportações) |
| SECURITY | Eventos de segurança (tentativas de acesso, falhas, permissões) |
| PERFORMANCE | Métricas de performance (tempo de queries) |
| TRANSACTION | Transações financeiras |

```json
{
  "action": "USUARIO_ATIVADO",
  "details": { ... },
  "userId": "admin-001",
  "timestamp": "2025-11-06T01:35:51.355Z",
  "ip": "192.168.15.5",
  "userAgent": "Mozilla/5.0..."
}
```

Logs armazenados em `backend/logs/` (`combined.log`, `error.log`).

---

## 🐛 Troubleshooting

- **Página em branco / “Carregando…”**: validar token JWT, tipo de usuário e console do navegador.
- **WebSocket não conecta**: conferir `NEXT_PUBLIC_SOCKET_URL`, CORS e Socket.IO.
- **Logs verbosos**: `DEBUG_SOCKET=false` em produção.
- **Loop login/dashboard**: revisar Zustand persist e `AdminLayout`.

---

## 📚 Documentação Relacionada

- [`ARQUITETURA_FASES.md`](./ARQUITETURA_FASES.md)
- [`BANCO_COMPARTILHADO.md`](./BANCO_COMPARTILHADO.md)
- [`docs/API_DOCUMENTATION.md`](../API_DOCUMENTATION.md)
- [`docs/DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md`](../DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md)

---

## 🚀 Próximos Passos (Fase 2)

1. **Sistema Independente**: backend separado com banco compartilhado.
2. **Funcionalidades Adicionais**: configurações, categorias, taxas, dashboards avançados.
3. **Melhorias**: cache, otimização de queries, exportação PDF, gráficos interativos.

---

## ✅ Checklist de Implementação

- [x] Sistema de login admin
- [x] Dashboard com estatísticas
- [x] Gerenciamento de usuários
- [x] Moderação de posts
- [x] Gestão financeira
- [x] Resolução de disputas
- [x] Relatórios avançados
- [x] Histórico de auditoria
- [x] WebSocket para notificações
- [x] Exportação de dados (CSV/JSON)
- [x] Layout responsivo
- [x] Proteção de rotas
- [x] Logs de auditoria
- [ ] Configurações do sistema (placeholder)
- [ ] Gráficos interativos
- [ ] Exportação em PDF

---

**Última Atualização**: 06 de Novembro de 2025  
**Versão**: 1.0.0  
**Autor**: Sistema ChamadoPro
