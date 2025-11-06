# 📋 SISTEMA DE DISPUTAS COM VALIDAÇÃO DE PAGAMENTO

## 📌 Status: **✅ IMPLEMENTADO**

---

## 🎯 Objetivo

Implementar sistema completo de disputas com validação crítica: **SÓ pode abrir disputa se o pagamento foi feito pela plataforma ChamadoPro**. Serviços fechados fora da plataforma não têm garantia da ChamadoPro.

---

## 📋 Funcionalidades Implementadas

### 1. **Fotos de Evidência (Antes/Depois)**

#### **Descrição**
- Cliente e prestador devem tirar fotos ao iniciar e finalizar o serviço
- Fotos são essenciais para comprovar estado inicial e final
- Obrigatórias para possíveis disputas futuras

#### **Implementação**
- **Ao iniciar**: Upload de fotos "ANTES" (estado inicial)
- **Ao finalizar**: Upload de fotos "DEPOIS" (estado final)
- Fotos armazenadas no campo `fotos_antes` e `fotos_depois` do contrato

---

### 2. **Validação Crítica de Disputa**

#### **Regra Principal**
⚠️ **SÓ pode abrir disputa se:**
1. ✅ Pagamento foi feito pela plataforma (status `PAGO` ou `AGUARDANDO_LIBERACAO`)
2. ✅ Serviço foi iniciado pela plataforma (`data_inicio` existe)
3. ✅ Contrato não está cancelado
4. ✅ Não existe disputa em andamento

#### **Validações Implementadas**
```typescript
// 1. Verificar se pagamento existe
if (!contrato.pagamento) {
  throw badRequest('Não é possível abrir disputa. Este serviço não possui pagamento registrado na plataforma. A ChamadoPro não se responsabiliza por serviços fechados fora da plataforma.');
}

// 2. Verificar se pagamento foi pela plataforma
if (contrato.pagamento.status !== 'PAGO' && contrato.pagamento.status !== 'AGUARDANDO_LIBERACAO') {
  throw badRequest('Não é possível abrir disputa. O pagamento não foi realizado pela plataforma. A ChamadoPro só garante serviços com pagamento feito através da plataforma.');
}

// 3. Verificar se serviço foi iniciado
if (!contrato.data_inicio) {
  throw badRequest('Não é possível abrir disputa. O serviço precisa ter sido iniciado pela plataforma.');
}
```

#### **Mensagens ao Usuário**
- **Sem pagamento na plataforma**: "A ChamadoPro não se responsabiliza por serviços fechados fora da plataforma."
- **Pagamento não pela plataforma**: "A ChamadoPro só garante serviços com pagamento feito através da plataforma."
- **Serviço não iniciado**: "O serviço precisa ter sido iniciado pela plataforma."

---

### 3. **Fluxo de Disputa**

#### **Quando pode abrir disputa:**
- Serviço está `CONCLUIDO`
- Pagamento está `AGUARDANDO_LIBERACAO` ou `LIBERADO`
- Cliente ou Prestador discordam sobre a qualidade/conclusão

#### **O que acontece ao abrir disputa:**
1. Contrato muda status para `DISPUTADO`
2. Pagamento muda status para `DISPUTADO` (bloqueia liberação)
3. Notificação enviada para todos os admins/moderadores
4. Admin pode analisar e resolver

---

### 4. **Componentes Frontend Criados**

#### **ModalIniciarServico.tsx**
- Modal para iniciar serviço com upload de fotos "antes"
- Preview das fotos selecionadas
- Validação e upload

#### **ModalFinalizarServico.tsx**
- Modal para finalizar serviço com upload de fotos "depois"
- Mostra mensagem sobre liberação de pagamento
- Preview das fotos selecionadas

#### **ModalAbrirDisputa.tsx**
- Modal completo para abrir disputa
- Seleção de tipo de disputa
- Descrição detalhada (mínimo 10 caracteres)
- Upload de evidências (fotos)
- **Aviso importante** sobre garantia apenas para pagamentos pela plataforma
- Validação de campos

---

## 📊 Estrutura de Dados

### **Campos Adicionados ao Contrato**
```prisma
model Contrato {
  // ... campos existentes ...
  
  // Campos para fotos de evidência
  fotos_antes  String[] @default([]) // Fotos do estado inicial do serviço
  fotos_depois String[] @default([]) // Fotos do estado final do serviço
}
```

### **Modelo Disputa (já existia)**
```prisma
model Disputa {
  id             String        @id @default(uuid())
  contrato_id    String        @unique
  cliente_id     String
  prestador_id   String
  moderador_id   String?
  tipo           TipoDisputa
  descricao      String
  evidencias     String[]
  status         StatusDisputa @default(ABERTA)
  decisao        String?
  data_criacao   DateTime      @default(now())
  data_resolucao DateTime?
}
```

---

## 🛠️ Backend - Endpoints Atualizados

### **1. POST `/api/contratos/:id/iniciar`**
- ✅ Aceita `fotos_antes` (array de URLs)
- ✅ Valida e armazena fotos
- ✅ Mantém todas as validações anteriores

### **2. POST `/api/contratos/:id/concluir`**
- ✅ Aceita `fotos_depois` (array de URLs)
- ✅ Valida e armazena fotos
- ✅ Mantém lógica de liberação de pagamento

### **3. POST `/api/disputas`** (Atualizado)
- ✅ **Validação crítica de pagamento pela plataforma**
- ✅ Verifica se serviço foi iniciado
- ✅ Valida tipo e descrição
- ✅ Atualiza status do contrato e pagamento para `DISPUTADO`
- ✅ Envia notificações para admins/moderadores

