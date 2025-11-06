# DOCUMENTACAO TECNICA COMPLETA - CHAMADOPRO v3.2

## INDICE
1. [Introducao](#introducao)
2. [Login e Cadastro](#login-cadastro)
3. [Feed e Postagens](#feed-postagens)
4. [Orcamentos e Contratos](#orcamentos-contratos)
5. [Chat com IA Moderadora](#chat-ia)
6. [Pagamentos e Escrow](#pagamentos-escrow)
7. [Upload de Fotos e Evidencias](#upload-fotos)
8. [Disputas e Mediacao](#disputas-mediacao)
9. [Avaliacoes e Reputacao](#avaliacoes-reputacao)
10. [Penalidades e Moderacao](#penalidades-moderacao)
11. [Logs e Auditoria](#logs-auditoria)
12. [Seguranca e Compliance](#seguranca-compliance)
13. [Sistema de Usuarios](#sistema-usuarios)
14. [Sistema de Localizacao](#sistema-localizacao)
15. [Sistema de Busca e Filtros](#sistema-busca)
16. [Sistema de Notificacoes](#sistema-notificacoes)
17. [Estrutura de Dados](#estrutura-dados)
18. [APIs e Endpoints](#apis-endpoints)
19. [Performance e Escalabilidade](#performance)
20. [Testes](#testes)
21. [Deploy e Infraestrutura](#deploy)
22. [Identidade Visual e Design](#identidade-visual)
23. [Proximos Passos](#proximos-passos)

---

## INTRODUCAO {#introducao}

O ChamadoPro e uma plataforma de intermediacao de servicos entre clientes e prestadores, desenvolvida pela Teep Tecnologia em 2025. O sistema conecta pessoas que precisam de servicos com profissionais qualificados, facilitando a contratacao atraves de sistema de orcamentos, avaliacoes e pagamentos integrados.

### **Objetivo do Documento**
Este documento descreve de forma detalhada as funcionalidades, fluxos e regras de negocio do sistema ChamadoPro. Cada modulo apresenta as acoes esperadas, condicoes e respostas automaticas do sistema.

### **Publico-Alvo**
- **Desenvolvedores**: Backend e frontend
- **QA**: Testes e validacao
- **Integracoes**: Pagar.me e IA de moderacao
- **Administradores**: Gestao e moderacao

### **Funcionalidades Principais**
- Sistema de cadastro e autenticacao
- Feed unificado com posts de clientes e prestadores
- Sistema de orcamentos e negociacao
- Chat com IA moderadora
- Pagamentos integrados com escrow
- Sistema de avaliacoes e reputacao
- Upload obrigatorio de evidencias
- Sistema de disputas e mediacao
- Penalidades automaticas
- Logs e auditoria completos

---

## LOGIN E CADASTRO {#login-cadastro}

Controle de autenticacao e criacao de contas para clientes (PF) e prestadores (PJ/MEI).

### **Tipos de Usuario**

#### **1. CLIENTE (Pessoa Fisica)**
**Dados Obrigatorios:**
- Nome completo
- Email (unico)
- Senha (minimo 8 caracteres)
- Telefone/WhatsApp
- CPF
- Data de nascimento
- Endereco completo (CEP, rua, numero, bairro, cidade, estado)
- Localizacao GPS (latitude/longitude)

**Dados Opcionais:**
- Foto de perfil
- Preferencias de notificacao
- Historico de servicos contratados

#### **2. PRESTADOR (PJ/MEI)**
**Dados Obrigatorios:**
- Nome completo/Razao social
- Email (unico)
- Senha (minimo 8 caracteres)
- Telefone/WhatsApp
- CPF/CNPJ
- Data de nascimento/abertura
- Endereco completo
- Localizacao GPS
- Areas de atuacao (categorias)
- Descricao profissional
- Portfolio (fotos/videos dos trabalhos)

**Dados Opcionais:**
- Foto de perfil
- Certificacoes
- Experiencia profissional
- Disponibilidade
- Preco por hora/servico
- Avaliacoes recebidas

#### **3. MODERADOR**
**Dados Obrigatorios:**
- Nome completo
- Email corporativo
- Senha forte
- Nivel de acesso

**Permissoes:**
- Moderacao de conteudo
- Gerenciamento de disputas
- Aplicacao de penalidades
- Acesso a logs de auditoria

#### **4. ADMINISTRADOR**
**Dados Obrigatorios:**
- Nome completo
- Email corporativo
- Senha forte
- Nivel de acesso

**Permissoes:**
- Gerenciamento de usuarios
- Configuracoes do sistema
- Relatorios e analytics
- Acesso total ao sistema

### **Regras de Negocio - Login e Cadastro**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Cadastro de Cliente | Todos os campos obrigatorios preenchidos corretamente | Criar conta e enviar e-mail de confirmacao |
| Cadastro de Prestador | Documentos validos e aprovados | Ativar perfil e liberar acesso ao feed |
| Tentativas invalidas de login | 5 consecutivas | Bloquear login por 10 minutos |
| Recuperacao de senha | Link expirado | Solicitar nova requisicao |
| Login bem-sucedido | Credenciais validas | Criar sessao JWT valida por 7 dias |
| Conta inativa | Usuario nao acessa ha 90 dias | Exibir mensagem e solicitar reativacao |

### **Validacoes de Seguranca**
- Email valido e unico
- CPF/CNPJ valido
- Senha: minimo 8 caracteres, 1 maiuscula, 1 minuscula, 1 numero, 1 simbolo
- Telefone: formato brasileiro valido
- CEP: valido e existente
- Verificacao de email obrigatoria
- Validacao de documentos para prestadores

---

## FEED E POSTAGENS {#feed-postagens}

Area onde clientes publicam solicitacoes e prestadores divulgam portfolios de servico. O feed e dinamico, filtrado por categoria, proximidade geografica e relevancia.

### **Tipos de Post**

#### **1. SOLICITACAO DE SERVICO (Cliente)**
**Campos Obrigatorios:**
- Titulo do servico
- Categoria
- Descricao detalhada
- Localizacao (endereco + GPS)
- Prazo desejado
- Orcamento estimado (opcional)

**Campos Opcionais:**
- Fotos do problema/situacao
- Urgencia (baixa/media/alta)
- Preferencias de horario
- Observacoes especiais

#### **2. OFERTA DE SERVICO (Prestador)**
**Campos Obrigatorios:**
- Titulo do servico
- Categoria
- Descricao dos servicos
- Areas de atuacao
- Preco base

**Campos Opcionais:**
- Portfolio de trabalhos
- Disponibilidade
- Promocoes especiais
- Certificacoes

### **Regras de Negocio - Feed**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Criacao de postagem | Cliente autenticado e campos validos | Registrar solicitacao e exibir no feed |
| Edicao de postagem | Status ≠ "em atendimento" | Permitir alteracao e salvar nova versao |
| Expiracao de postagem | Sem resposta apos 30 dias | Arquivar automaticamente |
| Exclusao de postagem | Cliente cancela solicitacao | Remover do feed e registrar log |
| Denuncia de conteudo | Reportada por outro usuario | Enviar para moderacao |

### **Feed Unificado**
- Posts de clientes e prestadores misturados
- Ordenacao por relevancia e proximidade
- Filtros por categoria, localizacao, preco
- Sistema de curtidas e comentarios
- Compartilhamento

### **Algoritmo de Relevancia**
- Proximidade geografica (40%)
- Avaliacao do prestador (30%)
- Disponibilidade (15%)
- Preco competitivo (10%)
- Tempo de resposta (5%)

---

## ORCAMENTOS E CONTRATOS {#orcamentos-contratos}

Fluxo de envio, negociacao e aceitacao de propostas entre cliente e prestador. Cada orcamento aceito gera um contrato digital, com valores, prazos e garantias.

### **Fluxo de Orcamento**

#### **1. SOLICITACAO DE ORCAMENTO**
- Cliente cria post de solicitacao
- Prestadores visualizam e enviam propostas
- Prazo para envio de orcamentos (7 dias)

#### **2. PROPOSTA DE ORCAMENTO**
**Campos Obrigatorios:**
- Valor total
- Prazo de execucao
- Descricao detalhada do servico
- Condicoes de pagamento

**Campos Opcionais:**
- Fotos de trabalhos similares
- Referencias
- Garantia oferecida
- Desconto por pagamento a vista

#### **3. NEGOCIACAO**
- Chat direto entre cliente e prestador
- Contrapostas de valor
- Ajustes no escopo
- Prazo de validade da proposta

#### **4. ACEITACAO**
- Cliente aceita orcamento
- Contrato automatico gerado
- Pagamento processado via escrow
- Servico iniciado

### **Regras de Negocio - Orcamentos**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Envio de orcamento | Prestador autenticado e solicitacao aberta | Registrar proposta e notificar cliente |
| Aceite de proposta | Cliente confirma orcamento | Gerar contrato e acionar pagamento via escrow |
| Cancelamento de proposta | Antes do aceite | Excluir proposta e notificar prestador |
| Expiracao de proposta | Sem resposta apos 7 dias | Arquivar proposta automaticamente |
| Reenvio de orcamento | Orcamento rejeitado | Permitir reenviar com novo valor ou prazo |

### **Contrato Digital**
- Valores e prazos acordados
- Condicoes de pagamento
- Garantias oferecidas
- Termos de cancelamento
- Assinatura digital das partes

---

## CHAT COM IA MODERADORA {#chat-ia}

Canal de comunicacao entre cliente e prestador, com IA que impede troca de contatos pessoais (telefone, e-mail, WhatsApp, links). Mensagens sao processadas em tempo real e bloqueadas caso violem as politicas da plataforma.

### **Funcionalidades da IA Moderadora**
- Deteccao de numeros de telefone
- Bloqueio de enderecos de email
- Prevencao de links externos
- Deteccao de tentativas de contato externo
- Moderacao de conteudo ofensivo
- Deteccao de comportamentos suspeitos

### **Regras de Negocio - Chat**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Envio de mensagem | Texto contem telefone, e-mail ou link | Bloquear mensagem e alertar usuario |
| Reincidencia de bloqueio | 3 mensagens bloqueadas em 24h | Suspender chat e notificar moderacao |
| Abertura de disputa | Cliente relata problema | Exibir botao "Abrir disputa" e criar canal de mediacao |
| Anexo de imagem | Formato invalido ou acima de 5MB | Rejeitar upload e exibir alerta |
| Chat encerrado | Contrato finalizado | Tornar historico somente leitura |

### **Tipos de Bloqueio**
- **Telefone**: Numeros, WhatsApp, contatos
- **Email**: Enderecos de email
- **Links**: URLs externas
- **Conteudo**: Linguagem ofensiva
- **Comportamento**: Tentativas de fraude

### **Sistema de Penalidades**
- **1a infracao**: Aviso
- **2a infracao**: Suspensao de 24h
- **3a infracao**: Suspensao de 7 dias
- **4a infracao**: Suspensao de 30 dias
- **5a infracao**: Banimento permanente

---

## PAGAMENTOS E ESCROW {#pagamentos-escrow}

O sistema usa Pagar.me para processar pagamentos via escrow (custodia temporaria). O valor pago pelo cliente fica bloqueado ate a confirmacao da conclusao do servico.

### **Metodos de Pagamento**
- Cartao de credito/debito
- PIX
- Boleto bancario
- Transferencia bancaria

### **Fluxo de Pagamento**

#### **1. PAGAMENTO ANTECIPADO (ESCROW)**
- Cliente paga ao aceitar orcamento
- Valor fica em custodia da plataforma
- Liberacao apos conclusao do servico
- Protecao para ambas as partes

**Regras de Escrow:**
- **Deposito**: 100% do valor depositado na conta escrow
- **Prazo de Liberacao**: 24h apos marcacao como concluido
- **Liberacao Automatica**: Se cliente nao contestar em 24h
- **Contestacao**: Cliente pode contestar em ate 7 dias
- **Mediacao**: Plataforma media disputas
- **Reembolso**: Cliente pode solicitar reembolso em ate 48h

#### **2. PAGAMENTO PARCELADO (ESCROW PARCIAL)**
- Dividido em etapas do servico
- Primeira parcela antecipada (30%)
- Demais parcelas conforme progresso
- Aprovacao do cliente para cada etapa

#### **3. PAGAMENTO DIRETO**
- Cliente paga diretamente ao prestador
- Sem intermediacao da plataforma
- Menor protecao
- Taxa reduzida (2%)

### **Regras de Negocio - Escrow**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Pagamento confirmado | Status = "paid" | Liberar botao "Iniciar servico" ao prestador |
| Cliente confirma entrega | Status = "service_done" | Liberar repasse apos 24h |
| Disputa aberta | Status = "disputed" | Congelar repasse e ativar chat de mediacao |
| Liberacao automatica | 7 dias sem contestacao | Efetuar repasse automatico |
| Cancelamento | Antes da execucao | Reembolso integral (menos taxa de processamento) |

### **Taxas da Plataforma**
- **Escrow**: 5% sobre o valor do servico
- **Direto**: 2% sobre o valor do servico
- **Minimo**: R$ 2,00
- **Maximo**: R$ 50,00
- **Desconto**: 5% para pagamentos a vista

---

## UPLOAD DE FOTOS E EVIDENCIAS {#upload-fotos}

Controle de comprovacao visual do servico — antes e depois. Obrigatorio para liberacao de pagamento.

### **Tipos de Evidencias**

#### **1. FOTO INICIAL (Obrigatoria)**
- Estado atual do problema
- Localizacao exata do servico
- Condicoes gerais
- Upload obrigatorio para iniciar servico

#### **2. FOTOS DURANTE O SERVICO (Opcionais)**
- Progresso do trabalho
- Materiais utilizados
- Etapas importantes
- Upload opcional

#### **3. FOTO FINAL (Obrigatoria)**
- Resultado final
- Servico concluido
- Limpeza do local
- Upload obrigatorio para concluir

### **Regras de Negocio - Fotos**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Inicio do servico | Prestador nao enviou foto inicial | Bloquear inicio ate upload ser concluido |
| Conclusao do servico | Sem foto final | Bloquear status "Concluido" |
| Confirmacao do cliente | Sem foto final | Exibir alerta, mas permitir encerramento |
| Disputa ativa | Falta de imagens | Moderador solicita reenvio de evidencias |
| Upload incorreto | Arquivo com rosto/texto | IA bloqueia e solicita nova imagem |

### **Validacoes de Upload**
- **Formato**: JPG, PNG, WEBP
- **Tamanho**: Maximo 5MB por foto
- **Quantidade**: Minimo 1, maximo 10 fotos
- **Qualidade**: Resolucao minima 800x600
- **Conteudo**: Sem rostos ou informacoes pessoais

---

## DISPUTAS E MEDIACAO {#disputas-mediacao}

Processo de resolucao de conflito entre cliente e prestador. Conduzido pelo moderador, com comunicacao via chat triplo.

### **Tipos de Disputa**
- **Servico Incompleto**: Servico nao foi finalizado
- **Qualidade Inferior**: Servico nao atendeu expectativas
- **Material Diferente**: Material nao conforme especificado
- **Atraso Excessivo**: Servico atrasou alem do prazo
- **Comportamento Inadequado**: Prestador teve comportamento inadequado

### **Processo de Disputa**

#### **1. ABERTURA**
- Cliente abre disputa em ate 72h
- Sistema cria chat triplo
- Congela pagamento em escrow
- Notifica prestador e moderador

#### **2. COLETA DE EVIDENCIAS**
- Moderador solicita evidencias
- Ambas as partes enviam fotos/documentos
- Prazo de 48h para envio
- Analise das evidencias

#### **3. MEDIACAO**
- Chat triplo com moderador
- Negociacao entre as partes
- Propostas de solucao
- Prazo de 7 dias para resolucao

#### **4. DECISAO**
- Moderador analisa evidencias
- Toma decisao final
- Executa reembolso ou liberacao
- Registra resultado

### **Regras de Negocio - Disputas**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Abertura de disputa | Cliente dentro de 72h apos conclusao | Criar chat de mediacao e congelar repasse |
| Coleta de evidencias | Moderador solicita novas imagens | Notificar ambas as partes |
| Decisao final | Analise concluida | Executar reembolso ou liberacao |
| Encerramento automatico | Nenhuma resposta em 7 dias | Liberar pagamento ao prestador |
| Reincidencia de disputa | Mesmo prestador com 3 disputas | Bloquear novas propostas ate revisao |

### **Decisoes Possiveis**
- **Liberacao Total**: Pagamento liberado para prestador
- **Liberacao Parcial**: Pagamento parcial + reembolso parcial
- **Reembolso Total**: Cliente recebe reembolso completo
- **Reexecucao**: Prestador deve refazer o servico
- **Mediacao Externa**: Caso complexo enviado para mediacao externa

---

## AVALIACOES E REPUTACAO {#avaliacoes-reputacao}

Sistema de avaliacao mutua apos a entrega do servico. Os dados alimentam a reputacao publica de cada usuario.

### **Sistema de Avaliacao**

#### **1. AVALIACAO DO SERVICO (Cliente)**
- Nota de 1 a 5 estrelas
- Comentario obrigatorio
- Avaliacao de competencia tecnica
- Pontualidade
- Atendimento
- Relacao preco/qualidade

#### **2. AVALIACAO DO CLIENTE (Prestador)**
- Facilidade de comunicacao
- Clareza na solicitacao
- Pontualidade nos pagamentos
- Respeito aos prazos

### **Calculo de Reputacao**
- Media das ultimas 12 avaliacoes
- Peso por recencia (avaliacoes recentes valem mais)
- Penalizacoes por cancelamentos
- Bonus por avaliacoes positivas

### **Regras de Negocio - Avaliacoes**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Avaliacao obrigatoria | Apos liberacao do pagamento | Exibir tela de avaliacao antes de encerrar contrato |
| Reputacao calculada | Media das ultimas 12 avaliacoes | Atualizar ranking do prestador |
| Avaliacao negativa | Nota < 3 | Enviar alerta a moderacao |
| Falta de avaliacao | 5 dias apos conclusao | Enviar lembrete automatico |
| Prestador bloqueado | Reputacao < 2,5 | Suspender conta ate revisao manual |

### **Niveis de Reputacao**
- **5.0 - 4.5**: Excelente (verde)
- **4.4 - 3.5**: Bom (azul)
- **3.4 - 2.5**: Regular (amarelo)
- **2.4 - 1.0**: Ruim (vermelho)
- **< 2.5**: Bloqueado (cinza)

---

## PENALIDADES E MODERACAO {#penalidades-moderacao}

Sistema automatico de punicoes baseado em comportamento e historico de infracoes.

### **Tipos de Penalidades**

#### **1. ADVERTENCIA**
- Primeira infracao leve
- Notificacao ao usuario
- Sem restricoes de acesso
- Registro no historico

#### **2. SUSPENSAO TEMPORARIA**
- 24h, 7 dias ou 30 dias
- Bloqueio de funcionalidades
- Notificacao de motivo
- Possibilidade de recurso

#### **3. BANIMENTO PERMANENTE**
- Infracoes graves
- Fraude confirmada
- Comportamento inadequado
- Sem possibilidade de recurso

### **Regras de Negocio - Penalidades**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Tentativa de contato externo | Detectada por IA | Bloquear mensagem e aplicar advertencia |
| Reincidencia | 2 infracoes em 24h | Suspender conta por 24h |
| Publicacao indevida | Conteudo inapropriado ou ofensivo | Ocultar post e notificar usuario |
| Fraude confirmada | Analise manual | Banimento permanente |
| Banimento revertido | Erro confirmado pela moderacao | Reativar conta e remover penalidade |

### **Sistema de Pontos**
- **0-2 pontos**: Conta normal
- **3-5 pontos**: Aviso de moderacao
- **6-10 pontos**: Suspensao de 24h
- **11-20 pontos**: Suspensao de 7 dias
- **21-30 pontos**: Suspensao de 30 dias
- **31+ pontos**: Banimento permanente

---

## LOGS E AUDITORIA {#logs-auditoria}

O sistema registra todas as acoes criticas para fins de rastreabilidade e seguranca.

### **Tipos de Logs**

#### **1. LOGS DE AUTENTICACAO**
- Login/logout
- Tentativas de acesso
- Recuperacao de senha
- Alteracao de credenciais

#### **2. LOGS DE TRANSACOES**
- Pagamentos processados
- Liberacoes de escrow
- Reembolsos
- Disputas

#### **3. LOGS DE MODERACAO**
- Penalidades aplicadas
- Conteudo removido
- Disputas resolvidas
- Acoes administrativas

#### **4. LOGS DE SISTEMA**
- Erros de aplicacao
- Performance
- Backup/restore
- Atualizacoes

### **Regras de Negocio - Logs**

| Evento | Condicao | Acao do Sistema |
|--------|----------|-----------------|
| Login realizado | Autenticacao bem-sucedida | Registrar IP, data e horario |
| Alteracao de dados | Mudanca em campos criticos | Gerar log e notificar administrador |
| Pagamento processado | Confirmacao Pagar.me | Registrar evento financeiro |
| Disputa encerrada | Decisao moderador | Salvar registro permanente |
| Exclusao de conta | Solicitacao do usuario | Guardar backup por 90 dias antes da remocao |

### **Retencao de Logs**
- **Logs de seguranca**: 6 meses
- **Logs de transacoes**: 2 anos
- **Logs de moderacao**: 1 ano
- **Logs de sistema**: 3 meses
- **Backup de contas**: 90 dias

---

## SEGURANCA E COMPLIANCE {#seguranca-compliance}

100% aderente a LGPD com seguranca de nivel bancario.

### **Criptografia**
- **Dados sensiveis**: AES-256
- **Comunicacao**: TLS 1.3
- **Senhas**: bcrypt com salt
- **Tokens**: JWT com expiracao
- **Backup**: Criptografia de ponta a ponta

### **Compliance LGPD**
- **Consentimento**: Explicito e granular
- **Direito ao esquecimento**: Implementado
- **Portabilidade**: Exportacao de dados
- **Transparencia**: Politica de privacidade clara
- **Auditoria**: Logs de acesso a dados

### **Permissoes Hierarquicas**
- **Cliente**: Acesso aos proprios dados
- **Prestador**: Dados + portfolio
- **Moderador**: Dados + moderacao
- **Administrador**: Acesso total

### **Monitoramento de Seguranca**
- **Detecao de intrusao**: 24/7
- **Anomalias**: Alertas automaticos
- **Tentativas de fraude**: Bloqueio automatico
- **Auditoria**: Relatorios mensais

---

## SISTEMA DE USUARIOS {#sistema-usuarios}

Gerenciamento completo de usuarios e permissoes.

### **Estrutura de Usuarios**
- **ID unico**: UUID v4
- **Tipo**: Cliente, Prestador, Moderador, Admin
- **Status**: Ativo, Inativo, Suspenso, Banido
- **Verificacao**: Email, Telefone, Documentos
- **Reputacao**: Calculada automaticamente

### **Validacoes de Seguranca**
- **Email**: Unico e verificado
- **CPF/CNPJ**: Valido e unico
- **Senha**: Complexa e segura
- **Telefone**: Formato brasileiro
- **Documentos**: Verificacao automatica

---

## SISTEMA DE LOCALIZACAO {#sistema-localizacao}

Geolocalizacao e areas de atuacao.

### **Funcionalidades**
- **GPS**: Captura automatica
- **CEP**: Validacao e preenchimento
- **Mapas**: Integracao com Google Maps
- **Busca**: Por proximidade
- **Filtros**: Raio configuravel

### **Areas de Atuacao**
- **Prestadores**: Definem areas de trabalho
- **Clientes**: Buscam por proximidade
- **Calculo**: Distancia automatica
- **Filtros**: Por regiao

---

## SISTEMA DE BUSCA E FILTROS {#sistema-busca}

Busca inteligente e filtros avancados.

### **Filtros Disponiveis**
- **Categoria**: Tipo de servico
- **Localizacao**: Raio em km
- **Preco**: Faixa de valores
- **Disponibilidade**: Horarios
- **Avaliacao**: Nota minima
- **Tipo**: Cliente/Prestador

### **Algoritmo de Relevancia**
- **Proximidade**: 40%
- **Avaliacao**: 30%
- **Disponibilidade**: 15%
- **Preco**: 10%
- **Tempo**: 5%

---

## SISTEMA DE NOTIFICACOES {#sistema-notificacoes}

Notificacoes em tempo real.

### **Tipos de Notificacao**
- **Push**: Mobile
- **Email**: Importantes
- **SMS**: Urgentes
- **In-app**: Todas

### **Eventos de Notificacao**
- **Novos orcamentos**
- **Respostas a orcamentos**
- **Mensagens no chat**
- **Lembretes de prazo**
- **Atualizacoes de status**
- **Promocoes**

---

## ESTRUTURA DE DADOS {#estrutura-dados}

Modelos de dados do sistema.

### **Usuario**
```json
{
  "id": "uuid",
  "tipo": "cliente|prestador|moderador|admin",
  "nome": "string",
  "email": "string",
  "senha": "hash",
  "telefone": "string",
  "cpf_cnpj": "string",
  "endereco": {
    "cep": "string",
    "rua": "string",
    "numero": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "foto_perfil": "url",
  "ativo": "boolean",
  "verificado": "boolean",
  "reputacao": "number",
  "data_cadastro": "datetime"
}
```

### **Post**
```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "tipo": "solicitacao|oferta",
  "titulo": "string",
  "categoria": "string",
  "descricao": "text",
  "localizacao": {
    "endereco": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "preco_estimado": "number",
  "prazo": "date",
  "fotos": ["url"],
  "status": "ativo|finalizado|cancelado",
  "data_criacao": "datetime"
}
```

### **Orcamento**
```json
{
  "id": "uuid",
  "post_id": "uuid",
  "prestador_id": "uuid",
  "cliente_id": "uuid",
  "valor": "number",
  "descricao": "text",
  "prazo_execucao": "number",
  "condicoes_pagamento": "string",
  "status": "pendente|aceito|recusado|cancelado",
  "data_criacao": "datetime"
}
```

### **Contrato**
```json
{
  "id": "uuid",
  "orcamento_id": "uuid",
  "cliente_id": "uuid",
  "prestador_id": "uuid",
  "valor": "number",
  "prazo": "date",
  "condicoes": "text",
  "garantias": "text",
  "status": "ativo|concluido|cancelado",
  "data_criacao": "datetime"
}
```

### **Pagamento**
```json
{
  "id": "uuid",
  "contrato_id": "uuid",
  "valor": "number",
  "metodo": "string",
  "status": "pendente|pago|reembolsado",
  "transacao_id": "string",
  "data_pagamento": "datetime"
}
```

### **Avaliacao**
```json
{
  "id": "uuid",
  "avaliador_id": "uuid",
  "avaliado_id": "uuid",
  "contrato_id": "uuid",
  "nota": "number",
  "comentario": "text",
  "aspectos": {
    "competencia": "number",
    "pontualidade": "number",
    "atendimento": "number",
    "preco_qualidade": "number"
  },
  "data_criacao": "datetime"
}
```

### **Disputa**
```json
{
  "id": "uuid",
  "contrato_id": "uuid",
  "cliente_id": "uuid",
  "prestador_id": "uuid",
  "moderador_id": "uuid",
  "tipo": "string",
  "descricao": "text",
  "evidencias": ["url"],
  "status": "aberta|em_analise|resolvida",
  "decisao": "string",
  "data_criacao": "datetime"
}
```

### **Log**
```json
{
  "id": "uuid",
  "usuario_id": "uuid",
  "acao": "string",
  "detalhes": "text",
  "ip": "string",
  "user_agent": "string",
  "data_criacao": "datetime"
}
```

---

## APIs E ENDPOINTS {#apis-endpoints}

API RESTful completa.

### **Autenticacao**
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Dados do usuario

### **Usuarios**
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Dados do usuario
- `PUT /api/users/:id` - Atualizar usuario
- `DELETE /api/users/:id` - Deletar usuario

### **Posts**
- `GET /api/posts` - Listar posts
- `POST /api/posts` - Criar post
- `GET /api/posts/:id` - Dados do post
- `PUT /api/posts/:id` - Atualizar post
- `DELETE /api/posts/:id` - Deletar post

### **Orcamentos**
- `GET /api/orcamentos` - Listar orcamentos
- `POST /api/orcamentos` - Criar orcamento
- `PUT /api/orcamentos/:id` - Atualizar orcamento
- `POST /api/orcamentos/:id/aceitar` - Aceitar orcamento
- `POST /api/orcamentos/:id/recusar` - Recusar orcamento

### **Contratos**
- `GET /api/contratos` - Listar contratos
- `GET /api/contratos/:id` - Dados do contrato
- `POST /api/contratos/:id/iniciar` - Iniciar servico
- `POST /api/contratos/:id/concluir` - Concluir servico

### **Pagamentos**
- `POST /api/pagamentos` - Processar pagamento
- `GET /api/pagamentos/:id` - Status do pagamento
- `POST /api/pagamentos/:id/reembolso` - Solicitar reembolso

### **Chat**
- `GET /api/chat/:contrato_id` - Mensagens do chat
- `POST /api/chat/:contrato_id/mensagem` - Enviar mensagem
- `POST /api/chat/:contrato_id/disputa` - Abrir disputa

### **Avaliacoes**
- `GET /api/avaliacoes` - Listar avaliacoes
- `POST /api/avaliacoes` - Criar avaliacao
- `PUT /api/avaliacoes/:id` - Atualizar avaliacao

### **Disputas**
- `GET /api/disputas` - Listar disputas
- `POST /api/disputas` - Criar disputa
- `PUT /api/disputas/:id` - Atualizar disputa
- `POST /api/disputas/:id/resolver` - Resolver disputa

### **Upload**
- `POST /api/upload/foto` - Upload de foto
- `POST /api/upload/evidencia` - Upload de evidencia

### **Busca**
- `GET /api/busca` - Buscar conteudo
- `GET /api/busca/sugestoes` - Sugestoes de busca

---

## PERFORMANCE E ESCALABILIDADE {#performance}

Otimizacoes para alta performance.

### **Frontend**
- **Minificacao**: Assets comprimidos
- **Cache**: Recursos estaticos
- **Lazy Loading**: Imagens sob demanda
- **Code Splitting**: Carregamento otimizado
- **CDN**: Distribuicao global

### **Backend**
- **Cache Redis**: Dados frequentes
- **Indexacao**: Banco otimizado
- **Paginacao**: Resultados limitados
- **Compressao**: Respostas comprimidas
- **Load Balancing**: Distribuicao de carga

### **Banco de Dados**
- **Indexes**: Otimizados
- **Sharding**: Por regiao
- **Replicacao**: Leitura distribuida
- **Backup**: Automatizado
- **Monitoramento**: Performance

---

## TESTES {#testes}

Estrategia completa de testes.

### **Testes Unitarios**
- **Cobertura**: 90%+
- **Funcoes criticas**: 100%
- **Mocks**: Dependencias externas
- **CI/CD**: Automatizados

### **Testes de Integracao**
- **APIs**: Endpoints
- **Banco**: Dados
- **Pagamentos**: Pagar.me
- **Notificacoes**: Push/Email

### **Testes E2E**
- **Fluxos**: Completos
- **Regressao**: Automatizados
- **Performance**: Carga
- **Acessibilidade**: WCAG

### **Testes de Seguranca**
- **Penetracao**: Vulnerabilidades
- **Autenticacao**: JWT
- **Autorizacao**: Permissoes
- **Dados**: Criptografia

---

## DEPLOY E INFRAESTRUTURA {#deploy}

Infraestrutura robusta e escalavel.

### **Ambientes**
- **Desenvolvimento**: Local
- **Staging**: Testes
- **Producao**: Live

### **CI/CD**
- **GitHub Actions**: Automatizado
- **Deploy**: Zero downtime
- **Testes**: Automatizados
- **Rollback**: Automatico

### **Monitoramento**
- **Logs**: Centralizados
- **Metricas**: Performance
- **Alertas**: Automatizados
- **Dashboard**: Tempo real

### **Backup**
- **Banco**: Diario
- **Arquivos**: Continuo
- **Recuperacao**: Testada
- **Contingencia**: Plano

---

## PROXIMOS PASSOS {#proximos-passos}

Roadmap de desenvolvimento.

### **Fase 1 - Backend (Q1 2025)**
- Implementar autenticacao JWT
- Desenvolver API RESTful
- Integrar Pagar.me
- Implementar sistema de escrow

### **Fase 2 - IA e Moderacao (Q2 2025)**
- Desenvolver IA de moderacao
- Implementar chat triplo
- Sistema de penalidades
- Upload obrigatorio de fotos

### **Fase 3 - Mobile e Integracoes (Q3 2025)**
- App mobile nativo
- Integracao WhatsApp
- Notificacoes push
- Geolocalizacao avancada

### **Fase 4 - Otimizacoes (Q4 2025)**
- Performance
- Escalabilidade
- Seguranca
- Compliance

---

## IDENTIDADE VISUAL E DESIGN {#identidade-visual}

Sistema de cores e elementos visuais que definem a identidade da plataforma ChamadoPro.

### **Paleta de Cores Principal**

#### **Cores Primárias**
- **Laranja Primário**: #FF6B35 (Energia, criatividade, confiança)
- **Azul Primário**: #004E89 (Profissionalismo, confiabilidade, estabilidade)

#### **Variações de Laranja**
- **Laranja Claro**: #FF8A65 (Hover states, highlights)
- **Laranja Escuro**: #E55A2B (Botões ativos, elementos importantes)
- **Laranja Suave**: #FFF3E0 (Fundo de alertas, badges)

#### **Variações de Azul**
- **Azul Claro**: #1976D2 (Links, elementos interativos)
- **Azul Escuro**: #002A5C (Textos importantes, headers)
- **Azul Suave**: #E3F2FD (Fundo de informações, cards)

#### **Cores de Apoio**
- **Branco**: #FFFFFF (Fundo principal)
- **Cinza Claro**: #F5F5F5 (Fundo secundário)
- **Cinza Médio**: #757575 (Textos secundários)
- **Cinza Escuro**: #424242 (Textos principais)
- **Verde Sucesso**: #4CAF50 (Confirmações, sucesso)
- **Vermelho Erro**: #F44336 (Erros, alertas críticos)

### **Aplicação no Sistema de Reputação**

| Nível | Faixa | Cor | Código |
|-------|-------|-----|--------|
| Excelente | 4.5-5.0 | Verde | #4CAF50 |
| Bom | 3.5-4.4 | Azul | #1976D2 |
| Regular | 2.5-3.4 | Laranja | #FF6B35 |
| Ruim | 1.0-2.4 | Vermelho | #F44336 |
| Bloqueado | <2.5 | Cinza | #757575 |

### **Elementos de Interface**

#### **Botões e Ações**
- **Botões Primários**: Laranja #FF6B35
- **Botões Secundários**: Azul #004E89
- **Botões de Sucesso**: Verde #4CAF50
- **Botões de Erro**: Vermelho #F44336

#### **Navegação e Layout**
- **Header/Navbar**: Azul #004E89
- **Footer**: Azul escuro #002A5C
- **Sidebar**: Branco com borda azul sutil
- **Cards**: Branco com sombra sutil

#### **Textos e Links**
- **Títulos**: Azul escuro #002A5C
- **Textos Principais**: Cinza escuro #424242
- **Textos Secundários**: Cinza médio #757575
- **Links**: Azul #1976D2
- **Links Hover**: Laranja #FF6B35

### **Estados e Feedback Visual**

#### **Estados de Interação**
- **Hover**: Laranja claro #FF8A65
- **Active**: Laranja escuro #E55A2B
- **Focus**: Azul claro #1976D2
- **Disabled**: Cinza médio #757575

#### **Alertas e Notificações**
- **Sucesso**: Fundo verde claro com texto verde escuro
- **Aviso**: Fundo laranja suave com texto laranja escuro
- **Erro**: Fundo vermelho claro com texto vermelho escuro
- **Info**: Fundo azul suave com texto azul escuro

### **Responsividade e Acessibilidade**

#### **Contraste Mínimo**
- **Texto sobre fundo claro**: 4.5:1
- **Texto sobre fundo escuro**: 3:1
- **Elementos interativos**: 3:1

#### **Breakpoints**
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### **Guia de Uso**

#### **Quando Usar Laranja**
- Botões de ação principal
- Elementos de destaque
- Estados de alerta/aviso
- Badges de status
- Ícones de ação

#### **Quando Usar Azul**
- Navegação principal
- Links e elementos interativos
- Informações importantes
- Headers e títulos
- Estados de informação

#### **Quando Usar Verde**
- Confirmações de sucesso
- Status positivos
- Botões de confirmação
- Indicadores de progresso

#### **Quando Usar Vermelho**
- Erros e alertas críticos
- Botões de cancelamento
- Estados de bloqueio
- Indicadores de problema

---

## CONSIDERACOES FINAIS

### **Beneficios para Clientes**
- Acesso a profissionais qualificados
- Precos competitivos
- Seguranca nas transacoes
- Avaliacoes e reputacao
- Suporte ao cliente

### **Beneficios para Prestadores**
- Acesso a novos clientes
- Pagamentos garantidos
- Ferramentas de gestao
- Marketing digital
- Crescimento do negocio

### **Beneficios para a Plataforma**
- Receita recorrente
- Crescimento da base de usuarios
- Dados valiosos
- Oportunidades de expansao
- Impacto social positivo

### **Metricas de Sucesso**
- Numero de usuarios ativos
- Volume de transacoes
- Taxa de conversao
- Satisfacao do cliente
- Tempo de resposta

---

*Documento criado em: Janeiro 2025*
*Versao: 3.2*
*Status: Em desenvolvimento*
*Desenvolvido por: Teep Tecnologia*



