# Documentação de Segurança - ChamadoPro

## 🔒 Visão Geral

Este documento descreve todas as medidas de segurança implementadas no sistema ChamadoPro para proteger dados de usuários, prestadores e informações sensíveis.

---

## 🔐 1. Autenticação e Autorização

### 1.1. Criptografia de Senhas

**Tecnologia:** `bcryptjs`  
**Salt Rounds:** 12 (configurável via `BCRYPT_ROUNDS`)

**Implementação:**
- Todas as senhas são criptografadas antes de serem armazenadas no banco
- Senha nunca é retornada em respostas da API
- Comparação de senhas usa `bcrypt.compare()` (timing-safe)

**Validação de Senha:**
- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula
- Pelo menos uma letra minúscula
- Pelo menos um número
- Pelo menos um símbolo especial
- Bloqueio de padrões comuns (qwerty123, abc12345, etc.)
- Score de força da senha calculado

**Arquivos:**
- `backend/src/utils/passwordValidator.ts`
- `backend/src/controllers/AuthController.ts` (linhas 102-103, 474-475)
- `backend/src/controllers/ProfileController.ts` (linhas 214, 224)

### 1.2. Tokens JWT

**Tecnologia:** `jsonwebtoken`

**Configuração:**
- **Access Token:** Expira em 7 dias (configurável via `JWT_EXPIRES_IN`)
- **Refresh Token:** Expira em 30 dias (configurável via `REFRESH_TOKEN_EXPIRES_IN`)
- **Secret:** Armazenado em variável de ambiente `JWT_SECRET`
- **Refresh Secret:** Armazenado em variável de ambiente `REFRESH_TOKEN_SECRET`

**Payload do Token:**
```typescript
{
  id: string,      // ID do usuário
  email: string,   // Email do usuário
  tipo: string,    // Tipo (CLIENTE, PRESTADOR, etc.)
  iat: number,     // Issued at
  exp: number      // Expiration
}
```

**Verificações:**
- Token válido e não expirado
- Usuário existe no banco
- Conta está ativa (`ativo: true`)
- Email está verificado (`verificado: true`)

**Arquivo:** `backend/src/middleware/auth.ts`

### 1.3. Middleware de Autenticação

**Funções disponíveis:**
- `authenticate` - Requer autenticação obrigatória
- `optionalAuth` - Autenticação opcional (não falha se não houver token)
- `requireUserType(['CLIENTE', 'PRESTADOR'])` - Verifica tipo de usuário
- `requireCliente` - Apenas clientes
- `requirePrestador` - Apenas prestadores
- `requireModerador` - Apenas moderadores
- `requireAdmin` - Apenas administradores
- `requireClienteOrPrestador` - Clientes ou prestadores
- `requireModeradorOrAdmin` - Moderadores ou admins

**Proteção de Rotas:**
```typescript
router.get('/api/usuarios', authenticate, userController.getUsers);
router.post('/api/posts', authenticate, requireClienteOrPrestador, postController.createPost);
router.put('/api/admin/config', authenticate, requireAdmin, adminController.updateConfig);
```

---

## 🛡️ 2. Proteção contra Ataques

### 2.1. Rate Limiting (Controle de Taxa)

**Login Attempts:**
- **Máximo de tentativas:** 5 por IP/email
- **Janela de tempo:** 15 minutos
- **Bloqueio:** 10 minutos após 5 tentativas falhas
- **Armazenamento:** Tabela `login_attempts` no banco

**Implementação:**
- `LoginAttemptService` monitora tentativas de login
- Bloqueia IP e email automaticamente
- Limpa tentativas antigas automaticamente

**Status:** ✅ **ATIVO** e funcionando

**Arquivo:** `backend/src/services/LoginAttemptService.ts`

**Rate Limiter Genérico:**
- `rateLimiter` - Desabilitado temporariamente (pode ser reativado)
- `authRateLimiter` - Para rotas de autenticação
- `uploadRateLimiter` - Para uploads
- `paymentRateLimiter` - Para pagamentos
- `chatRateLimiter` - Para chat

**Arquivo:** `backend/src/middleware/rateLimiter.ts`

### 2.2. Helmet (Headers de Segurança)

**Configuração:**
- Content Security Policy (CSP) configurado
- Proteção contra XSS
- Headers de segurança HTTP
- Política de origem restrita

**Arquivo:** `backend/src/server.ts` (linhas 83-92)

### 2.3. CORS (Cross-Origin Resource Sharing)

