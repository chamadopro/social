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

#### Páginas
- `/admin/login` - Login administrativo
- `/admin/dashboard` - Dashboard principal
- `/admin/usuarios` - Gerenciamento de usuários
- `/admin/posts` - Moderação de posts
- `/admin/financeiro` - Gestão financeira
- `/admin/disputas` - Resolução de disputas
- `/admin/relatorios` - Relatórios avançados
- `/admin/auditoria` - Histórico de auditoria
- `/admin/configuracoes` - Configurações do sistema

---

## ⚙️ Funcionalidades Implementadas

### 1. Dashboard (`/admin/dashboard`)

**Funcionalidades**:
- ✅ Estatísticas gerais (usuários, posts, pagamentos, disputas)
- ✅ Receitas financeiras (total, pendentes, liberadas)
- ✅ Cards com métricas principais
- ✅ Links rápidos para outras seções
- ✅ Atualização em tempo real

**Endpoints**:
- `GET /api/admin/dashboard` - Retorna estatísticas e receitas

### 2. Gerenciamento de Usuários (`/admin/usuarios`)

**Funcionalidades**:
- ✅ Listagem paginada de usuários
- ✅ Busca por nome/email
- ✅ Filtros por status (ATIVO, INATIVO, BLOQUEADO) e tipo (CLIENTE, PRESTADOR, ADMIN)
- ✅ Ativação/Desativação de usuários
- ✅ Visualização de detalhes do usuário

**Endpoints**:
- `GET /api/admin/usuarios` - Lista usuários com paginação e filtros
- `PATCH /api/admin/usuarios/:id/toggle` - Ativa/desativa usuário

**Ações**:
- **Ativar/Desativar**: Alterna o status do usuário entre ATIVO e INATIVO

### 3. Moderação de Posts (`/admin/posts`)

**Funcionalidades**:
- ✅ Listagem paginada de posts
- ✅ Busca por título/descrição
- ✅ Filtros por status (ATIVO, ARQUIVADO, CANCELADO, INATIVO)
- ✅ Visualização de detalhes do post
- ✅ Arquivar/Restaurar posts
- ✅ Remover posts permanentemente

**Endpoints**:
- `GET /api/admin/posts` - Lista posts com paginação e filtros
- `PATCH /api/admin/posts/:id/toggle` - Arquivar/restaurar post
- `DELETE /api/admin/posts/:id` - Remove post permanentemente

**Ações**:
- **Arquivar**: Marca o post como ARQUIVADO (oculto da visualização)
- **Restaurar**: Restaura post arquivado para ATIVO
- **Remover**: Exclui permanentemente o post do banco

### 4. Gestão Financeira (`/admin/financeiro`)

**Funcionalidades**:
- ✅ Listagem de pagamentos
- ✅ Filtros por status (PENDENTE, LIBERADO, CANCELADO)
- ✅ Busca por ID do pagamento ou usuário
- ✅ Liberação manual de pagamentos
- ✅ Visualização de detalhes do pagamento

**Endpoints**:
- `GET /api/admin/pagamentos` - Lista pagamentos com paginação e filtros
- `POST /api/admin/pagamentos/:id/liberar` - Libera pagamento pendente

**Ações**:
- **Liberar Pagamento**: Altera status de PENDENTE para LIBERADO e processa o pagamento

### 5. Resolução de Disputas (`/admin/disputas`)

**Funcionalidades**:
- ✅ Listagem de disputas
- ✅ Filtros por status (ABERTA, EM_ANALISE, RESOLVIDA, CANCELADA)
- ✅ Visualização detalhada da disputa
- ✅ Resolução com decisão (FAVOR_CLIENTE, FAVOR_PRESTADOR, DIVIDIR_VALOR)
- ✅ Observações para auditoria

**Endpoints**:
- `GET /api/admin/disputas` - Lista disputas com paginação e filtros
- `POST /api/admin/disputas/:id/resolver` - Resolve disputa com decisão

**Ações**:
- **Resolver Disputa**: 
  - Define decisão (FAVOR_CLIENTE, FAVOR_PRESTADOR, DIVIDIR_VALOR)
  - Adiciona observações (gravadas no log de auditoria)
  - Marca disputa como RESOLVIDA
  - Registra no log de auditoria

### 6. Relatórios Avançados (`/admin/relatorios`)

**Funcionalidades**:
- ✅ Seleção de tipo de relatório (Geral, Usuários, Financeiro, Posts)
- ✅ Seleção de período (7 dias, 30 dias, 90 dias, 1 ano, Todo o período)
- ✅ Visualização de dados em cards
- ✅ Gráficos simples (texto/HTML)
- ✅ Exportação de dados (CSV/JSON)

**Endpoints**:
- `GET /api/admin/relatorios/avancados` - Retorna relatórios detalhados
- `POST /api/admin/exportar` - Exporta dados em CSV ou JSON