### **4. GET `/api/disputas`** (Atualizado)
- ✅ Permite cliente/prestador ver suas próprias disputas
- ✅ Admin/moderador vê todas

---

## 🎨 Frontend - Componentes

### **1. AndamentosServicosTable.tsx** (Atualizado)
- ✅ Botões "Iniciar" e "Finalizar" abrem modais com upload de fotos
- ✅ Botão "Abrir Disputa" aparece quando serviço está concluído
- ✅ Integração com todos os modais

### **2. ModalIniciarServico.tsx** (Novo)
- Upload de múltiplas fotos
- Preview antes de enviar
- Remoção de fotos
- Mensagem sobre importância das fotos

### **3. ModalFinalizarServico.tsx** (Novo)
- Upload de múltiplas fotos
- Mensagem sobre liberação de pagamento
- Preview antes de enviar
- Remoção de fotos

### **4. ModalAbrirDisputa.tsx** (Novo)
- Seleção de tipo de disputa
- Campo de descrição (validação mínimo 10 caracteres)
- Upload de evidências
- **Aviso sobre garantia apenas para pagamentos pela plataforma**
- Validação completa antes de enviar

---

## 🔄 Fluxo Completo

### **Cenário 1: Serviço com Pagamento pela Plataforma**
```
1. Cliente aceita orçamento → Contrato criado, Pagamento PAGO
2. Cliente ou Prestador inicia → Upload fotos ANTES → Status: EM_EXECUCAO
3. Prestador trabalha...
4. Prestador ou Cliente finaliza → Upload fotos DEPOIS → Status: CONCLUIDO
5. Se houver discordância → Abre disputa ✅ (permitido - pagamento pela plataforma)
6. Admin analisa fotos antes/depois e resolve
```

### **Cenário 2: Serviço Fechado Fora da Plataforma**
```
1. Cliente aceita orçamento → Contrato criado, MAS sem pagamento pela plataforma
2. Cliente paga diretamente ao prestador (fora da plataforma)
3. Tentativa de abrir disputa → ❌ BLOQUEADO
   Mensagem: "A ChamadoPro não se responsabiliza por serviços fechados fora da plataforma."
```

### **Cenário 3: Disputa Aberta**
```
1. Disputa criada → Contrato: DISPUTADO, Pagamento: DISPUTADO
2. Notificação enviada para admins/moderadores
3. Admin analisa:
   - Fotos antes/depois
   - Descrição da disputa
   - Evidências adicionais
4. Admin resolve → Decide favor do cliente ou prestador
5. Pagamento liberado conforme decisão
```

---

## 📌 Checklist de Implementação

### **Backend** ✅
- [x] Adicionar campos `fotos_antes` e `fotos_depois` ao modelo Contrato
- [x] Criar migration para campos de fotos
- [x] Atualizar endpoint `POST /api/contratos/:id/iniciar` para aceitar fotos
- [x] Atualizar endpoint `POST /api/contratos/:id/concluir` para aceitar fotos
- [x] Atualizar `DisputaController.createDisputa` com validação crítica:
  - [x] Verificar se pagamento existe
  - [x] Verificar se pagamento foi pela plataforma
  - [x] Verificar se serviço foi iniciado
  - [x] Mensagens de erro claras
- [x] Atualizar status do contrato e pagamento para DISPUTADO
- [x] Notificações para admins/moderadores
- [x] Atualizar rota GET `/api/disputas` para permitir cliente/prestador

### **Frontend** ✅
- [x] Criar `ModalIniciarServico.tsx` com upload de fotos
- [x] Criar `ModalFinalizarServico.tsx` com upload de fotos
- [x] Criar `ModalAbrirDisputa.tsx` completo
- [x] Atualizar `AndamentosServicosTable.tsx`:
  - [x] Integrar modais de iniciar/finalizar
  - [x] Adicionar botão "Abrir Disputa"
  - [x] Condições para mostrar botão de disputa
- [x] Validações e mensagens de erro no frontend

---

## ⚠️ Regras Importantes

### **1. Garantia da ChamadoPro**
- ✅ **COM garantia**: Pagamento feito pela plataforma (dinheiro retido)
- ❌ **SEM garantia**: Serviço fechado fora da plataforma (apenas conexão)

### **2. Fotos Obrigatórias**
- 📸 Fotos "antes" são essenciais para comprovar estado inicial
- 📸 Fotos "depois" são essenciais para comprovar conclusão
- 📸 Fotos ajudam admin a resolver disputas

### **3. Disputa**
- Pode ser aberta por cliente OU prestador
- Só pode abrir se pagamento foi pela plataforma
- Bloqueia liberação de pagamento até resolução
- Admin resolve e decide favor de quem

---

## 📚 Referências

- **Contratos**: `backend/src/controllers/ContratoController.ts`
- **Disputas**: `backend/src/controllers/DisputaController.ts`
- **Schema**: `backend/prisma/schema.prisma`
- **Migration**: `backend/prisma/migrations/20251104085733_add_fotos_contrato/migration.sql`
- **Componentes**: 
  - `frontend/src/components/ModalIniciarServico.tsx`
  - `frontend/src/components/ModalFinalizarServico.tsx`
  - `frontend/src/components/ModalAbrirDisputa.tsx`
  - `frontend/src/components/AndamentosServicosTable.tsx`

---

**Última atualização**: 04/11/2025
**Status**: ✅ **IMPLEMENTADO** - Migration aplicada com sucesso