**Configuração:**
- **Origens permitidas:** `http://localhost:3000`, `http://localhost:3002`
- **Credentials:** Habilitado
- **Métodos:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization, X-Requested-With

⚠️ **IMPORTANTE:** Em produção, ajustar para domínios reais.

**Arquivo:** `backend/src/server.ts` (linhas 94-100)

### 2.4. Validação de Entrada (Joi)

**Implementação:**
- Todas as rotas validadas com schemas Joi
- Validação de tipos de dados
- Validação de formatos (email, CPF, etc.)
- Validação de tamanhos e limites

**Schemas validados:**
- Autenticação (login, registro)
- Posts (criação, atualização)
- Orçamentos
- Contratos
- Pagamentos
- Avaliações
- Mensagens

**Arquivo:** `backend/src/middleware/validation.ts`

---

## 🔒 3. Proteção de Dados Sensíveis

### 3.1. Dados de Usuários

**Senhas:**
- ✅ Criptografadas com bcrypt (salt rounds 12)
- ✅ Nunca retornadas em respostas da API
- ✅ Validação de força antes de armazenar

**CPF/CNPJ:**
- ✅ Validados com algoritmo de dígitos verificadores
- ✅ Armazenados no banco (necessário para verificação)
- ⚠️ **LGPD:** Em produção, considerar criptografia adicional

**Telefone:**
- ✅ Validado e formatado
- ✅ Armazenado no banco

**Email:**
- ✅ Verificação obrigatória antes de usar o sistema
- ✅ Tokens de verificação com expiração

**Endereço:**
- ✅ Armazenado como JSON no banco
- ✅ Validação de CEP via API externa (opcional)

### 3.2. Dados Bancários

**Cartões de Crédito/Débito:**
- ✅ **Número completo NÃO é armazenado**
- ✅ Apenas últimos 4 dígitos salvos (`numero_hash`)
- ✅ Bandeira detectada automaticamente
- ✅ CVV nunca é armazenado
- ✅ Validade armazenada (MM/AA)

**Contas Bancárias:**
- ⚠️ Dados completos armazenados (necessário para saques)
- ⚠️ **LGPD:** Em produção, considerar criptografia adicional

**Arquivo:** `backend/src/controllers/CartaoController.ts`

### 3.3. Dados Financeiros

**Movimentações:**
- ✅ Associadas ao `usuario_id`
- ✅ Apenas o próprio usuário pode ver suas movimentações
- ✅ Valores armazenados em Float (precisão)

**Pagamentos:**
- ✅ ID da transação no gateway armazenado
- ✅ Status de pagamento rastreado
- ✅ Taxa da plataforma calculada e armazenada

---

## ✅ 4. Validações de Segurança

### 4.1. Validação de CPF/CNPJ

**Algoritmo:**
- Validação de dígitos verificadores
- Verificação de sequências inválidas (111.111.111-11)
- Formatação automática

**Arquivo:** `backend/src/utils/documentValidator.ts`

### 4.2. Validação de Telefone

**Formato aceito:**
- (XX) XXXXX-XXXX (celular)
- (XX) XXXX-XXXX (fixo)
- Validação de DDD válidos

**Arquivo:** `backend/src/utils/phoneValidator.ts`

### 4.3. Validação de CEP

**Implementação:**
- Validação de formato (00000-000)
- Consulta opcional via API externa (ViaCEP)
- Preenchimento automático de endereço

**Arquivo:** `backend/src/utils/cepValidator.ts`

### 4.4. Validação de Senha

**Requisitos:**
- Mínimo 8 caracteres
- Letra maiúscula
- Letra minúscula
- Número
- Símbolo especial
- Bloqueio de padrões comuns

**Score de Força:**
- 0-40: Fraca
- 40-60: Média
- 60-80: Forte
- 80-100: Muito forte

**Arquivo:** `backend/src/utils/passwordValidator.ts`

---

## 🔍 5. Logs e Auditoria

### 5.1. Logs de Auditoria

**Tabela:** `logs`

**Campos registrados:**
- `usuario_id` - ID do usuário (se autenticado)
- `acao` - Tipo de ação (CREATE_POST, CREATE_ORCAMENTO, etc.)
- `detalhes` - Detalhes da ação
- `ip` - IP de origem
- `user_agent` - User agent do navegador
- `data_criacao` - Data e hora

**Ações registradas:**
- Criação de posts
- Criação de orçamentos
- Aceitação de orçamentos
- Criação de contratos
- Pagamentos
- Login/Logout
- Alterações de perfil
- Ações administrativas

