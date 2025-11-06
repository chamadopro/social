# Documentação do Banco de Dados - ChamadoPro

## 📋 Informações de Conexão

### Tipo de Banco
- **SGBD:** PostgreSQL
- **Versão:** Recomendada 14 ou superior

### String de Conexão
A string de conexão é configurada através da variável de ambiente `DATABASE_URL` no arquivo `.env` do backend.

**Formato padrão:**
```
postgresql://usuario:senha@host:porta/nome_banco?schema=public
```

**Exemplo de desenvolvimento local:**
```
DATABASE_URL=postgresql://postgres:senha123@localhost:5432/chamadopro?schema=public
```

### Variáveis de Ambiente Necessárias
Criar arquivo `backend/.env` com:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/chamadopro?schema=public
```

### Credenciais Padrão (Desenvolvimento)
- **Host:** localhost
- **Porta:** 5432
- **Usuário:** postgres (ou conforme configurado)
- **Senha:** (conforme configurado no PostgreSQL)
- **Nome do Banco:** chamadopro
- **Schema:** public

⚠️ **IMPORTANTE:** Em produção, usar credenciais seguras e nunca commitar o arquivo `.env` no repositório.

---

## 🗄️ Estrutura do Banco de Dados

### Resumo das Tabelas

O banco de dados possui **19 tabelas principais**:

1. `usuarios` - Usuários do sistema (Clientes, Prestadores, Moderadores, Admins)
2. `posts` - Posts de solicitação, oferta e vitrines
3. `orcamentos` - Orçamentos enviados por prestadores
4. `negociacoes_orcamento` - Negociações de orçamentos
5. `contratos` - Contratos de prestação de serviços
6. `pagamentos` - Pagamentos dos contratos
7. `avaliacoes` - Avaliações de serviços
8. `disputas` - Disputas abertas
9. `mensagens` - Mensagens do chat entre cliente e prestador
10. `curtidas` - Curtidas nos posts
11. `transacoes_moedas` - Transações de moedas ChamadoPro
12. `comentarios` - Comentários nos posts
13. `notificacoes` - Notificações do sistema
14. `logs` - Logs de auditoria
15. `movimentacoes_financeiras` - Movimentações financeiras (entradas/saídas)
16. `contas_bancarias` - Contas bancárias dos usuários
17. `cartoes` - Cartões de crédito/débito dos usuários
18. `tokens_verificacao` - Tokens de verificação de email e recuperação de senha
19. `login_attempts` - Tentativas de login (para rate limiting)
20. `configuracoes_sistema` - Configurações do sistema (tempo de liberação, etc.)
21. `mensagens_automaticas` - Mensagens automáticas do sistema

---

## 📊 Detalhamento das Tabelas

### 1. `usuarios`

**Propósito:** Armazenar todos os usuários do sistema (Clientes, Prestadores, Moderadores e Administradores).

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do usuário | ✅ |
| `tipo` | Enum (TipoUsuario) | CLIENTE, PRESTADOR, MODERADOR, ADMIN | ✅ |
| `nome` | String | Nome completo do usuário | ✅ |
| `email` | String | Email do usuário (único) | ✅ |
| `senha` | String | Senha criptografada (bcrypt) | ✅ |
| `telefone` | String | Telefone de contato | ✅ |
| `cpf_cnpj` | String | CPF ou CNPJ (único) | ✅ |
| `data_nascimento` | DateTime | Data de nascimento | ✅ |
| `endereco` | JSON | Endereço completo (JSON) | ✅ |
| `foto_perfil` | String? | URL da foto de perfil | ❌ |
| `tipo_cliente` | String? | PF ou PJ (para clientes) | ❌ |
| `tipo_prestador` | String? | PF ou PJ (para prestadores) | ❌ |
| `descricao_profissional` | String? | Descrição dos serviços (prestador) | ❌ |
| `areas_atuacao` | String[] | Array de categorias de atuação | ❌ (default: []) |
| `portfolio` | String[] | Array de URLs de fotos/vídeos | ❌ (default: []) |
| `certificacoes` | String? | Certificações do prestador | ❌ |
| `experiencia_profissional` | String? | Experiência profissional | ❌ |
| `documento_verificacao` | String? | URL do documento (Certidão/Contrato) | ❌ |
| `documento_verificado` | Boolean | Se documento foi aprovado | ❌ (default: false) |
| `ativo` | Boolean | Se conta está ativa | ❌ (default: true) |
| `verificado` | Boolean | Se email foi verificado | ❌ (default: false) |
| `reputacao` | Float | Nota média de reputação | ❌ (default: 0.0) |
| `total_avaliacoes` | Int | Total de avaliações recebidas | ❌ (default: 0) |
| `pontos_penalidade` | Int | Pontos de penalidade | ❌ (default: 0) |
| `saldo_moedas` | Int | Saldo de moedas ChamadoPro | ❌ (default: 0) |
| `data_cadastro` | DateTime | Data de cadastro | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Informações pessoais do usuário
- Dados de autenticação (email, senha criptografada)
- Dados específicos do perfil (cliente ou prestador)
- Status e controle da conta
- Reputação e avaliações

**Formato do JSON `endereco`:**
```json
{
  "rua": "Rua das Flores, 123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "complemento": "Apto 45"
}
```

---

### 2. `posts`

**Propósito:** Armazenar posts de solicitação de serviços, ofertas de serviços e vitrines (cliente e prestador).

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do post | ✅ |
| `usuario_id` | UUID (String) | ID do usuário que criou | ✅ |
| `tipo` | Enum (TipoPost) | SOLICITACAO, OFERTA, VITRINE_PRESTADOR, VITRINE_CLIENTE | ✅ |
| `titulo` | String | Título do post | ✅ |
| `categoria` | String | Categoria do serviço | ✅ |
| `descricao` | String | Descrição detalhada | ✅ |
| `localizacao` | JSON | Localização (endereço, cidade, bairro) | ✅ |
| `preco_estimado` | Float? | Preço estimado | ❌ |
| `valor_por_hora` | Float? | Valor por hora (para prestadores) | ❌ |
| `prazo` | DateTime? | Prazo para execução | ❌ |
| `fotos` | String[] | Array de URLs das fotos | ❌ (default: []) |
| `urgencia` | Enum (Urgencia) | BAIXA, MEDIA, ALTA | ❌ (default: BAIXA) |
| `disponibilidade` | Enum (Disponibilidade)? | COMERCIAL_24_7, COMERCIAL_8_5, COMERCIAL_8_7 | ❌ |
| `status` | Enum (StatusPost) | ATIVO, ORCAMENTO_ACEITO, TRABALHO_CONCLUIDO, INATIVO, FINALIZADO, CANCELADO, ARQUIVADO | ❌ (default: ATIVO) |
| `is_apresentacao` | Boolean | Se é post de apresentação (público) | ❌ (default: false) |
| `prestador_escolhido_id` | UUID (String)? | ID do prestador escolhido | ❌ |
| `manter_visivel` | Boolean | Se deve aparecer em Serviços Concluídos | ❌ (default: false) |
| `excluido` | Boolean | Se foi excluído permanentemente | ❌ (default: false) |
| `servico_relacionado_id` | UUID (String)? | ID do contrato concluído (Vitrine Cliente) | ❌ |
| `prestador_recomendado_id` | UUID (String)? | ID do prestador recomendado (Vitrine Cliente) | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Informações do serviço solicitado/oferecido
- Dados de localização
- Fotos e descrições
- Status do post
- Relacionamento com contratos (para vitrines)

**Formato do JSON `localizacao`:**
```json
{
  "rua": "Rua das Flores, 123",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "estado": "SP",
  "cep": "01234-567",
  "municipio": "São Paulo"
}
```

---

### 3. `orcamentos`

**Propósito:** Armazenar orçamentos enviados por prestadores para posts de clientes.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do orçamento | ✅ |
| `post_id` | UUID (String) | ID do post relacionado | ✅ |
| `prestador_id` | UUID (String) | ID do prestador | ✅ |
| `cliente_id` | UUID (String) | ID do cliente | ✅ |
| `valor` | Float | Valor do orçamento | ✅ |
| `descricao` | String | Descrição detalhada | ✅ |
| `prazo_execucao` | Int | Prazo em dias | ✅ |
| `condicoes_pagamento` | String | Condições de pagamento | ✅ |
| `fotos` | String[] | Array de URLs de fotos | ❌ (default: []) |
| `garantia` | String? | Informações de garantia | ❌ |
| `desconto` | Float? | Valor de desconto | ❌ |
| `status` | Enum (StatusOrcamento) | PENDENTE, ACEITO, RECUSADO, CANCELADO, EXPIRADO | ❌ (default: PENDENTE) |
| `observacoes` | String? | Observações adicionais | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |
| `data_expiracao` | DateTime? | Data de expiração | ❌ |
| `valor_original` | Float? | Valor original (antes de negociação) | ❌ |
| `prazo_original` | Int? | Prazo original (antes de negociação) | ❌ |
| `contrapropostas` | Int | Número de contrapropostas | ❌ (default: 0) |
| `ultima_negociacao` | DateTime? | Data da última negociação | ❌ |

**Dados a serem gravados:**
- Dados do orçamento (valor, prazo, condições)
- Status do orçamento
- Histórico de negociações
- Fotos e documentos relacionados

---

### 4. `negociacoes_orcamento`

**Propósito:** Armazenar negociações entre cliente e prestador sobre orçamentos.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da negociação | ✅ |
| `orcamento_id` | UUID (String) | ID do orçamento | ✅ |
| `autor_id` | UUID (String) | ID do autor da negociação | ✅ |
| `tipo` | String | PROPOSTA, CONTRAPROPOSTA, ACEITE, REJEICAO, PERGUNTA | ✅ |
| `valor` | Float? | Novo valor proposto | ❌ |
| `prazo` | Int? | Novo prazo proposto | ❌ |
| `descricao` | String | Descrição da negociação | ✅ |
| `status` | String | ATIVA, RESPONDIDA, EXPIRADA | ❌ (default: ATIVA) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_resposta` | DateTime? | Data da resposta | ❌ |

