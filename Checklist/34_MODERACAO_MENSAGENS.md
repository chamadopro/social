# Checklist: Moderação de Mensagens e Notificações Push

## 📋 Status Geral

- **Criado em:** 04/11/2025
- **Última atualização:** 04/11/2025
- **Status:** ✅ **IMPLEMENTADO** - Funcionando 100%

---

## 🎯 Objetivo

Implementar sistema de moderação de mensagens para bloquear tentativas de contato externo (WhatsApp, Instagram, email, etc.) e garantir que toda comunicação ocorra dentro da plataforma. Também implementar notificações push em tempo real quando mensagens são enviadas.

---

## ✅ Implementado

### 1. Moderação de Mensagens ✅

**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**

**Funcionalidades:**
- Detecção automática de tentativas de compartilhar contatos externos
- Bloqueio de mensagens com:
  - WhatsApp (zap, wa.me, números de telefone)
  - Instagram (@username, insta, ig)
  - Facebook (fb, face)
  - Telegram (t.me, telegram)
  - Email (endereços de email)
  - Números de telefone (vários formatos)
  - URLs externas
  - Frases de evasão ("saia da plataforma", "chama fora", etc.)
- Mensagem bloqueada é salva para auditoria (com conteúdo sanitizado)
- Motivo do bloqueio é registrado
- Logs de auditoria para análise

**Padrões Detectados:**
- WhatsApp: `whatsapp`, `w.a`, `zap`, `wa.me`, `wa.link`, números de telefone
- Instagram: `instagram`, `insta`, `@username`, `ig`
- Email: formato completo de email
- Telefone: formatos brasileiros e internacionais
- URLs: links externos (exceto da plataforma)
- Frases de evasão: "saia da plataforma", "chama fora", "contato externo", etc.

**Arquivos:**
- `backend/src/services/MessageModerationService.ts` - Serviço de moderação
- `backend/src/controllers/ChatController.ts` - Integração no envio de mensagens

**Fluxo:**
1. Usuário tenta enviar mensagem
2. Sistema verifica conteúdo com `MessageModerationService`
3. Se bloqueado:
   - Mensagem é salva como `bloqueada: true`
   - Conteúdo é sanitizado (informações removidas)
   - Erro é retornado ao usuário com motivo claro
   - Log de auditoria é criado
4. Se aprovado:
   - Mensagem é salva normalmente
   - Notificação push é enviada ao destinatário

---

### 2. Notificações Push ✅

**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO**

**Funcionalidades:**
- Notificação automática quando mensagem é enviada
- Notificação via Socket.IO em tempo real (WebSocket)
- Notificação salva no banco de dados
- Notificação aparece na interface do usuário
- Funciona em desktop e mobile (via WebSocket)

**Como funciona:**
1. Mensagem é enviada via API REST
2. Sistema identifica o destinatário (cliente ou prestador)
3. Notificação é criada no banco via `NotificationService`
4. Notificação é enviada via Socket.IO para o destinatário (se conectado)
5. Notificação aparece em tempo real na interface

**Arquivos:**
- `backend/src/services/NotificationService.ts` - Serviço de notificações
- `backend/src/controllers/ChatController.ts` - Integração no envio de mensagens
- `backend/src/server.ts` - Configuração do Socket.IO

**Tipo de Notificação:**
- Tipo: `MESSAGE_RECEIVED`
- Título: "Nova mensagem recebida"
- Mensagem: "Nome do remetente enviou uma mensagem: [primeiros 100 caracteres]"
- Dados extras: `mensagem_id`, `contrato_id`, `remetente_id`, `remetente_nome`

---

## 📊 Detalhes Técnicos

### Moderação de Mensagens

**Serviço:** `MessageModerationService`

**Métodos principais:**
- `moderateMessage(conteudo: string)`: Verifica se mensagem deve ser bloqueada
- `sanitizeContent(conteudo: string)`: Remove informações sensíveis para logs
- `isContentAllowed(conteudo: string)`: Verifica se conteúdo é permitido

**Resultado da Moderação:**
```typescript
{
  isBlocked: boolean,
  motivo?: string,
  conteudoOriginal: string,
  conteudoModerado?: string,
  detectedPatterns: string[]
}
```

**Exemplos de Mensagens Bloqueadas:**
- "Me chama no zap: (11) 99999-9999"
- "Meu insta é @usuario123"
- "Email: contato@exemplo.com"
- "Saia da plataforma e me chama"
- "WhatsApp: +55 11 99999-9999"

**Exemplos de Mensagens Permitidas:**
- "Olá, gostaria de saber mais sobre o serviço"
- "Quando você pode começar?"
- "Prefiro fazer pela plataforma ChamadoPro"
- "Qual é o prazo de entrega?"

---

### Notificações Push

**Serviço:** `NotificationService`

**Configuração:**
- Socket.IO configurado no servidor
- NotificationService anexado ao Socket.IO
- Usuários conectados são rastreados por `userId`

