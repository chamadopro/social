# 📘 ARQUITETURA CHAMADOPRO ADMIN - PLANO DE IMPLEMENTAÇÃO POR FASES

## 🎯 Objetivo
Documentar a implementação gradual do sistema administrativo ChamadoPro, partindo de uma solução simples e escalável (Fase 1) para uma arquitetura completa e independente (Fase 2).

---

## 📋 FASE 1: Sistema Administrativo Integrado (Implementação Inicial)

### **Visão Geral**
Sistema administrativo como parte da mesma aplicação, usando rotas protegidas e middleware de autenticação. Ideal para começar rapidamente e validar funcionalidades.

### **Estrutura**
```
chamadopro/
├── frontend/
│   └── src/
│       └── app/
│           ├── admin/              # ← NOVA: Área administrativa
│           │   ├── layout.tsx      # Layout específico admin
│           │   ├── dashboard/       # Dashboard principal
│           │   ├── usuarios/        # Gestão de usuários
│           │   ├── posts/           # Moderação de posts
│           │   ├── financeiro/      # Gestão financeira
│           │   ├── disputas/        # Resolução de disputas
│           │   └── configuracoes/   # Configurações do sistema
│           └── (rotas públicas/normais)
├── backend/
│   └── src/
│       ├── routes/
│       │   └── admin.ts            # ← NOVA: Rotas administrativas
│       ├── controllers/
│       │   └── AdminController.ts # ← JÁ EXISTE
│       └── middleware/
│           └── adminAuth.ts       # ← NOVA: Middleware para verificar admin
└── (estrutura atual mantida)
```

### **Implementação Técnica**

#### **1. Middleware de Autenticação Admin**
```typescript
// backend/src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import { authenticate } from './auth';

export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Primeiro verifica autenticação normal
  await authenticate(req, res, () => {
    // Depois verifica se é admin
    const user = (req as any).user;
    
    if (!user || user.tipo !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Acesso negado. Apenas administradores podem acessar esta área.'
      });
      return;
    }
    
    next();
  });
};
```

#### **2. Rotas Administrativas**
```typescript
// backend/src/routes/admin.ts
import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth';
import { AdminController } from '../controllers/AdminController';

const router = Router();
const adminController = new AdminController();

// Todas as rotas requerem autenticação admin
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Gestão de Usuários
router.get('/usuarios', adminController.listUsuarios);
router.get('/usuarios/:id', adminController.getUsuario);
router.put('/usuarios/:id/verificar', adminController.verificarUsuario);
router.put('/usuarios/:id/desativar', adminController.desativarUsuario);

// Moderação de Posts
router.get('/posts', adminController.listPosts);
router.delete('/posts/:id', adminController.removerPost);
router.put('/posts/:id/ocultar', adminController.ocultarPost);

// Gestão Financeira
router.get('/financeiro', adminController.getFinanceiro);
router.put('/pagamentos/:id/liberar', adminController.liberarPagamento);

// Disputas
router.get('/disputas', adminController.listDisputas);
router.put('/disputas/:id/resolver', adminController.resolverDisputa);

export default router;
```

#### **3. Layout Admin no Frontend**
```typescript
// frontend/src/app/admin/layout.tsx
'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || user?.tipo !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.tipo !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      {/* Sidebar Admin */}
      {/* Content */}
      {children}
    </div>
  );
}
```

#### **4. Páginas Administrativas**
- `/admin/dashboard` - Visão geral, estatísticas, gráficos
- `/admin/usuarios` - Lista, busca, verificação, desativação
- `/admin/posts` - Moderação, remoção, ocultação
- `/admin/financeiro` - Liberação de pagamentos, relatórios
- `/admin/disputas` - Resolução de disputas
- `/admin/configuracoes` - Configurações do sistema

### **Vantagens da Fase 1**
✅ **Rápido de implementar** - Usa estrutura existente  
✅ **Fácil manutenção** - Código no mesmo repositório  
✅ **Compartilha autenticação** - Mesmo sistema de login  
✅ **Sem overhead** - Não precisa de deploy separado  
✅ **Ideal para MVP** - Valida funcionalidades rapidamente  