**Dados a serem gravados:**
- Propostas de negociação
- Contrapropostas
- Aceites e rejeições
- Perguntas e respostas

---

### 5. `contratos`

**Propósito:** Armazenar contratos de prestação de serviços criados quando um orçamento é aceito.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do contrato | ✅ |
| `orcamento_id` | UUID (String) | ID do orçamento aceito (único) | ✅ |
| `cliente_id` | UUID (String) | ID do cliente | ✅ |
| `prestador_id` | UUID (String) | ID do prestador | ✅ |
| `valor` | Float | Valor do contrato | ✅ |
| `prazo` | DateTime | Prazo para conclusão | ✅ |
| `condicoes` | String | Condições do contrato | ✅ |
| `garantias` | String | Garantias oferecidas | ✅ |
| `status` | Enum (StatusContrato) | ATIVO, EM_EXECUCAO, CONCLUIDO, CANCELADO, DISPUTADO | ❌ (default: ATIVO) |
| `data_inicio` | DateTime? | Quando o trabalho foi iniciado | ❌ |
| `data_fim` | DateTime? | Quando o trabalho foi finalizado | ❌ |
| `quem_iniciou` | String? | 'CLIENTE' ou 'PRESTADOR' | ❌ |
| `quem_finalizou` | String? | 'CLIENTE' ou 'PRESTADOR' | ❌ |
| `aguardando_liberacao` | Boolean | Se está aguardando período de liberação | ❌ (default: false) |
| `data_liberacao_prevista` | DateTime? | Data prevista para liberação | ❌ |
| `fotos_antes` | String[] | Fotos do estado inicial | ❌ (default: []) |
| `fotos_depois` | String[] | Fotos do estado final | ❌ (default: []) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Dados do contrato (valor, prazo, condições)
- Status e andamento do serviço
- Datas de início e fim
- Fotos de evidência (antes e depois)
- Informações sobre quem iniciou/finalizou