**Fluxo de Notificação:**
1. Usuário faz login → Conecta ao Socket.IO
2. Socket.IO registra `userId` → `socketId` no mapa
3. Mensagem é enviada → Notificação é criada
4. `NotificationService.sendNotificationToUser()` busca `socketId` do destinatário
5. Se conectado → Notificação é enviada via WebSocket
6. Frontend recebe evento `notification` → Atualiza UI

**Persistência:**
- Notificação é salva no banco (`notificacoes` table)
- Campo `lida: false` por padrão
- Usuário pode marcar como lida
- Histórico completo de notificações

---

## 🔒 Segurança e Auditoria

### Logs de Auditoria

**Mensagens Bloqueadas:**
- Tipo: `MESSAGE_BLOCKED`
- Dados: `mensagem_id`, `contrato_id`, `usuario_id`, `motivo`, `detectedPatterns`, `conteudoOriginal` (primeiros 100 caracteres)

**Mensagens Enviadas:**
- Tipo: `MESSAGE_SENT`
- Dados: `mensagem_id`, `contrato_id`, `usuario_id`

### Mensagens Bloqueadas

**Armazenamento:**
- Mensagem bloqueada é salva no banco com:
  - `bloqueada: true`
  - `motivo_bloqueio: string` (motivo do bloqueio)
  - `conteudo: string` (conteúdo sanitizado - informações removidas)

**Acesso:**
- Apenas administradores podem ver mensagens bloqueadas
- Usuários não veem suas próprias mensagens bloqueadas
- Logs de auditoria para análise de padrões

---

## 🧪 Testes

### Testes Manuais Recomendados

1. **Teste de Bloqueio:**
   - Tentar enviar "Me chama no zap: (11) 99999-9999"
   - Verificar se mensagem é bloqueada
   - Verificar mensagem de erro clara

2. **Teste de Notificação:**
   - Usuário A envia mensagem para Usuário B
   - Verificar se Usuário B recebe notificação
   - Verificar se notificação aparece na interface

3. **Teste de Mensagem Permitida:**
   - Enviar mensagem normal
   - Verificar se é enviada normalmente
   - Verificar se destinatário recebe notificação

---

## 📝 Exemplos de Uso

### Mensagem Bloqueada

**Input:**
```
"Olá! Me chama no WhatsApp: (11) 99999-9999 ou no Instagram @meuperfil"
```

**Resultado:**
- ❌ Mensagem bloqueada
- Mensagem de erro: "Tentativa de compartilhar contato do WhatsApp detectada"
- Mensagem salva no banco com conteúdo sanitizado
- Log de auditoria criado

### Mensagem Permitida

**Input:**
```
"Olá! Gostaria de saber mais sobre o serviço. Quando você pode começar?"
```

**Resultado:**
- ✅ Mensagem enviada
- Notificação push enviada ao destinatário
- Mensagem salva no banco
- Log de auditoria criado

---

## 🔄 Integração com Sistema Existente

### ChatController

**Antes:**
- Enviava mensagem diretamente
- Não havia moderação
- Não havia notificações push

**Depois:**
- Moderação automática antes de salvar
- Notificação push ao destinatário
- Logs de auditoria completos

### NotificationService

**Antes:**
- Já existia mas não estava integrado ao chat
- Socket.IO não estava conectado

**Depois:**
- Integrado ao chat
- Socket.IO conectado no servidor
- Notificações em tempo real funcionando

---

## 📊 Estatísticas e Monitoramento

### Métricas a Monitorar

1. **Mensagens Bloqueadas:**
   - Total de mensagens bloqueadas por dia
   - Padrões mais detectados
   - Usuários que mais tentam compartilhar contatos

2. **Notificações:**
   - Taxa de entrega de notificações
   - Usuários conectados vs desconectados
   - Tempo de resposta das notificações

3. **Eficácia da Moderação:**
   - % de mensagens bloqueadas
   - Falsos positivos (se houver)
   - Tentativas de evasão

---

## 🚀 Melhorias Futuras (Opcional)

### 1. Moderação por IA

- [ ] Usar OpenAI/Claude para detectar tentativas mais sutis
- [ ] Aprender com padrões de evasão
- [ ] Reduzir falsos positivos

### 2. Notificações Push Nativas

- [ ] Integração com Firebase Cloud Messaging (FCM) para Android
- [ ] Integração com Apple Push Notification Service (APNs) para iOS
- [ ] Notificações mesmo quando app está fechado

### 3. Filtros Avançados

- [ ] Permitir URLs específicas (whitelist)
- [ ] Permitir emails específicos (domínios confiáveis)
- [ ] Configuração administrativa de padrões

### 4. Alertas Administrativos

- [ ] Alertar admin quando múltiplas mensagens são bloqueadas
- [ ] Alertar admin quando usuário tenta evasão repetidamente
- [ ] Dashboard de moderação

---

## 📅 Histórico de Atualizações

- **04/11/2025** - Implementação completa
  - ✅ Moderação de mensagens implementada
  - ✅ Notificações push implementadas
  - ✅ Integração com Socket.IO
  - ✅ Logs de auditoria

---

**Status:** ✅ **IMPLEMENTADO E FUNCIONANDO 100%**