**Arquivo:** `backend/src/utils/logger.ts`

### 5.2. Tentativas de Login

**Tabela:** `login_attempts`

**Campos:**
- `ip` - IP de origem
- `email` - Email usado na tentativa
- `success` - Se foi bem-sucedida
- `blocked` - Se IP está bloqueado
- `block_expires` - Data de expiração do bloqueio

**Funcionalidades:**
- Bloqueio automático após 5 tentativas
- Limpeza automática de tentativas antigas
- Rastreamento por IP e email

---

## 🚫 6. Proteção de Rotas

### 6.1. Rotas Públicas (sem autenticação)

- `GET /api/posts?is_apresentacao=true` - Posts públicos
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Recuperação de senha
- `GET /health` - Health check

### 6.2. Rotas Protegidas (requerem autenticação)

**Todas as outras rotas requerem:**
- Token JWT válido
- Usuário ativo
- Email verificado

**Exemplos:**
- `POST /api/posts` - Criar post (Cliente ou Prestador)
- `POST /api/orcamentos` - Criar orçamento (Prestador)
- `GET /api/financeiro/*` - Dados financeiros (qualquer usuário autenticado)
- `GET /api/admin/*` - Área administrativa (Admin)

### 6.3. Rotas Especiais

**Apenas Admin:**
- `PUT /api/admin/config` - Configurações do sistema
- `POST /api/admin/*` - Ações administrativas

**Apenas Moderador/Admin:**
- `PUT /api/disputas/:id` - Resolver disputas
- `POST /api/disputas/:id/resolver` - Resolução de disputas

---

## 🔐 7. Tokens de Verificação

### 7.1. Token de Verificação de Email

**Características:**
- UUID único
- Expira em 24 horas (configurável)
- Uso único (marcado como usado após verificação)
- Invalidado quando novo token é criado

**Fluxo:**
1. Usuário se registra
2. Token é criado e armazenado em `tokens_verificacao`
3. Email enviado com link de verificação
4. Usuário clica no link
5. Token é validado e marcado como usado
6. Email é marcado como verificado

**Arquivo:** `backend/src/services/TokenService.ts`

### 7.2. Token de Recuperação de Senha

**Características:**
- JWT com expiração
- Uso único (pode ser invalidado)
- Enviado por email

**Fluxo:**
1. Usuário solicita recuperação
2. Token JWT é gerado
3. Email enviado com link de reset
4. Usuário redefine senha
5. Nova senha é criptografada e armazenada

---

## 📊 8. Segurança de Dados no Banco

### 8.1. Prisma ORM

**Proteções:**
- ✅ Prevenção de SQL Injection (queries parametrizadas)
- ✅ Validação de tipos
- ✅ Relacionamentos com constraints

### 8.2. Soft Delete

**Implementação:**
- Contas bancárias: `ativa: false`
- Cartões: `ativo: false`
- Posts: `excluido: true`

**Vantagem:** Dados não são perdidos, apenas marcados como inativos.

### 8.3. Índices para Performance e Segurança

**Índices criados:**
- `usuario_id` + `data_movimentacao` (movimentações)
- `usuario_id` + `status` (movimentações)
- `post_id` + `usuario_id` (curtidas - único)
- `ip` + `created_at` (login attempts)
- `email` + `created_at` (login attempts)

---

## 🔒 9. Conformidade LGPD

### 9.1. Dados Pessoais Armazenados

**Dados identificáveis:**
- Nome completo
- Email
- CPF/CNPJ
- Telefone
- Endereço completo
- Data de nascimento
- Foto de perfil

**Dados financeiros:**
- Contas bancárias (dados completos)
- Cartões (apenas últimos 4 dígitos)
- Movimentações financeiras

### 9.2. Medidas de Proteção Atuais

✅ **Implementado:**
- Senhas criptografadas
- Tokens de autenticação
- Validação de dados
- Logs de auditoria
- Controle de acesso
- Cartões mascarados

⚠️ **Recomendado para Produção:**
- Criptografia adicional para CPF/CNPJ
- Criptografia adicional para dados bancários
- Política de retenção de dados
- Política de exclusão de dados
- Consentimento explícito (LGPD)
- Relatório de acesso a dados pessoais

### 9.3. Direitos do Usuário (LGPD)

**Pendente de implementação:**
- Exportação de dados pessoais
- Exclusão de dados (Direito ao esquecimento)
- Correção de dados
- Portabilidade de dados
- Revogação de consentimento

---