### **Limitações da Fase 1**
⚠️ **Código misturado** - Admin e App no mesmo código  
⚠️ **Deploy acoplado** - Mudanças em admin afetam app  
⚠️ **Escalabilidade limitada** - Dificulta escalar admin separadamente  

### **Quando Migrar para Fase 2**
- Time administrativo > 5 pessoas
- Necessidade de deploy independente do admin
- Requisitos de segurança específicos (2FA, IP whitelist)
- Volume de operações administrativas muito alto
- Necessidade de isolamento completo

---

## 🚀 FASE 2: Sistema Administrativo Independente (Escalabilidade)

### **Visão Geral**
Sistema completamente separado, com seu próprio frontend, backend, autenticação e deploy. Compartilha apenas o banco de dados.

### **Estrutura**
```
chamadopro/
├── frontend-app/           # Sistema público (usuários)
├── frontend-admin/         # Painel administrativo (separado)
├── backend-app/            # API pública
├── backend-admin/          # API administrativa
├── shared/                 # Tipos e utilitários comuns
│   ├── types/
│   ├── utils/
│   └── config/
├── database/
│   ├── prisma/
│   ├── migrations/
│   └── seeds/
└── docker-compose.yml
```

### **Implementação Técnica**

#### **1. Banco de Dados - Schemas Separados**
```sql
-- Criar schemas
CREATE SCHEMA app;
CREATE SCHEMA admin;

-- Mover tabelas existentes para schema app
ALTER TABLE usuarios SET SCHEMA app;
ALTER TABLE posts SET SCHEMA app;
ALTER TABLE contratos SET SCHEMA app;
ALTER TABLE pagamentos SET SCHEMA app;
-- ... (demais tabelas)

-- Criar tabelas administrativas no schema admin
CREATE TABLE admin.admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT REFERENCES app.usuarios(id),
  acao TEXT NOT NULL,
  alvo TEXT,
  ip VARCHAR(45),
  data TIMESTAMP DEFAULT NOW()
);

CREATE TABLE admin.auditoria (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  referencia_id INT,
  admin_id INT REFERENCES app.usuarios(id),
  detalhes JSONB,
  data TIMESTAMP DEFAULT NOW()
);
```

#### **2. Roles e Permissões**
```sql
-- Criar roles
CREATE ROLE app_user;
CREATE ROLE admin_user;
CREATE ROLE service_user;

-- Permissões para app_user (usuários normais)
GRANT USAGE ON SCHEMA app TO app_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA app TO app_user;
REVOKE ALL ON SCHEMA admin FROM app_user;

-- Permissões para admin_user
GRANT USAGE ON SCHEMA app TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO admin_user;
GRANT USAGE ON SCHEMA admin TO admin_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA admin TO admin_user;

-- Aplicar roles aos usuários
ALTER USER usuario123 SET ROLE app_user;
ALTER USER admin456 SET ROLE admin_user;
```

#### **3. Backend Admin Independente**
```typescript
// backend-admin/src/server.ts
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_ADMIN // Conexão com role admin_user
    }
  }
});

// Middleware específico admin
app.use(cors({
  origin: process.env.ADMIN_FRONTEND_URL, // Apenas origem do admin
  credentials: true
}));

// Rotas administrativas
app.use('/api/admin', adminRoutes);

// Iniciar servidor na porta 4001
app.listen(4001, () => {
  console.log('Admin API rodando na porta 4001');
});
```

#### **4. Frontend Admin Independente**
```typescript
// frontend-admin/src/app/layout.tsx
// Sistema completamente separado, com seu próprio layout
// Não depende de componentes do frontend-app
```

#### **5. Autenticação Independente**
```typescript
// backend-admin/src/controllers/AuthController.ts
export class AdminAuthController {
  async login(req: Request, res: Response) {
    // Login específico para admin
    // Gera token com role: 'admin'
    // Requer 2FA se configurado
  }
}
```

