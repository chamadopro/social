# Checklist: Segurança para Produção - ChamadoPro

## 📋 Status Geral

- **Criado em:** 04/11/2025
- **Última atualização:** 04/11/2025
- **Status:** 📝 **PLANEJADO** - Aguardando próximo ciclo de produção

---

## 🎯 Objetivo

Este checklist documenta todas as melhorias de segurança que devem ser implementadas antes do deploy em produção. As melhorias são organizadas por prioridade e complexidade.

---

## ✅ Implementado (Base Atual)

### Autenticação e Autorização
- [x] Criptografia de senhas com bcrypt (12 rounds)
- [x] Tokens JWT com expiração
- [x] Verificação de email obrigatória
- [x] Rate limiting em login (5 tentativas, bloqueio de 10 min)
- [x] Rate limiting genérico (100 req/15min) - **IMPLEMENTADO 04/11/2025**
- [x] CORS condicional por ambiente - **IMPLEMENTADO 04/11/2025**
- [x] Validação de senha forte
- [x] Validação de CPF/CNPJ
- [x] Validação de telefone e CEP
- [x] Logs de auditoria

### Proteção de Dados
- [x] Cartões mascarados (apenas últimos 4 dígitos)
- [x] Senhas nunca retornadas em respostas
- [x] Headers de segurança (Helmet)
- [x] Validação de entrada (Joi)

---

## 🔴 Prioridade ALTA (Crítico para Produção)

### 1. Criptografia de Dados Sensíveis

#### 1.1. Criptografia de CPF/CNPJ
**Status:** ❌ **PENDENTE**

**Por que é crítico:**
- Dados pessoais sensíveis (LGPD)
- Armazenados em texto plano atualmente
- Risco legal em caso de vazamento

**Implementação:**
- [ ] Criar utilitário de criptografia (AES-256)
- [ ] Criptografar CPF/CNPJ antes de salvar no banco
- [ ] Descriptografar apenas quando necessário (validações, relatórios)
- [ ] Criar migration para criptografar dados existentes
- [ ] Atualizar queries que usam CPF/CNPJ
- [ ] Testes unitários de criptografia/descriptografia

**Arquivos a criar/modificar:**
- `backend/src/utils/encryption.ts` (novo)
- `backend/src/controllers/AuthController.ts`
- `backend/src/controllers/UserController.ts`
- Migration: `backend/prisma/migrations/XXXXXX_encrypt_cpf_cnpj/migration.sql`

**Variáveis de ambiente:**
```env
ENCRYPTION_KEY=chave_de_32_bytes_para_aes_256
ENCRYPTION_ALGORITHM=aes-256-gcm
```

**Tempo estimado:** 4-6 horas

---

#### 1.2. Criptografia de Dados Bancários
**Status:** ❌ **PENDENTE**

**Por que é crítico:**
- Dados financeiros sensíveis
- Risco de fraude e vazamento
- Conformidade com LGPD

**Implementação:**
- [ ] Criptografar campos de `ContaBancaria`:
  - `banco`
  - `agencia`
  - `conta`
  - `cpf_cnpj` (titular)
- [ ] Criptografar campos de `Cartao`:
  - `nome_titular`
  - `validade`
- [ ] Atualizar endpoints de criação/atualização
- [ ] Atualizar endpoints de leitura (descriptografar)
- [ ] Criar migration para criptografar dados existentes
- [ ] Testes de criptografia/descriptografia

**Arquivos a criar/modificar:**
- `backend/src/utils/encryption.ts` (usar o mesmo utilitário)
- `backend/src/controllers/ContaBancariaController.ts`
- `backend/src/controllers/CartaoController.ts`
- Migration: `backend/prisma/migrations/XXXXXX_encrypt_bancarios/migration.sql`

**Tempo estimado:** 3-4 horas

---

### 2. Configuração de Produção

#### 2.1. Variáveis de Ambiente de Produção
**Status:** ⚠️ **PARCIAL**

**Implementação:**
- [ ] Revisar todas as variáveis de ambiente
- [ ] Criar `.env.production.example` com valores seguros
- [ ] Documentar todas as variáveis obrigatórias
- [ ] Validar que não há valores hardcoded
- [ ] Configurar secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)

**Arquivos:**
- `backend/env.example` (já atualizado)
- `backend/.env.production.example` (criar)

**Tempo estimado:** 2 horas

---

#### 2.2. Configuração de CORS para Produção
**Status:** ✅ **IMPLEMENTADO** (mas precisa configurar)

**Ação necessária:**
- [ ] Configurar `CORS_ORIGINS` no `.env` de produção
- [ ] Testar CORS em ambiente de staging
- [ ] Validar que apenas origens permitidas funcionam

**Exemplo:**
```env
CORS_ORIGINS=https://chamadopro.com,https://www.chamadopro.com,https://app.chamadopro.com
```

**Tempo estimado:** 30 minutos

---

---

## 🟡 Prioridade MÉDIA (Importante, mas não bloqueante)

### 3. Direitos LGPD