## 🛡️ 10. Segurança de Uploads

### 10.1. Validação de Arquivos

**Implementação:**
- Validação de tipo MIME
- Validação de extensão
- Limite de tamanho (10MB)
- Sanitização de nomes de arquivo

**Arquivo:** `backend/src/routes/uploadRoutes.ts`

### 10.2. Armazenamento

**Localização:**
- `backend/uploads/`
- URLs servidas via `/uploads/*`

**Segurança:**
- CORS configurado para uploads
- Validação antes de salvar
- Nomes de arquivo únicos (UUID)

---

## 🔐 11. Variáveis de Ambiente (Segurança)

### 11.1. Variáveis Obrigatórias

**Backend `.env`:**
```env
# Banco de dados
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=seu_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=seu_refresh_secret_aqui
REFRESH_TOKEN_EXPIRES_IN=30d

# Bcrypt
BCRYPT_ROUNDS=12

# Email (para envio de emails)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_aqui

# Frontend
FRONTEND_URL=http://localhost:3000

# Ambiente
NODE_ENV=development
```

⚠️ **IMPORTANTE:**
- NUNCA commitar `.env` no repositório
- Usar valores fortes e aleatórios para secrets
- Rotacionar secrets periodicamente
- Em produção, usar gerenciador de secrets (AWS Secrets Manager, etc.)

---

## 📋 12. Checklist de Segurança

### ✅ Implementado

- [x] Criptografia de senhas (bcrypt)
- [x] Autenticação JWT
- [x] Validação de entrada (Joi)
- [x] Validação de CPF/CNPJ
- [x] Validação de senha forte
- [x] Rate limiting em login
- [x] Helmet (headers de segurança)
- [x] CORS configurado
- [x] Logs de auditoria
- [x] Proteção de rotas (middlewares)
- [x] Cartões mascarados (últimos 4 dígitos)
- [x] Tokens de verificação com expiração
- [x] Soft delete para dados sensíveis
- [x] Validação de uploads

### ⚠️ Recomendado para Produção

- [ ] Criptografia adicional para CPF/CNPJ (LGPD)
- [ ] Criptografia adicional para dados bancários (LGPD)
- [ ] Rate limiting genérico reativado
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection
- [ ] SSL/TLS obrigatório (HTTPS)
- [ ] Backup criptografado do banco
- [ ] Monitoramento de segurança (logs, alertas)
- [ ] Política de retenção de dados
- [ ] Implementação de direitos LGPD (exportação, exclusão)
- [ ] Testes de penetração
- [ ] Auditoria de segurança periódica
- [ ] CORS ajustado para domínios de produção
- [ ] Rotação automática de secrets
- [ ] 2FA (Autenticação de dois fatores)

---

## 🚨 13. Vulnerabilidades Conhecidas e Mitigações

### 13.1. Rate Limiting Genérico Desabilitado

**Status:** ⚠️ Desabilitado temporariamente  
**Impacto:** Sistema pode ser vulnerável a ataques de força bruta em rotas não protegidas  
**Mitigação:** Rate limiting de login está ativo e funcionando  
**Recomendação:** Reativar rate limiting genérico em produção

### 13.2. Dados Bancários Não Criptografados

**Status:** ⚠️ Dados armazenados em texto plano  
**Impacto:** Se banco for comprometido, dados bancários estarão expostos  
**Mitigação:** Acesso ao banco deve ser restrito  
**Recomendação:** Implementar criptografia em produção (AES-256)

### 13.3. CPF/CNPJ em Texto Plano

**Status:** ⚠️ Dados armazenados em texto plano  
**Impacto:** Conformidade LGPD  
**Mitigação:** Acesso ao banco deve ser restrito  
**Recomendação:** Implementar criptografia em produção (AES-256)

### 13.4. CORS Aberto para Desenvolvimento

**Status:** ⚠️ Permite localhost:3000 e localhost:3002  
**Impacto:** Em produção, pode permitir requisições de origens não autorizadas  
**Recomendação:** Ajustar CORS para domínios de produção apenas

---

## 📊 14. Níveis de Segurança por Tipo de Dado

### Nível 1 - Máxima Segurança (Criptografado)

- ✅ **Senhas** - bcrypt (salt rounds 12)
- ✅ **Números de cartão** - Apenas últimos 4 dígitos (mascarado)

### Nível 2 - Alta Segurança (Validado + Protegido)

- ✅ **CPF/CNPJ** - Validado, armazenado (criptografia recomendada)
- ✅ **Dados bancários** - Validados, armazenados (criptografia recomendada)
- ✅ **Tokens JWT** - Assinados e com expiração