### **Configuração Docker Compose**
```yaml
version: "3.9"
services:
  # Sistema Público
  app:
    build: ./frontend-app
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api-app:3001/api

  api-app:
    build: ./backend-app
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL_APP}

  # Sistema Administrativo
  admin:
    build: ./frontend-admin
    ports:
      - "4000:4000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api-admin:4001/api

  api-admin:
    build: ./backend-admin
    ports:
      - "4001:4001"
    environment:
      - DATABASE_URL=${DATABASE_URL_ADMIN}

  # Banco Compartilhado
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: chamadoprodb
      POSTGRES_USER: chamadopro
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### **Variáveis de Ambiente**

#### **Backend App**
```env
DATABASE_URL=postgresql://app_user:senha@db:5432/chamadoprodb?schema=app
NODE_ENV=production
```

#### **Backend Admin**
```env
DATABASE_URL=postgresql://admin_user:senha@db:5432/chamadoprodb?schema=app&schema=admin
NODE_ENV=production
ADMIN_FRONTEND_URL=https://admin.chamadopro.com.br
```

### **Vantagens da Fase 2**
✅ **Isolamento completo** - Admin e App totalmente separados  
✅ **Deploy independente** - Atualizações não afetam o outro  
✅ **Segurança aprimorada** - Schemas e roles separados  
✅ **Escalabilidade** - Pode escalar admin separadamente  
✅ **Manutenção facilitada** - Códigos independentes  

### **Desafios da Fase 2**
⚠️ **Complexidade maior** - Mais serviços para gerenciar  
⚠️ **Migração necessária** - Precisa migrar dados para schemas  
⚠️ **CI/CD mais complexo** - Múltiplos deploys  
⚠️ **Custo maior** - Mais recursos (servidores, DNS, etc)  

---

## 📊 Comparação: Fase 1 vs Fase 2

| Aspecto | Fase 1 | Fase 2 |
|---------|--------|--------|
| **Tempo de implementação** | 1-2 semanas | 1-2 meses |
| **Complexidade** | Baixa | Alta |
| **Custo inicial** | Baixo | Médio-Alto |
| **Manutenção** | Fácil (código unificado) | Média (códigos separados) |
| **Segurança** | Boa | Excelente |
| **Escalabilidade** | Limitada | Alta |
| **Deploy** | Juntos | Independentes |
| **Ideal para** | MVP, pequenos times | Produção, times grandes |

---

## 🔄 Plano de Migração: Fase 1 → Fase 2

### **Passo 1: Preparação (1 semana)**
1. Criar estrutura de diretórios separada
2. Copiar código relevante para novos diretórios
3. Configurar ambiente de desenvolvimento

### **Passo 2: Banco de Dados (1 semana)**
1. Criar schemas `app` e `admin`
2. Migrar tabelas existentes para schema `app`
3. Criar tabelas administrativas no schema `admin`
4. Criar roles e aplicar permissões
5. Testar migração em ambiente de staging

### **Passo 3: Backend Admin (2 semanas)**
1. Criar novo backend-admin
2. Migrar controllers e rotas
3. Configurar autenticação independente
4. Implementar middleware de segurança
5. Testes de integração

### **Passo 4: Frontend Admin (2 semanas)**
1. Criar novo frontend-admin
2. Migrar componentes e páginas
3. Configurar roteamento
4. Ajustar estilos e layout
5. Testes E2E

### **Passo 5: Deploy e Testes (1 semana)**
1. Configurar Docker Compose
2. Deploy em staging
3. Testes completos
4. Deploy em produção
5. Monitoramento

### **Passo 6: Desativação Fase 1 (1 semana)**
1. Redirecionar rotas `/admin` para novo sistema
2. Desativar código antigo
3. Limpeza de código
4. Documentação final

**Tempo total estimado: 7-8 semanas**

---

## 🎯 Recomendação Final

### **Começar com Fase 1 quando:**
- ✅ Sistema está em desenvolvimento/MVP
- ✅ Time administrativo pequeno (< 5 pessoas)
- ✅ Precisa de funcionalidades admin rapidamente
- ✅ Orçamento/recursos limitados

### **Migrar para Fase 2 quando:**
- ✅ Sistema em produção estável
- ✅ Time administrativo cresceu (> 5 pessoas)
- ✅ Necessidade de deploy independente
- ✅ Requisitos de segurança específicos
- ✅ Volume alto de operações administrativas

---

## 📝 Checklist de Implementação - Fase 1

### **Backend**
- [ ] Criar middleware `requireAdmin`
- [ ] Criar rotas `/api/admin/*`
- [ ] Implementar endpoints de dashboard
- [ ] Implementar gestão de usuários
- [ ] Implementar moderação de posts
- [ ] Implementar gestão financeira
- [ ] Implementar resolução de disputas
- [ ] Adicionar logs de auditoria

### **Frontend**
- [ ] Criar layout `/admin`
- [ ] Criar página `/admin/dashboard`
- [ ] Criar página `/admin/usuarios`
- [ ] Criar página `/admin/posts`
- [ ] Criar página `/admin/financeiro`
- [ ] Criar página `/admin/disputas`
- [ ] Criar página `/admin/configuracoes`
- [ ] Implementar componentes reutilizáveis

### **Banco de Dados**
- [ ] Adicionar campo `tipo: 'ADMIN'` se necessário
- [ ] Criar índices para queries administrativas
- [ ] Criar views para relatórios (opcional)

### **Segurança**
- [ ] Verificar autenticação em todas as rotas
- [ ] Implementar rate limiting para admin
- [ ] Adicionar logs de acesso
- [ ] Configurar CORS adequadamente

---

## 📝 Checklist de Implementação - Fase 2

### **Estrutura**
- [ ] Criar diretórios separados
- [ ] Configurar monorepo ou repositórios separados
- [ ] Configurar Docker Compose

### **Banco de Dados**
- [ ] Criar schemas `app` e `admin`
- [ ] Migrar tabelas para schema `app`
- [ ] Criar tabelas no schema `admin`
- [ ] Criar roles e permissões
- [ ] Testar permissões

### **Backend Admin**
- [ ] Criar projeto backend-admin
- [ ] Configurar Prisma com schema correto
- [ ] Migrar controllers
- [ ] Implementar autenticação independente
- [ ] Configurar CORS restritivo
- [ ] Implementar 2FA (opcional)

### **Frontend Admin**
- [ ] Criar projeto frontend-admin
- [ ] Migrar componentes
- [ ] Configurar roteamento
- [ ] Ajustar layout e estilos
- [ ] Configurar variáveis de ambiente

### **Deploy**
- [ ] Configurar CI/CD para ambos sistemas
- [ ] Configurar DNS (subdomínio admin)
- [ ] Configurar SSL/HTTPS
- [ ] Configurar monitoramento
- [ ] Documentar processo de deploy

---

## 🔐 Considerações de Segurança (Ambas Fases)

### **Fase 1**
- Verificar `user.tipo === 'ADMIN'` em todas as rotas
- Rate limiting específico para rotas admin
- Logs de todas as ações administrativas
- IP whitelist (opcional)

### **Fase 2**
- Schemas separados no banco
- Roles SQL com permissões restritas
- Autenticação independente com 2FA
- CORS restritivo (apenas domínio admin)
- Logs imutáveis de auditoria
- Backup separado do schema admin

---

## 📚 Documentação Adicional Necessária

1. **API Admin** - Documentação Swagger/OpenAPI
2. **Guia de Uso** - Manual para administradores
3. **Procedimentos** - Como resolver disputas, verificar usuários, etc.
4. **Troubleshooting** - Problemas comuns e soluções
5. **Roadmap** - Funcionalidades futuras planejadas

---

## ✅ Conclusão

A **Fase 1** é ideal para começar rapidamente e validar funcionalidades. A **Fase 2** oferece isolamento completo e escalabilidade, mas requer mais tempo e recursos.

**Recomendação:** Começar com Fase 1, monitorar uso e migrar para Fase 2 quando necessário (critérios definidos acima).