---

### 6. `pagamentos`

**Propósito:** Armazenar pagamentos dos contratos, incluindo controle de liberação.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do pagamento | ✅ |
| `contrato_id` | UUID (String) | ID do contrato (único) | ✅ |
| `valor` | Float | Valor do pagamento | ✅ |
| `metodo` | Enum (MetodoPagamento) | CARTAO_CREDITO, CARTAO_DEBITO, PIX, BOLETO, TRANSFERENCIA | ✅ |
| `status` | Enum (StatusPagamento) | PENDENTE, PAGO, AGUARDANDO_LIBERACAO, LIBERADO, REEMBOLSADO, DISPUTADO | ❌ (default: PENDENTE) |
| `transacao_id` | String? | ID da transação no gateway | ❌ |
| `data_pagamento` | DateTime? | Data do pagamento | ❌ |
| `data_liberacao` | DateTime? | Data da liberação | ❌ |
| `taxa_plataforma` | Float | Taxa da plataforma (5%) | ✅ |
| `liberado_por` | String? | 'CLIENTE', 'PRESTADOR' ou 'AUTOMATICO' | ❌ |
| `motivo_liberacao` | String? | Descrição do motivo da liberação | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Dados do pagamento (valor, método, status)
- Taxa da plataforma (5%)
- Controle de liberação
- ID da transação no gateway de pagamento