### Nível 3 - Média Segurança (Validado)

- ✅ **Email** - Validado e verificado
- ✅ **Telefone** - Validado e formatado
- ✅ **CEP** - Validado
- ✅ **Endereço** - Validado

### Nível 4 - Pública (Ainda Protegida)

- ✅ **Nome** - Armazenado normalmente
- ✅ **Foto de perfil** - Upload validado
- ✅ **Descrições** - Sanitizadas

---

## 🔄 15. Fluxo de Segurança - Exemplo Completo

### Registro de Novo Usuário

1. **Frontend** → Validação básica (formato, campos obrigatórios)
2. **Backend** → Validação completa:
   - CPF/CNPJ (dígitos verificadores)
   - Senha (força, padrões)
   - Telefone (formato, DDD)
   - CEP (formato, consulta opcional)
   - Email (formato, não duplicado)
3. **Backend** → Criptografia de senha (bcrypt)
4. **Backend** → Criação do usuário no banco
5. **Backend** → Geração de token de verificação
6. **Backend** → Envio de email de verificação
7. **Usuário** → Clica no link de verificação
8. **Backend** → Valida token de verificação
9. **Backend** → Marca email como verificado
10. **Usuário** → Pode fazer login

### Login

1. **Frontend** → Envia email e senha
2. **Backend** → Verifica rate limiting (tentativas)
3. **Backend** → Busca usuário no banco
4. **Backend** → Compara senha (bcrypt.compare)
5. **Backend** → Verifica se conta está ativa
6. **Backend** → Verifica se email está verificado
7. **Backend** → Gera tokens JWT (access + refresh)
8. **Backend** → Registra tentativa de login (sucesso)
9. **Frontend** → Armazena tokens no localStorage
10. **Frontend** → Usa token em requisições subsequentes

### Acesso a Rota Protegida

1. **Frontend** → Envia token no header `Authorization: Bearer <token>`
2. **Backend** → Middleware `authenticate` verifica token
3. **Backend** → Valida assinatura do token
4. **Backend** → Verifica expiração
5. **Backend** → Busca usuário no banco
6. **Backend** → Verifica se conta está ativa e verificada
7. **Backend** → Adiciona `req.user` à requisição
8. **Backend** → Processa requisição normalmente

---

## 📝 16. Boas Práticas Implementadas

### 16.1. Validação em Múltiplas Camadas

- ✅ Frontend: Validação de UX (feedback imediato)
- ✅ Backend: Validação de segurança (Joi schemas)
- ✅ Banco: Constraints e tipos

### 16.2. Princípio do Menor Privilégio

- ✅ Usuários só acessam seus próprios dados
- ✅ Middlewares específicos por tipo de usuário
- ✅ Rotas administrativas protegidas

### 16.3. Defesa em Profundidade

- ✅ Múltiplas camadas de validação
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Verificações de estado (ativo, verificado)

### 16.4. Não Confiar em Entrada do Cliente

- ✅ Todas as entradas validadas
- ✅ Sanitização de dados
- ✅ Validação de tipos
- ✅ Verificação de permissões no backend

---

## 🎯 17. Recomendações para Produção

### 17.1. Segurança de Infraestrutura

- [ ] Usar HTTPS obrigatório (SSL/TLS)
- [ ] Configurar firewall adequado
- [ ] Isolar banco de dados (rede privada)
- [ ] Backup criptografado e testado
- [ ] Monitoramento de segurança (SIEM)
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection

### 17.2. Segurança de Aplicação

- [ ] Reativar rate limiting genérico
- [ ] Implementar 2FA (autenticação de dois fatores)
- [ ] Criptografar CPF/CNPJ (AES-256)
- [ ] Criptografar dados bancários (AES-256)
- [ ] Implementar direitos LGPD
- [ ] Política de retenção de dados
- [ ] Rotação automática de secrets

### 17.3. Conformidade

- [ ] Política de privacidade
- [ ] Termos de uso
- [ ] Consentimento explícito (LGPD)
- [ ] Relatório de acesso a dados
- [ ] Procedimento de exclusão de dados
- [ ] Procedimento de exportação de dados

### 17.4. Monitoramento

- [ ] Alertas de segurança
- [ ] Logs centralizados
- [ ] Análise de padrões suspeitos
- [ ] Auditoria regular
- [ ] Testes de penetração periódicos

---

## 📚 18. Referências e Padrões