**Tipos de Relatório**:
- **Geral**: Visão geral do sistema
- **Usuários**: Estatísticas de usuários (crescimento, tipos, etc.)
- **Financeiro**: Receitas, pagamentos, crescimento
- **Posts**: Estatísticas de posts por período

**Formato de Exportação**:
- CSV: Para análise em planilhas
- JSON: Para integração com outras ferramentas

### 7. Auditoria (`/admin/auditoria`)

**Funcionalidades**:
- ✅ Listagem de logs de auditoria
- ✅ Filtros por ação, usuário e data
- ✅ Busca por ID de usuário
- ✅ Visualização detalhada dos logs

**Endpoints**:
- `GET /api/admin/auditoria` - Lista logs de auditoria com paginação e filtros

**Tipos de Logs Registrados**:
- Alterações de usuários
- Moderação de posts
- Liberação de pagamentos
- Resolução de disputas
- Acessos administrativos
- Exportação de dados
- E outras ações administrativas

### 8. Configurações (`/admin/configuracoes`)

**Funcionalidades**:
- ⚠️ Página placeholder (a ser implementada)

**Planejado**:
- Configurações gerais do sistema
- Parâmetros de negócio
- Configurações de email
- Integrações externas

---

## 🔌 Endpoints da API

### Autenticação
Todas as rotas requerem autenticação via JWT token no header:
```
Authorization: Bearer <token>
```

### Dashboard
```
GET /api/admin/dashboard
```
Retorna estatísticas gerais e receitas.

### Usuários
```
GET /api/admin/usuarios?page=1&limit=20&search=&status=&tipo=
GET /api/admin/usuarios/:id/toggle
```

### Posts
```
GET /api/admin/posts?page=1&limit=20&search=&status=
PATCH /api/admin/posts/:id/toggle
DELETE /api/admin/posts/:id
```

### Financeiro
```
GET /api/admin/pagamentos?page=1&limit=20&status=&search=
POST /api/admin/pagamentos/:id/liberar
```

### Disputas
```
GET /api/admin/disputas?page=1&limit=20&status=&search=
POST /api/admin/disputas/:id/resolver
Body: { decisao: 'FAVOR_CLIENTE' | 'FAVOR_PRESTADOR' | 'DIVIDIR_VALOR', observacoes?: string }
```

### Relatórios
```
GET /api/admin/relatorios/avancados?tipo=geral&periodo=30
POST /api/admin/exportar
Body: { tipo: 'usuarios' | 'posts' | 'pagamentos' | 'disputas', formato: 'csv' | 'json', periodo?: number }
```

### Auditoria
```
GET /api/admin/auditoria?page=1&limit=20&acao=&usuarioId=&dataInicio=&dataFim=
```

---

## 🎨 Componentes Frontend

### Layout Principal (`AdminLayout`)
- **Sidebar**: Menu lateral com navegação
- **Header**: Cabeçalho com informações do admin
- **Proteção de Rotas**: Verificação automática de autenticação
- **Responsivo**: Adaptável para mobile e desktop

### Páginas

#### `AdminLoginPage`
- Formulário de login
- Validação de credenciais
- Redirecionamento automático se já autenticado

#### `AdminDashboard`
- Cards com estatísticas
- Links rápidos
- Atualização automática de dados

#### `AdminUsers`
- Tabela paginada
- Filtros e busca
- Ações de ativação/desativação

#### `AdminPosts`
- Tabela paginada
- Filtros por status
- Ações de arquivar/remover

#### `AdminFinanceiro`
- Tabela de pagamentos
- Filtros e busca
- Ação de liberar pagamento

#### `AdminDisputas`
- Tabela de disputas
- Modal de resolução
- Filtros por status

#### `AdminRelatorios`
- Seletores de tipo e período
- Visualização de dados
- Botões de exportação

#### `AdminAuditoria`
- Tabela de logs
- Filtros avançados
- Busca por usuário/data

---

## 🔔 WebSocket e Notificações em Tempo Real

### Implementação
- **Backend**: Socket.IO integrado ao `NotificationService`
- **Frontend**: Cliente Socket.IO no `AdminLayout`

### Funcionalidades
- ✅ Conexão automática ao autenticar
- ✅ Notificações em tempo real para admins
- ✅ Sala específica para administradores (`admins`)
- ✅ Reconexão automática em caso de desconexão

### Eventos
- `join_admin`: Admin entra na sala de administradores
- `leave_admin`: Admin sai da sala
- `admin_notification`: Notificação recebida (exibe toast)

### Notificações Enviadas
- Novos usuários registrados
- Novos posts criados
- Pagamentos pendentes
- Disputas abertas
- E outras ações importantes do sistema

### Configuração
**Backend** (`backend/src/server.ts`):
```typescript
socket.on('join_admin', (adminId: string) => {
  socket.join(`admin_${adminId}`);
  socket.join('admins');
});
```

**Frontend** (`frontend/src/app/admin/layout.tsx`):
```typescript
socket.emit('join_admin', userId);
socket.on('admin_notification', (data) => {
  addToast({ type: data.type, title: data.title, description: data.message });
});
```