---

### 7. `avaliacoes`

**Propósito:** Armazenar avaliações de serviços realizados.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da avaliação | ✅ |
| `avaliador_id` | UUID (String) | ID de quem avaliou | ✅ |
| `avaliado_id` | UUID (String) | ID de quem foi avaliado | ✅ |
| `contrato_id` | UUID (String) | ID do contrato relacionado | ✅ |
| `nota` | Int | Nota de 1 a 5 | ✅ |
| `comentario` | String? | Comentário da avaliação | ❌ |
| `tipo` | String | Tipo de avaliação | ❌ (default: SERVICO) |
| `aspectos` | JSON? | Aspectos avaliados (JSON) | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Nota e comentário da avaliação
- Aspectos específicos avaliados
- Relacionamento com contrato e usuários

**Formato do JSON `aspectos`:**
```json
{
  "qualidade": 5,
  "prazo": 4,
  "comunicacao": 5,
  "preco": 4
}
```

---

### 8. `disputas`

**Propósito:** Armazenar disputas abertas entre cliente e prestador.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da disputa | ✅ |
| `contrato_id` | UUID (String) | ID do contrato (único) | ✅ |
| `cliente_id` | UUID (String) | ID do cliente | ✅ |
| `prestador_id` | UUID (String) | ID do prestador | ✅ |
| `moderador_id` | UUID (String)? | ID do moderador responsável | ❌ |
| `tipo` | Enum (TipoDisputa) | SERVICO_INCOMPLETO, QUALIDADE_INFERIOR, MATERIAL_DIFERENTE, ATRASO_EXCESSIVO, COMPORTAMENTO_INADEQUADO | ✅ |
| `descricao` | String | Descrição da disputa | ✅ |
| `evidencias` | String[] | Array de URLs de evidências | ❌ (default: []) |
| `status` | Enum (StatusDisputa) | ABERTA, EM_ANALISE, RESOLVIDA, CANCELADA | ❌ (default: ABERTA) |
| `decisao` | String? | Decisão do moderador | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_resolucao` | DateTime? | Data da resolução | ❌ |

**Dados a serem gravados:**
- Informações da disputa (tipo, descrição)
- Evidências (fotos, documentos)
- Status e decisão do moderador
- Datas de abertura e resolução

---

### 9. `mensagens`

**Propósito:** Armazenar mensagens do chat entre cliente e prestador durante a execução do contrato.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da mensagem | ✅ |
| `contrato_id` | UUID (String) | ID do contrato | ✅ |
| `usuario_id` | UUID (String) | ID do usuário que enviou | ✅ |
| `conteudo` | String | Conteúdo da mensagem | ✅ |
| `tipo` | Enum (TipoMensagem) | TEXTO, IMAGEM, ARQUIVO, SISTEMA | ❌ (default: TEXTO) |
| `anexo_url` | String? | URL do anexo (se houver) | ❌ |
| `bloqueada` | Boolean | Se mensagem foi bloqueada | ❌ (default: false) |
| `motivo_bloqueio` | String? | Motivo do bloqueio | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Conteúdo da mensagem
- Tipo de mensagem (texto, imagem, arquivo)
- Anexos (URLs)
- Status de bloqueio (se houver)

---

### 10. `curtidas`

**Propósito:** Armazenar curtidas nos posts.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da curtida | ✅ |
| `post_id` | UUID (String) | ID do post | ✅ |
| `usuario_id` | UUID (String) | ID do usuário que curtiu | ✅ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Relacionamento post-usuário (único por post)
- Data da curtida

**Constraint:** `@@unique([post_id, usuario_id])` - Um usuário só pode curtir um post uma vez.

---

### 11. `transacoes_moedas`

**Propósito:** Armazenar transações de moedas ChamadoPro (créditos e débitos).

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da transação | ✅ |
| `usuario_id` | UUID (String) | ID do usuário | ✅ |
| `tipo` | String | 'CREDITO' ou 'DEBITO' | ✅ |
| `valor` | Int | Quantidade de moedas | ✅ |
| `descricao` | String | Descrição da transação | ✅ |
| `origem` | String? | 'RECOMENDACAO_PRESTADOR', 'COMPRA', 'DESCONTO', 'PROMOCAO' | ❌ |
| `referencia_id` | UUID (String)? | ID do post/contrato que gerou | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Créditos de moedas (recomendações, compras, promoções)
- Débitos de moedas (uso em posts, serviços)
- Histórico completo de transações

**Exemplos de uso:**
- **CREDITO:** Cliente associa prestador em Vitrine Cliente → +1 moeda
- **CREDITO:** Compra de moedas → +N moedas
- **DEBITO:** Criação de post → -N moedas

---

### 12. `comentarios`

**Propósito:** Armazenar comentários nos posts.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do comentário | ✅ |
| `post_id` | UUID (String) | ID do post | ✅ |
| `usuario_id` | UUID (String) | ID do usuário que comentou | ✅ |
| `conteudo` | String | Conteúdo do comentário | ✅ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Comentários dos usuários nos posts
- Relacionamento com post e usuário

---

### 13. `notificacoes`

**Propósito:** Armazenar notificações do sistema para os usuários.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da notificação | ✅ |
| `usuario_id` | UUID (String) | ID do usuário destinatário | ✅ |
| `tipo` | Enum (TipoNotificacao) | NOVO_ORCAMENTO, ORCAMENTO_ACEITO, ORCAMENTO_RECUSADO, NOVA_MENSAGEM, PAGAMENTO_CONFIRMADO, SERVICO_CONCLUIDO, DISPUTA_ABERTA, DISPUTA_RESOLVIDA, LEMBRETE_PRAZO, PROMOCAO, LEAD_QUENTE | ✅ |
| `titulo` | String | Título da notificação | ✅ |
| `mensagem` | String | Mensagem da notificação | ✅ |
| `lida` | Boolean | Se foi lida | ❌ (default: false) |
| `dados` | JSON? | Dados extras (opcional) | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Notificações do sistema
- Status de leitura
- Dados extras relacionados (JSON)

**Formato do JSON `dados`:**
```json
{
  "post_id": "uuid",
  "orcamento_id": "uuid",
  "contrato_id": "uuid",
  "acao_url": "/contratos/123"
}
```

---

### 14. `logs`

**Propósito:** Armazenar logs de auditoria e ações do sistema.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do log | ✅ |
| `usuario_id` | UUID (String)? | ID do usuário (se houver) | ❌ |
| `acao` | String | Tipo de ação | ✅ |
| `detalhes` | String | Detalhes da ação | ✅ |
| `ip` | String? | IP de origem | ❌ |
| `user_agent` | String? | User agent do navegador | ❌ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Ações dos usuários (criação de posts, orçamentos, etc.)
- Eventos do sistema
- Informações de segurança (IP, user agent)

**Exemplos de `acao`:**
- `CREATE_POST`
- `CREATE_ORCAMENTO`
- `ACEITAR_ORCAMENTO`
- `CREATE_CONTRATO`
- `LOGIN`
- `LOGOUT`

---

### 15. `movimentacoes_financeiras`

**Propósito:** Armazenar todas as movimentações financeiras (entradas e saídas) dos usuários.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da movimentação | ✅ |
| `usuario_id` | UUID (String) | ID do usuário | ✅ |
| `tipo` | String | 'ENTRADA' ou 'SAIDA' | ✅ |
| `valor` | Float | Valor da movimentação | ✅ |
| `descricao` | String | Descrição da movimentação | ✅ |
| `categoria` | String | ORCAMENTO_APROVADO, TAXA_PLATAFORMA, SAQUE, DEPOSITO, LEAD_QUENTE, ENVIO_ORCAMENTO, COMPRA_MOEDAS | ✅ |
| `status` | String | PENDENTE, APROVADO, REJEITADO, CANCELADO | ❌ (default: PENDENTE) |
| `referencia_id` | UUID (String)? | ID do contrato/orçamento/pagamento que gerou | ❌ |
| `referencia_tipo` | String? | 'CONTRATO', 'ORCAMENTO', 'PAGAMENTO', 'SAQUE', 'DEPOSITO' | ❌ |
| `data_movimentacao` | DateTime | Data da movimentação | ✅ (auto) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- **ENTRADA:** Recebimentos de orçamentos aprovados, depósitos
- **SAIDA:** Taxas da plataforma, saques, envio de orçamentos, compra de moedas
- Status de aprovação
- Referência ao contrato/orçamento que gerou

**Categorias de movimentação:**
- `ORCAMENTO_APROVADO` - Cliente pagou orçamento
- `TAXA_PLATAFORMA` - Taxa de 5% cobrada
- `LEAD_QUENTE` - Taxa de R$ 15,00 por lead quente
- `ENVIO_ORCAMENTO` - Taxa de R$ 10,00 por envio de orçamento
- `SAQUE` - Saque para conta bancária
- `DEPOSITO` - Depósito recebido
- `COMPRA_MOEDAS` - Compra de moedas ChamadoPro

---

### 16. `contas_bancarias`

**Propósito:** Armazenar contas bancárias cadastradas pelos usuários para recebimento.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da conta | ✅ |
| `usuario_id` | UUID (String) | ID do usuário | ✅ |
| `banco` | String | Nome do banco | ✅ |
| `agencia` | String | Agência | ✅ |
| `conta` | String | Número da conta | ✅ |
| `tipo` | String | 'CORRENTE' ou 'POUPANCA' | ✅ |
| `titular` | String | Nome do titular | ✅ |
| `cpf_cnpj` | String | CPF ou CNPJ do titular | ✅ |
| `principal` | Boolean | Se é a conta principal | ❌ (default: false) |
| `ativa` | Boolean | Se está ativa | ❌ (default: true) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Dados bancários completos
- Flag de conta principal
- Status ativo/inativo (soft delete)

---

### 17. `cartoes`

**Propósito:** Armazenar cartões de crédito/débito cadastrados pelos usuários.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do cartão | ✅ |
| `usuario_id` | UUID (String) | ID do usuário | ✅ |
| `numero_hash` | String | Últimos 4 dígitos (mascarado) | ✅ |
| `nome_titular` | String | Nome do titular | ✅ |
| `validade` | String | Validade (MM/AA) | ✅ |
| `tipo` | String | 'CREDITO' ou 'DEBITO' | ✅ |
| `bandeira` | String? | 'VISA', 'MASTERCARD', 'ELO', 'AMEX' | ❌ |
| `principal` | Boolean | Se é o cartão principal | ❌ (default: false) |
| `ativo` | Boolean | Se está ativo | ❌ (default: true) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Apenas últimos 4 dígitos do cartão (segurança)
- Dados do titular
- Bandeira detectada automaticamente
- Status ativo/inativo (soft delete)

⚠️ **SEGURANÇA:** O número completo do cartão NÃO é armazenado. Apenas os últimos 4 dígitos são salvos.

---

### 18. `tokens_verificacao`

**Propósito:** Armazenar tokens de verificação de email e recuperação de senha.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único do token | ✅ |
| `usuario_id` | UUID (String) | ID do usuário | ✅ |
| `token` | String | Token único | ✅ |
| `tipo` | Enum (TipoToken) | VERIFICACAO_EMAIL, RECUPERACAO_SENHA | ✅ |
| `expira_em` | DateTime | Data de expiração | ✅ |
| `usado` | Boolean | Se foi usado | ❌ (default: false) |
| `criado_em` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Tokens únicos para verificação
- Tipo de token
- Status de uso e expiração

---

### 19. `login_attempts`

**Propósito:** Armazenar tentativas de login para controle de rate limiting e segurança.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da tentativa | ✅ |
| `ip` | String | IP de origem | ✅ |
| `email` | String? | Email usado na tentativa | ❌ |
| `success` | Boolean | Se foi bem-sucedida | ✅ |
| `user_agent` | String? | User agent do navegador | ❌ |
| `blocked` | Boolean | Se IP está bloqueado | ❌ (default: false) |
| `block_expires` | DateTime? | Data de expiração do bloqueio | ❌ |
| `created_at` | DateTime | Data de criação | ✅ (auto) |

**Dados a serem gravados:**
- Tentativas de login (sucesso ou falha)
- Bloqueios temporários por IP
- Informações de segurança

---

### 20. `configuracoes_sistema`

**Propósito:** Armazenar configurações do sistema administráveis.

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da configuração | ✅ |
| `chave` | String | Chave única da configuração | ✅ |
| `valor` | String | Valor da configuração | ✅ |
| `descricao` | String? | Descrição do que faz | ❌ |
| `tipo` | String | 'INTEGER', 'STRING', 'BOOLEAN', 'FLOAT' | ✅ |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_atualizacao` | DateTime | Data da última atualização | ✅ (auto) |