### 18.1. Padrões Seguidos

- **OWASP Top 10** - Principais vulnerabilidades web
- **LGPD** - Lei Geral de Proteção de Dados
- **PCI DSS** - Para dados de cartão (parcial - apenas últimos 4 dígitos)
- **ISO 27001** - Gestão de segurança da informação (parcial)

### 18.2. Bibliotecas de Segurança Usadas

- `bcryptjs` - Criptografia de senhas
- `jsonwebtoken` - Tokens JWT
- `helmet` - Headers de segurança HTTP
- `cors` - Controle de CORS
- `joi` - Validação de dados

---

## 🔍 19. Testes de Segurança

### 19.1. Testes Implementados

- ✅ Validação de CPF/CNPJ
- ✅ Validação de senha
- ✅ Validação de telefone
- ✅ Validação de CEP
- ✅ Rate limiting de login
- ✅ Autenticação JWT

### 19.2. Testes Recomendados

- [ ] Testes de penetração
- [ ] Análise de vulnerabilidades (dependências)
- [ ] Testes de carga (stress testing)
- [ ] Testes de SQL Injection
- [ ] Testes de XSS
- [ ] Testes de CSRF
- [ ] Auditoria de código

---

## 📊 20. Resumo Executivo

### Pontos Fortes ✅

1. **Criptografia de senhas** - bcrypt com salt rounds 12
2. **Autenticação robusta** - JWT com verificação de estado
3. **Validações completas** - CPF/CNPJ, senha, telefone, CEP
4. **Rate limiting** - Ativo em login
5. **Logs de auditoria** - Rastreamento de ações
6. **Proteção de rotas** - Middlewares específicos
7. **Cartões mascarados** - Apenas últimos 4 dígitos
8. **Helmet e CORS** - Headers de segurança configurados

### Pontos de Atenção ⚠️

1. **Dados bancários** - Não criptografados (LGPD)
2. **CPF/CNPJ** - Não criptografado (LGPD)
3. **Rate limiting genérico** - Desabilitado
4. **CORS** - Ajustar para produção
5. **Direitos LGPD** - Pendente de implementação
6. **2FA** - Não implementado

### Prioridades para Produção 🔴

1. **Alta:** Criptografar CPF/CNPJ e dados bancários
2. **Alta:** Reativar rate limiting genérico
3. **Média:** Ajustar CORS para produção
4. **Média:** Implementar direitos LGPD
5. **Baixa:** Implementar 2FA (opcional)

---

## 🔄 21. Melhorias Implementadas (04/11/2025)

### 21.1. Rate Limiting Genérico ✅

**Status:** Implementado e ativo

**Funcionalidades:**
- Rate limiting genérico para todas as rotas (100 req/15min por padrão)
- Rate limiting específico para autenticação (10 req/15min)
- Rate limiting para uploads (20 req/60min)
- Rate limiting para pagamentos (5 req/60min)
- Rate limiting para chat (50 req/1min)
- Headers informativos: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Resposta 429 com `retryAfter` quando limite excedido
- Desabilitável em desenvolvimento via `DISABLE_RATE_LIMIT=true`

**Configuração:**
Variáveis de ambiente em `backend/env.example`:
```env
DISABLE_RATE_LIMIT=false
RATE_LIMIT_GENERIC_MAX=100
RATE_LIMIT_GENERIC_WINDOW=15
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_AUTH_WINDOW=15
# ... outros limites
```

**Arquivo:** `backend/src/middleware/rateLimiter.ts`

### 21.2. CORS Condicional por Ambiente ✅

**Status:** Implementado e ativo

**Funcionalidades:**
- CORS mais restritivo em produção
- CORS mais permissivo em desenvolvimento (localhost permitido)
- Configurável via variável `CORS_ORIGINS` em produção
- Headers de rate limiting expostos no CORS
- Cache de preflight (24 horas)

**Configuração:**
```env
# Produção
CORS_ORIGINS=https://chamadopro.com,https://www.chamadopro.com

# Desenvolvimento (padrão: localhost permitido)
# NODE_ENV=development
```

**Arquivo:** `backend/src/server.ts` (linhas 94-126)

---

## 📅 Última Atualização

- **Data:** 04/11/2025
- **Versão:** 1.1
- **Status:** Sistema em desenvolvimento
- **Melhorias:** Rate limiting genérico e CORS condicional implementados

---

**Nota:** Esta documentação reflete o estado atual de segurança do sistema. Para atualizações futuras, consulte os arquivos de código mencionados.