#### 3.1. Exportação de Dados Pessoais
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Endpoint `GET /api/users/me/export-data`
- [ ] Gerar JSON com todos os dados do usuário:
  - Dados pessoais
  - Posts criados
  - Orçamentos enviados/recebidos
  - Contratos
  - Avaliações
  - Movimentações financeiras
- [ ] Formato: JSON ou PDF
- [ ] Autenticação obrigatória
- [ ] Rate limiting (1 exportação por hora)
- [ ] Log de exportação

**Arquivos a criar:**
- `backend/src/controllers/UserController.ts` (método `exportUserData`)
- `backend/src/routes/users.ts` (rota)
- `frontend/src/app/settings/export-data/page.tsx` (página)

**Tempo estimado:** 4-6 horas

---

#### 3.2. Exclusão de Dados (Direito ao Esquecimento)
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Endpoint `DELETE /api/users/me/delete-account`
- [ ] Soft delete dos dados:
  - Anonimizar dados pessoais
  - Manter dados financeiros (compliance)
  - Manter logs de auditoria (compliance)
- [ ] Confirmar senha antes de excluir
- [ ] Período de graça (30 dias) antes de exclusão permanente
- [ ] Notificação por email
- [ ] Log de exclusão

**Arquivos a criar/modificar:**
- `backend/src/controllers/UserController.ts` (método `deleteAccount`)
- `backend/src/routes/users.ts` (rota)
- `frontend/src/app/settings/delete-account/page.tsx` (página)

**Tempo estimado:** 6-8 horas

---

#### 3.3. Política de Privacidade e Termos
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Criar página `/politica-privacidade`
- [ ] Criar página `/termos-uso`
- [ ] Adicionar aceite obrigatório no cadastro
- [ ] Versão dos termos (rastreamento)
- [ ] Notificação de mudanças nos termos

**Arquivos a criar:**
- `frontend/src/app/politica-privacidade/page.tsx`
- `frontend/src/app/termos-uso/page.tsx`
- `backend/prisma/schema.prisma` (adicionar `aceite_termos`, `versao_termos`)

**Tempo estimado:** 3-4 horas

---

#### 3.4. Política de Retenção de Dados
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Definir períodos de retenção:
  - Dados ativos: indefinido
  - Contas inativas: 2 anos
  - Logs: 1 ano
  - Dados financeiros: 5 anos (compliance)
- [ ] Criar job de limpeza automática
- [ ] Documentar política

**Arquivos a criar:**
- `backend/src/services/DataRetentionService.ts`
- `backend/src/cron/dataRetention.ts`
- `docs/POLITICA_RETENCAO_DADOS.md`

**Tempo estimado:** 4-6 horas

---

### 4. Monitoramento e Alertas

#### 4.1. Alertas de Segurança
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Alertas para múltiplas tentativas de login falhas
- [ ] Alertas para rate limiting excedido repetidamente
- [ ] Alertas para tentativas de acesso não autorizado
- [ ] Alertas para mudanças em dados sensíveis
- [ ] Integração com sistema de notificações (email, Slack, etc.)

**Arquivos a criar:**
- `backend/src/services/SecurityAlertService.ts`
- Integração com sistema de monitoramento

**Tempo estimado:** 3-4 horas

---

#### 4.2. Logs Centralizados
**Status:** ⚠️ **PARCIAL** (logs existem, mas não centralizados)

**Implementação:**
- [ ] Integração com serviço de logs (ELK, CloudWatch, etc.)
- [ ] Estruturação de logs (formato JSON)
- [ ] Níveis de log configuráveis
- [ ] Retenção de logs (1 ano)

**Arquivos a modificar:**
- `backend/src/utils/logger.ts`

**Tempo estimado:** 2-3 horas

---

### 5. Testes de Segurança

#### 5.1. Testes de Penetração Básicos
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Testes de SQL Injection
- [ ] Testes de XSS
- [ ] Testes de CSRF
- [ ] Testes de autenticação
- [ ] Testes de autorização
- [ ] Testes de rate limiting

**Ferramentas sugeridas:**
- OWASP ZAP
- Burp Suite
- Testes manuais

**Tempo estimado:** 8-12 horas

---

#### 5.2. Análise de Dependências
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Configurar `npm audit` automático
- [ ] Configurar `snyk` ou `dependabot`
- [ ] Revisar vulnerabilidades mensalmente
- [ ] Atualizar dependências críticas

**Tempo estimado:** 1 hora (configuração) + manutenção contínua

---

---

## 🟢 Prioridade BAIXA (Melhorias Futuras)

### 6. Autenticação de Dois Fatores (2FA)

#### 6.1. 2FA via SMS
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Integração com Twilio (já configurado)
- [ ] Endpoint para ativar 2FA
- [ ] Endpoint para desativar 2FA
- [ ] Código SMS no login
- [ ] Códigos de backup
- [ ] UI para configuração

**Tempo estimado:** 8-10 horas

---

#### 6.2. 2FA via App Authenticator (TOTP)
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Biblioteca TOTP (ex: `speakeasy`)
- [ ] QR Code para registro
- [ ] Validação de código no login
- [ ] Códigos de backup
- [ ] UI para configuração