**Dados a serem gravados:**
- Configurações do sistema
- Exemplo: `TEMPO_LIBERACAO_PRESTADOR` = "24" (horas)

**Configurações padrão:**
- `TEMPO_LIBERACAO_PRESTADOR` - Tempo em horas para liberação automática quando prestador finaliza (padrão: 24)

---

### 21. `mensagens_automaticas`

**Propósito:** Armazenar mensagens automáticas do sistema (orientações, avisos).

**Campos:**

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id` | UUID (String) | ID único da mensagem | ✅ |
| `tipo` | String | Tipo da mensagem (único) | ✅ |
| `titulo` | String | Título da mensagem | ✅ |
| `conteudo` | String | Conteúdo da mensagem | ✅ |
| `ativo` | Boolean | Se está ativa | ❌ (default: true) |
| `data_criacao` | DateTime | Data de criação | ✅ (auto) |
| `data_update` | DateTime | Data da última atualização | ✅ (auto) |
| `criado_por` | String? | ID do admin que criou | ❌ |
| `atualizado_por` | String? | ID do admin que atualizou | ❌ |

**Dados a serem gravados:**
- Mensagens automáticas do sistema
- Orientações para usuários
- Avisos e informações

---

## 🔗 Relacionamentos Principais

### Hierarquia de Dados:

```
Usuario
  ├── Posts
  │     ├── Orcamentos
  │     │     ├── Negociações
  │     │     └── Contrato
  │     │           ├── Pagamento
  │     │           ├── Avaliações
  │     │           ├── Mensagens
  │     │           └── Disputa
  │     ├── Curtidas
  │     └── Comentários
  ├── Transações Moedas
  ├── Movimentações Financeiras
  ├── Contas Bancárias
  ├── Cartões
  ├── Notificações
  └── Logs
