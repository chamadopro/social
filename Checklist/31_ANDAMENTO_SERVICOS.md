# 📋 ANDAMENTO DE SERVIÇOS - MEUS SERVIÇOS

## 📌 Status: **✅ IMPLEMENTADO**

---

## 🎯 Objetivo

Implementar sistema completo de acompanhamento e controle de andamento dos serviços na página "Meus Serviços", permitindo que tanto Clientes quanto Prestadores iniciem e finalizem trabalhos, com controle automático de liberação de pagamentos baseado em quem finaliza o serviço.

---

## 📋 Funcionalidades a Implementar

### 1. **Tabela de Andamentos dos Serviços**

#### **Descrição**
- Exibir uma tabela detalhada com todos os serviços em andamento
- Mostrar informações relevantes: cliente/prestador, serviço, status, datas, valores
- Permitir filtros e ordenação

#### **Campos da Tabela**
- **ID do Serviço/Contrato**
- **Cliente** (nome, avatar)
- **Prestador** (nome, avatar)
- **Tipo de Serviço** (categoria)
- **Status Atual** (ATIVO, EM_EXECUCAO, AGUARDANDO_CONCLUSAO, CONCLUIDO)
- **Data de Início** (quando foi iniciado)
- **Data de Fim** (quando foi finalizado)
- **Valor do Contrato**
- **Status do Pagamento** (PENDENTE, LIBERADO, PAGO)
- **Ações** (botões Start/End conforme permissões)

---

### 2. **Controle de Início e Fim de Trabalho**

#### **Botão "Iniciar Trabalho" (Start)**
- **Quem pode iniciar**: Cliente OU Prestador
- **Quando aparece**: 
  - Contrato com status `ATIVO` e pagamento `PAGO`
  - Ainda não foi iniciado (sem `data_inicio`)
- **Ação**: 
  - Atualiza status do contrato para `EM_EXECUCAO`
  - Registra `data_inicio` no contrato
  - Envia notificação para a outra parte
  - Log de auditoria

#### **Botão "Finalizar Trabalho" (End)**
- **Quem pode finalizar**: Cliente OU Prestador
- **Quando aparece**: 
  - Contrato com status `EM_EXECUCAO`
  - Trabalho já foi iniciado
- **Ação**: 
  - Atualiza status do contrato para `CONCLUIDO`
  - Registra `data_fim` no contrato
  - Registra `quem_finalizou` (CLIENTE ou PRESTADOR)
  - **Dispara lógica de liberação de pagamento** (ver abaixo)
  - Envia notificação para a outra parte
  - Log de auditoria

---

### 3. **Sistema de Liberação de Pagamento**

#### **Regras de Liberação**

##### **Caso 1: Cliente finaliza o trabalho**
- ✅ **Liberação**: **IMEDIATA** (na hora)
- **Ação**:
  - Status do pagamento: `PAGO` → `LIBERADO`
  - `data_liberacao` = `data_fim` (mesmo timestamp)
  - Prestador recebe notificação de liberação
  - Pagamento disponível para saque imediatamente

##### **Caso 2: Prestador finaliza o trabalho**
- ⏰ **Liberação**: **APÓS PERÍODO CONFIGURÁVEL** (padrão: 24 horas)
- **Ação**:
  - Status do pagamento: `PAGO` → `AGUARDANDO_LIBERACAO`
  - `data_liberacao` = `data_fim` + `TEMPO_LIBERACAO_PRESTADOR` (configurável)
  - Cliente recebe notificação e pode confirmar antes do prazo
  - Sistema aguarda período configurável ou confirmação do cliente
  - Após período, libera automaticamente

#### **Configuração Administrativa** ⚠️
- ⚠️ **TEMPO_LIBERACAO_PRESTADOR** deve ser **configurável na tela do Administrador**
- ⚠️ **Valor padrão**: 24 horas (mas pode ser alterado)
- ⚠️ **Implementação**: Criar tela de configurações do admin (tarefa futura)
- ⚠️ **Armazenamento**: Campo em tabela de configurações ou variável de ambiente (preferencialmente banco de dados)

---

### 4. **Abas para Usuário Híbrido (Prestador/Cliente)**

#### **Estrutura**
A página "Meus Serviços" deve ter **abas separadas** quando o usuário for híbrido:

##### **Aba 1: "Trabalho como Prestador"**
- Mostra apenas serviços onde o usuário é **PRESTADOR**
- Filtros: Todos, Ativos, Em Execução, Aguardando, Finalizados, Cancelados
- Estatísticas específicas do prestador
- Tabela de andamentos dos serviços como prestador

##### **Aba 2: "Trabalho como Cliente"**
- Mostra apenas serviços onde o usuário é **CLIENTE**
- Filtros: Todos, Ativos, Em Execução, Aguardando, Finalizados, Cancelados
- Estatísticas específicas do cliente
- Tabela de andamentos dos serviços como cliente