**Tempo estimado:** 10-12 horas

---

### 7. Melhorias Adicionais

#### 7.1. WAF (Web Application Firewall)
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Configurar WAF no load balancer (CloudFlare, AWS WAF, etc.)
- [ ] Regras de bloqueio automático
- [ ] Monitoramento de tráfego suspeito

**Tempo estimado:** 4-6 horas (configuração)

---

#### 7.2. DDoS Protection
**Status:** ❌ **PENDENTE**

**Implementação:**
- [ ] Configurar proteção DDoS no provedor
- [ ] Rate limiting em nível de infraestrutura
- [ ] Monitoramento de tráfego

**Tempo estimado:** 2-3 horas (configuração)

---

#### 7.3. Certificado SSL/TLS
**Status:** ⚠️ **DEPENDÊNCIA DE INFRAESTRUTURA**

**Implementação:**
- [ ] Configurar certificado SSL (Let's Encrypt, AWS Certificate Manager, etc.)
- [ ] Renovação automática
- [ ] Redirecionar HTTP → HTTPS
- [ ] HSTS (HTTP Strict Transport Security)

**Tempo estimado:** 1-2 horas (configuração)

---

---

## 📊 Resumo por Prioridade

### Prioridade ALTA (Crítico)
- **Total de tarefas:** 4
- **Tempo estimado:** 9-12 horas
- **Status:** 0% completo

### Prioridade MÉDIA (Importante)
- **Total de tarefas:** 7
- **Tempo estimado:** 32-42 horas
- **Status:** 0% completo

### Prioridade BAIXA (Melhorias)
- **Total de tarefas:** 5
- **Tempo estimado:** 25-35 horas
- **Status:** 0% completo

### **TOTAL**
- **Tarefas:** 16
- **Tempo estimado:** 66-89 horas
- **Status geral:** 0% completo

---

## 🎯 Roadmap Sugerido

### Fase 1: Pré-Produção Crítica (1-2 semanas)
1. ✅ Rate limiting genérico (já feito)
2. ✅ CORS condicional (já feito)
3. ⏭️ Criptografia de CPF/CNPJ
4. ⏭️ Criptografia de dados bancários
5. ⏭️ Configuração de variáveis de ambiente
6. ⏭️ Configuração de CORS para produção

### Fase 2: Conformidade LGPD (2-3 semanas)
1. ⏭️ Exportação de dados
2. ⏭️ Exclusão de dados
3. ⏭️ Política de privacidade e termos
4. ⏭️ Política de retenção

### Fase 3: Monitoramento e Testes (1-2 semanas)
1. ⏭️ Alertas de segurança
2. ⏭️ Logs centralizados
3. ⏭️ Testes de penetração
4. ⏭️ Análise de dependências

### Fase 4: Melhorias Futuras (Opcional)
1. ⏭️ 2FA
2. ⏭️ WAF
3. ⏭️ DDoS Protection
4. ⏭️ SSL/TLS

---

## 📝 Notas Importantes

### Antes de Começar

1. **Revisar documentação de segurança:**
   - `DOCUMENTACAO_SEGURANCA.md` - Documentação completa
   - `DOCUMENTACAO_BANCO_DADOS.md` - Estrutura do banco

2. **Configurar ambiente de testes:**
   - Criar ambiente de staging idêntico à produção
   - Testar todas as melhorias em staging antes de produção

3. **Backup:**
   - Sempre fazer backup antes de migrations
   - Testar restauração de backup

### Durante a Implementação

1. **Criptografia:**
   - Nunca perder a chave de criptografia
   - Armazenar chave em secrets manager
   - Testar descriptografia antes de migrar dados

2. **LGPD:**
   - Consultar advogado especializado em LGPD
   - Documentar todas as decisões
   - Manter logs de conformidade

3. **Testes:**
   - Testar todos os cenários
   - Testar em ambiente idêntico à produção
   - Validar performance após criptografia

### Após Implementação

1. **Monitoramento:**
   - Monitorar logs de segurança
   - Verificar alertas regularmente
   - Revisar métricas de segurança

2. **Manutenção:**
   - Atualizar dependências regularmente
   - Revisar políticas de segurança trimestralmente
   - Atualizar documentação conforme mudanças

---

## 🔗 Referências

- [DOCUMENTACAO_SEGURANCA.md](../DOCUMENTACAO_SEGURANCA.md) - Documentação completa de segurança
- [DOCUMENTACAO_BANCO_DADOS.md](../DOCUMENTACAO_BANCO_DADOS.md) - Estrutura do banco de dados
- [DEPLOYMENT_GUIDE.md](../docs/DEPLOYMENT_GUIDE.md) - Guia de deploy

---

## 📅 Histórico de Atualizações

- **04/11/2025** - Checklist criado
  - Documentadas todas as melhorias de segurança pendentes
  - Organizadas por prioridade
  - Estimativas de tempo adicionadas

---

**Status:** 📝 **PLANEJADO** - Aguardando início da Fase 1