```

### Relacionamentos Importantes:

1. **Usuario → Posts**: Um usuário pode ter vários posts
2. **Post → Orcamentos**: Um post pode ter vários orçamentos
3. **Orcamento → Contrato**: Um orçamento aceito gera um contrato (1:1)
4. **Contrato → Pagamento**: Um contrato tem um pagamento (1:1)
5. **Contrato → Avaliações**: Um contrato pode ter avaliações de ambos os lados
6. **Usuario → Movimentações Financeiras**: Um usuário tem várias movimentações
7. **Usuario → Contas Bancárias**: Um usuário pode ter várias contas
8. **Usuario → Cartões**: Um usuário pode ter vários cartões

---

## 📝 Enums do Sistema

### TipoUsuario
- `CLIENTE` - Cliente que solicita serviços
- `PRESTADOR` - Prestador que oferece serviços
- `MODERADOR` - Moderador do sistema
- `ADMIN` - Administrador do sistema

### TipoPost
- `SOLICITACAO` - Cliente solicita um serviço
- `OFERTA` - Prestador oferece um serviço
- `VITRINE_PRESTADOR` - Vitrine do prestador (portfólio)
- `VITRINE_CLIENTE` - Vitrine do cliente (recomenda prestador)

### StatusPost
- `ATIVO` - Post ativo e visível
- `ORCAMENTO_ACEITO` - Cliente aceitou um orçamento
- `TRABALHO_CONCLUIDO` - Prestador marcou como concluído
- `INATIVO` - Post finalizado
- `FINALIZADO` - Status legado
- `CANCELADO` - Post cancelado
- `ARQUIVADO` - Post arquivado

### StatusOrcamento
- `PENDENTE` - Aguardando resposta
- `ACEITO` - Aceito pelo cliente
- `RECUSADO` - Recusado pelo cliente
- `CANCELADO` - Cancelado
- `EXPIRADO` - Expirado

### StatusContrato
- `ATIVO` - Contrato ativo
- `EM_EXECUCAO` - Serviço em execução
- `CONCLUIDO` - Serviço concluído
- `CANCELADO` - Contrato cancelado
- `DISPUTADO` - Em disputa

### StatusPagamento
- `PENDENTE` - Aguardando pagamento
- `PAGO` - Pagamento confirmado
- `AGUARDANDO_LIBERACAO` - Aguardando liberação (quando prestador finaliza)
- `LIBERADO` - Pagamento liberado
- `REEMBOLSADO` - Pagamento reembolsado
- `DISPUTADO` - Pagamento em disputa

### MetodoPagamento
- `CARTAO_CREDITO` - Cartão de crédito
- `CARTAO_DEBITO` - Cartão de débito
- `PIX` - PIX
- `BOLETO` - Boleto bancário
- `TRANSFERENCIA` - Transferência bancária

### Urgencia
- `BAIXA` - Urgência baixa
- `MEDIA` - Urgência média
- `ALTA` - Urgência alta

### Disponibilidade
- `COMERCIAL_24_7` - 24 horas, 7 dias por semana
- `COMERCIAL_8_5` - Comercial (8h às 18h, segunda a sexta)
- `COMERCIAL_8_7` - Comercial + finais de semana

---

## 🔐 Segurança e Boas Práticas

### Dados Sensíveis
1. **Senhas**: Sempre criptografadas com bcrypt
2. **Cartões**: Apenas últimos 4 dígitos armazenados
3. **CPF/CNPJ**: Armazenados mas devem ser protegidos (LGPD)
4. **Dados bancários**: Armazenados com criptografia em produção

### Soft Delete
- Contas bancárias e cartões usam `ativa: false` para remoção
- Posts usam `excluido: true` para exclusão permanente

### Índices
- Índices criados para melhorar performance em:
  - `usuario_id` + `data_movimentacao` (movimentações)
  - `usuario_id` + `status` (movimentações)
  - `post_id` + `usuario_id` (curtidas - único)
  - `ip` + `created_at` (login attempts)
  - `email` + `created_at` (login attempts)

---

## 📊 Estatísticas e Relatórios

### Dados Calculáveis (não armazenados diretamente):

1. **Saldo Disponível**: Soma de entradas aprovadas - soma de saídas aprovadas
2. **Saldo Pendente**: Soma de entradas pendentes
3. **Reputação**: Média das notas de avaliações recebidas
4. **Total de Avaliações**: Contagem de avaliações recebidas

---

## 🔄 Fluxo de Dados Financeiros

### Exemplo: Orçamento Aceito

1. **Orcamento** → Status: `ACEITO`
2. **Contrato** → Criado automaticamente
3. **Pagamento** → Criado com status `PENDENTE`
4. **MovimentacaoFinanceira (ENTRADA)** → Cliente paga → Status: `PAGO`
5. **Pagamento** → Status: `PAGO`
6. **Contrato** → Serviço iniciado → Status: `EM_EXECUCAO`
7. **Contrato** → Serviço finalizado → Status: `CONCLUIDO`
8. **MovimentacaoFinanceira (SAIDA)** → Taxa plataforma (5%) → Status: `APROVADO`
9. **Pagamento** → Status: `LIBERADO` → Prestador recebe

### Exemplo: Lead Quente

1. Cliente solicita serviço diretamente ao prestador
2. **MovimentacaoFinanceira (SAIDA)** → Cliente paga R$ 15,00 → Status: `PAGO`
3. Notificação enviada ao prestador

### Exemplo: Envio de Orçamento

1. Prestador envia orçamento
2. **MovimentacaoFinanceira (SAIDA)** → Prestador paga R$ 10,00 → Status: `PAGO`

---

## 📌 Observações Importantes

1. **Email não é único**: O sistema permite múltiplos perfis (CLIENTE e PRESTADOR) com o mesmo email
2. **CPF/CNPJ é único**: Cada perfil tem um CPF/CNPJ único
3. **Relacionamentos híbridos**: Um PRESTADOR pode ter um CLIENTE associado (via `prestador_associado_id`)
4. **Moedas ChamadoPro**: Sistema de moedas interno para transações na plataforma
5. **Fotos de evidência**: Crucial para disputas, armazenadas em `fotos_antes` e `fotos_depois`
6. **Pagamento em escrow**: Dinheiro fica retido até conclusão do serviço
7. **Taxa da plataforma**: 5% sobre o valor do contrato
8. **Taxas de lead**: R$ 15,00 (lead quente) e R$ 10,00 (envio de orçamento)

---

## 🔧 Comandos Úteis

### Aplicar Migrations
```bash
cd backend
npx prisma migrate deploy
```

### Regenerar Prisma Client
```bash
cd backend
npx prisma generate
```

### Verificar Schema
```bash
cd backend
npx prisma validate
```

### Abrir Prisma Studio (Visualizador)
```bash
cd backend
npx prisma studio
```

---

## 📅 Última Atualização

- **Data:** 04/11/2025
- **Versão do Schema:** Com tabelas financeiras (movimentacoes_financeiras, contas_bancarias, cartoes)
- **Total de Tabelas:** 21

---

**Nota:** Esta documentação reflete o estado atual do banco de dados. Para atualizações futuras, consulte as migrations em `backend/prisma/migrations/`.