#### **Comportamento**
- **Usuário puro (só Prestador ou só Cliente)**: Não mostra abas, apenas o conteúdo relevante
- **Usuário híbrido**: Mostra abas com toggle entre "Como Prestador" e "Como Cliente"
- **Persistência**: Salvar última aba visualizada no localStorage

---

## 📊 Estrutura de Dados

### **Campos Adicionais no Modelo `Contrato`** (Prisma Schema)

```prisma
model Contrato {
  // ... campos existentes ...
  
  // Novos campos para controle de andamento
  data_inicio            DateTime?  // Quando o trabalho foi iniciado
  data_fim               DateTime?  // Quando o trabalho foi finalizado
  quem_iniciou           String?    // 'CLIENTE' | 'PRESTADOR'
  quem_finalizou          String?    // 'CLIENTE' | 'PRESTADOR'
  aguardando_liberacao    Boolean    @default(false) // Se está aguardando período de liberação
  data_liberacao_prevista DateTime?  // Data prevista para liberação (quando prestador finaliza)
  
  // ... relacionamentos ...
}
```

### **Campos Adicionais no Modelo `Pagamento`** (Prisma Schema)

```prisma
model Pagamento {
  // ... campos existentes ...
  
  // Campo já existe: data_liberacao
  // Mas pode precisar de:
  liberado_por            String?    // 'CLIENTE' | 'PRESTADOR' | 'AUTOMATICO'
  motivo_liberacao        String?    // Descrição do motivo da liberação
}
```

### **Nova Tabela: `ConfiguracoesSistema`** (Prisma Schema)

```prisma
model ConfiguracoesSistema {
  id                      String   @id @default(uuid())
  chave                   String   @unique // Ex: 'TEMPO_LIBERACAO_PRESTADOR'
  valor                   String   // Valor da configuração (ex: "24" para horas)
  descricao               String?  // Descrição do que a configuração faz
  tipo                    String   // 'INTEGER' | 'STRING' | 'BOOLEAN' | 'FLOAT'
  data_criacao            DateTime @default(now())
  data_atualizacao        DateTime @updatedAt
  
  @@map("configuracoes_sistema")
}
```

---

## 🛠️ Backend - Endpoints a Criar

### **1. POST `/api/contratos/:id/iniciar`**
- **Autenticação**: Requerida
- **Permissões**: Cliente OU Prestador do contrato
- **Validações**:
  - Contrato existe e pertence ao usuário
  - Status = `ATIVO`
  - Pagamento = `PAGO`
  - Ainda não foi iniciado
- **Ação**: Marca trabalho como iniciado

### **2. POST `/api/contratos/:id/finalizar`**
- **Autenticação**: Requerida
- **Permissões**: Cliente OU Prestador do contrato
- **Validações**:
  - Contrato existe e pertence ao usuário
  - Status = `EM_EXECUCAO`
  - Trabalho já foi iniciado
- **Ação**: Marca trabalho como concluído e dispara lógica de liberação

### **3. GET `/api/contratos/andamentos`**
- **Autenticação**: Requerida
- **Query Params**:
  - `tipo`: 'PRESTADOR' | 'CLIENTE' (para usuário híbrido)
  - `status`: Filtro por status
  - `page`, `limit`: Paginação
- **Retorno**: Lista de contratos com informações de andamento

### **4. GET `/api/configuracoes/liberacao`**
- **Autenticação**: Não requerida (público)
- **Retorno**: Tempo de liberação configurado (em horas)

### **5. PUT `/api/configuracoes/liberacao`** ⚠️
- **Autenticação**: Requerida (apenas ADMIN)
- **Body**: `{ tempo_horas: number }`
- **Ação**: Atualiza tempo de liberação (apenas admin)
- **⚠️ Implementar depois**: Tela de admin

---

## 🎨 Frontend - Componentes a Criar

### **1. `AndamentosServicosTable.tsx`**
- Componente de tabela para exibir andamentos
- Colunas: ID, Cliente/Prestador, Serviço, Status, Datas, Valor, Ações
- Ações: Botões Start/End conforme permissões

### **2. `ServicoAndamentoCard.tsx`** (opcional)
- Card alternativo para visualização em grid
- Mostra informações resumidas do serviço
- Botões de ação integrados

### **3. `AbasTrabalhoHibrido.tsx`**
- Componente de abas para usuário híbrido
- Toggle entre "Como Prestador" e "Como Cliente"
- Persistência de última aba visualizada

### **4. `ConfirmacaoFinalizacaoModal.tsx`**
- Modal de confirmação ao finalizar trabalho
- Exibe regras de liberação de pagamento
- Botões de confirmação/cancelamento

---

## 📝 Páginas a Modificar

### **1. `frontend/src/app/meus-servicos/page.tsx`**
- Adicionar abas para usuário híbrido
- Integrar tabela de andamentos
- Adicionar botões Start/End
- Filtrar serviços por tipo (Prestador/Cliente)