---

## 🔧 Configuração e Deploy

### Variáveis de Ambiente

#### Backend (`.env`)
```env
# JWT
JWT_SECRET=seu_jwt_secret_aqui

# Database
DATABASE_URL=postgresql://...

# Socket.IO
FRONTEND_URL=http://192.168.15.5:3000

# Logs (opcional)
DEBUG_SOCKET=false  # true para logs detalhados de WebSocket
LOG_LEVEL=info
```

#### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://192.168.15.5:3001/api
NEXT_PUBLIC_SOCKET_URL=http://192.168.15.5:3001
```

### Prisma Database
O sistema usa o mesmo banco de dados do sistema principal. Execute as migrations:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Seed de Admin
O usuário admin padrão é criado no seed:
```bash
cd backend
npx prisma db seed
```

### Build e Deploy

#### Frontend
```bash
cd frontend
npm run build
npm start  # ou deploy no servidor
```

#### Backend
```bash
cd backend
npm run build
npm start  # ou PM2/systemd
```

---

## 🔒 Segurança

### Implementações de Segurança

1. **Autenticação JWT**
   - Tokens com expiração
   - Validação em todas as rotas admin

2. **Controle de Acesso (RBAC)**
   - Apenas usuários com `tipo: 'ADMIN'` podem acessar
   - Middleware `requireAdmin` em todas as rotas

3. **Logs de Auditoria**
   - Todas as ações administrativas são registradas
   - Inclui: usuário, ação, dados, IP, timestamp

4. **Validação de Dados**
   - Validação de entrada com Zod
   - Sanitização de dados

5. **Rate Limiting**
   - Proteção contra abuso em produção
   - Desabilitado em desenvolvimento

6. **CORS**
   - Configurado para aceitar apenas origens permitidas
   - Credenciais habilitadas

### Recomendações

1. **Alterar Credenciais Padrão**
   - Mude a senha do admin em produção
   - Use senhas fortes

2. **HTTPS em Produção**
   - Sempre use HTTPS em produção
   - Configure SSL/TLS corretamente

3. **Monitoramento**
   - Monitore logs de auditoria regularmente
   - Configure alertas para ações suspeitas

4. **Backup**
   - Faça backup regular do banco de dados
   - Mantenha logs de auditoria por período adequado

---

## 📝 Logs e Auditoria

### Tipos de Logs

1. **AUDIT**: Ações administrativas
   - Alterações em usuários
   - Moderação de posts
   - Operações financeiras
   - Resolução de disputas

2. **SECURITY**: Eventos de segurança
   - Tentativas de acesso não autorizado
   - Falhas de autenticação
   - Alterações de permissões

3. **PERFORMANCE**: Métricas de performance
   - Tempo de resposta de queries
   - Operações lentas

4. **TRANSACTION**: Transações financeiras
   - Pagamentos processados
   - Liberações de valores

### Formato dos Logs
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

### Localização dos Logs
- **Backend**: `backend/logs/`
  - `combined.log`: Todos os logs
  - `error.log`: Apenas erros

---

## 🐛 Troubleshooting

### Problema: Página em branco / "Carregando..."
- Verificar se o token JWT está válido
- Verificar se o usuário tem `tipo: 'ADMIN'`
- Verificar console do navegador para erros

### Problema: WebSocket não conecta
- Verificar `NEXT_PUBLIC_SOCKET_URL` no frontend
- Verificar CORS no backend
- Verificar se Socket.IO está configurado corretamente

### Problema: Logs muito verbosos
- Definir `DEBUG_SOCKET=false` no backend
- Os logs de WebSocket só aparecem em produção ou com `DEBUG_SOCKET=true`

### Problema: Redirecionamento infinito
- Verificar se não há loop entre login e dashboard
- Verificar estado de autenticação no Zustand

---

## 📚 Documentação Relacionada

- `ARQUITETURA_CHAMADOPRO_ADMIN_FASES.md` - Arquitetura e fases de implementação
- `ARQUITETURA_CHAMADOPRO_ADMIN_BANCO_COMPARTILHADO.md` - Arquitetura com banco compartilhado
- `docs/API_DOCUMENTATION.md` - Documentação da API geral
- `docs/DOCUMENTACAO_TECNICA_CHAMADOPRO_v3.2.md` - Documentação técnica geral

---

## 🚀 Próximos Passos (Fase 2)

Conforme planejado em `ARQUITETURA_CHAMADOPRO_ADMIN_FASES.md`:

1. **Sistema Independente**
   - Backend separado
   - Banco de dados compartilhado
   - Autenticação independente

2. **Funcionalidades Adicionais**
   - Configurações do sistema
   - Gerenciamento de categorias
   - Gerenciamento de taxas
   - Dashboard avançado com gráficos
   - Relatórios personalizados

3. **Melhorias**
   - Cache de dados
   - Otimização de queries
   - Exportação de relatórios em PDF
   - Gráficos interativos

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