### **2. `frontend/src/app/meus-posts/page.tsx`** (opcional)
- Pode ter link para visualizar andamentos relacionados

---

## ⚠️ Tarefas Futuras (Admin)

### **1. Tela de Configurações do Administrador**
- Criar página `/admin/configuracoes`
- Permitir editar:
  - ⏰ **TEMPO_LIBERACAO_PRESTADOR** (em horas)
  - Outras configurações futuras
- Validações: apenas valores positivos (mínimo 1 hora recomendado)

### **2. Endpoint Admin**
- `PUT /api/admin/configuracoes/:chave`
- Requer permissão de ADMIN
- Validação de valores

---

## 🔄 Fluxo Completo

### **Cenário 1: Cliente Inicia e Finaliza**
```
1. Cliente aceita orçamento → Contrato criado (ATIVO, PAGO)
2. Cliente clica "Iniciar Trabalho" → Status: EM_EXECUCAO, data_inicio registrada
3. Prestador trabalha...
4. Cliente clica "Finalizar Trabalho" → Status: CONCLUIDO, data_fim registrada
5. Sistema libera pagamento IMEDIATAMENTE → Prestador pode sacar
```

### **Cenário 2: Prestador Inicia e Finaliza**
```
1. Cliente aceita orçamento → Contrato criado (ATIVO, PAGO)
2. Prestador clica "Iniciar Trabalho" → Status: EM_EXECUCAO, data_inicio registrada
3. Prestador trabalha...
4. Prestador clica "Finalizar Trabalho" → Status: CONCLUIDO, data_fim registrada
5. Sistema agenda liberação em 24h (ou tempo configurado)
6. Cliente pode confirmar antes do prazo (libera imediatamente)
7. Após período configurado → Sistema libera automaticamente
```

### **Cenário 3: Cliente Inicia, Prestador Finaliza**
```
1. Cliente aceita orçamento → Contrato criado (ATIVO, PAGO)
2. Cliente clica "Iniciar Trabalho" → Status: EM_EXECUCAO
3. Prestador trabalha...
4. Prestador clica "Finalizar Trabalho" → Status: CONCLUIDO
5. Sistema agenda liberação em 24h (ou tempo configurado)
6. Após período → Sistema libera automaticamente
```

### **Cenário 4: Prestador Inicia, Cliente Finaliza**
```
1. Cliente aceita orçamento → Contrato criado (ATIVO, PAGO)
2. Prestador clica "Iniciar Trabalho" → Status: EM_EXECUCAO
3. Prestador trabalha...
4. Cliente clica "Finalizar Trabalho" → Status: CONCLUIDO
5. Sistema libera pagamento IMEDIATAMENTE → Prestador pode sacar
```

---

## 📌 Checklist de Implementação

### **Backend** ✅
- [x] Adicionar campos ao modelo `Contrato` (data_inicio, data_fim, quem_iniciou, quem_finalizou)
- [x] Adicionar campos ao modelo `Pagamento` (liberado_por, motivo_liberacao)
- [x] Criar modelo `ConfiguracoesSistema`
- [x] Criar migration para novos campos
- [x] Endpoint `POST /api/contratos/:id/iniciar`
- [x] Endpoint `POST /api/contratos/:id/finalizar`
- [x] Endpoint `GET /api/contratos/andamentos`
- [x] Lógica de liberação de pagamento (imediata vs. agendada)
- [x] Notificações ao iniciar/finalizar
- [ ] Job/scheduler para liberar pagamentos agendados (futuro - pode ser implementado com cron job)
- [ ] Endpoint `GET /api/configuracoes/liberacao` (não necessário - lido diretamente do banco)

### **Frontend** ✅
- [x] Atualizar página `meus-servicos/page.tsx` com abas para híbrido
- [x] Criar componente `AndamentosServicosTable.tsx`
- [x] Criar componente `AbasTrabalhoHibrido.tsx`
- [x] Integrar botões Start/End na tabela
- [x] Mostrar status de liberação de pagamento
- [x] Filtrar serviços por tipo (Prestador/Cliente)
- [ ] Criar componente `ConfirmacaoFinalizacaoModal.tsx` (usando `confirm()` nativo por enquanto)

### **Admin (Futuro)**
- [ ] Criar página `/admin/configuracoes`
- [ ] Endpoint `PUT /api/admin/configuracoes/:chave`
- [ ] Formulário para editar tempo de liberação
- [ ] Validações e permissões de admin

---

## 📚 Referências

- **Contratos**: `backend/src/controllers/ContratoController.ts`
- **Pagamentos**: `backend/src/controllers/PagamentoController.ts`
- **Schema**: `backend/prisma/schema.prisma`
- **Página Atual**: `frontend/src/app/meus-servicos/page.tsx`

---

**Última atualização**: 04/11/2025
**Status**: ✅ **IMPLEMENTADO** - Migration aplicada com sucesso

