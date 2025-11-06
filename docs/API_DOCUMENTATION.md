# ChamadoPro - Documentação da API

## 📋 Visão Geral

Esta documentação descreve todos os endpoints da API do ChamadoPro, incluindo parâmetros, respostas e exemplos de uso.

**Base URL**: `http://localhost:3001/api`  
**Versão**: 3.2.0  
**Formato**: JSON

---

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header `Authorization`:

```
Authorization: Bearer <seu_token_jwt>
```

---

## 📚 Endpoints

### 🔑 Autenticação

#### POST /auth/register
Registra um novo usuário no sistema.

**Body:**
```json
{
  "tipo": "CLIENTE" | "PRESTADOR",
  "nome": "string",
  "email": "string",
  "senha": "string",
  "telefone": "string",
  "cpf_cnpj": "string",
  "data_nascimento": "string (ISO 8601)",
  "endereco": {
    "cep": "string",
    "rua": "string",
    "numero": "string",
    "bairro": "string",
    "cidade": "string",
    "estado": "string",
    "latitude": "number",
    "longitude": "number"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nome": "string",
      "email": "string",
      "tipo": "string",
      "verificado": false
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### POST /auth/login
Autentica um usuário existente.

**Body:**
```json
{
  "email": "string",
  "senha": "string"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nome": "string",
      "email": "string",
      "tipo": "string"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### GET /auth/me
Retorna os dados do usuário logado.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "nome": "string",
      "email": "string",
      "tipo": "string",
      "telefone": "string",
      "cpf_cnpj": "string",
      "endereco": "object",
      "foto_perfil": "string",
      "ativo": true,
      "verificado": false,
      "reputacao": 0.0,
      "data_cadastro": "string"
    }
  }
}
```

#### POST /auth/forgot-password
Solicita recuperação de senha.

**Body:**
```json
{
  "email": "string"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Email de recuperação enviado"
}
```

#### PUT /auth/reset-password/:token
Redefine a senha do usuário.

**Body:**
```json
{
  "novaSenha": "string"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Senha redefinida com sucesso"
}
```

---

### 📝 Posts

#### GET /posts
Lista posts com filtros e paginação.

**Query Parameters:**
- `tipo`: "SOLICITACAO" | "OFERTA"
- `categoria`: string
- `latitude`: number
- `longitude`: number
- `raio`: number (km)
- `search`: string
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "usuario_id": "uuid",
        "tipo": "string",
        "titulo": "string",
        "categoria": "string",
        "descricao": "string",
        "localizacao": "object",
        "preco_estimado": "number",
        "prazo": "string",
        "fotos": ["string"],
        "urgencia": "string",
        "status": "string",
        "data_criacao": "string",
        "usuario": "object",
        "_count": {
          "orcamentos": "number",
          "curtidas": "number",
          "comentarios": "number"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### POST /posts
Cria um novo post.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "tipo": "SOLICITACAO" | "OFERTA",
  "titulo": "string",
  "categoria": "string",
  "descricao": "string",
  "localizacao": {
    "endereco": "string",
    "latitude": "number",
    "longitude": "number"
  },
  "preco_estimado": "number",
  "prazo": "string (ISO 8601)",
  "fotos": ["string"],
  "urgencia": "BAIXA" | "MEDIA" | "ALTA"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "titulo": "string",
      "descricao": "string",
      "status": "ATIVO",
      "data_criacao": "string"
    }
  }
}
```

#### GET /posts/:id
Busca um post específico.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "post": {
      "id": "uuid",
      "titulo": "string",
      "descricao": "string",
      "usuario": "object",
      "orcamentos": ["object"]
    }
  }
}
```

#### PUT /posts/:id
Atualiza um post existente.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "titulo": "string",
  "descricao": "string",
  "preco_estimado": "number",
  "status": "ATIVO" | "FINALIZADO" | "CANCELADO"
}
```

#### DELETE /posts/:id
Remove um post.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Post removido com sucesso"
}
```

#### POST /posts/:id/curtir
Curtir um post.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Post curtido com sucesso"
}
```

#### DELETE /posts/:id/curtir
Descurtir um post.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Curtida removida com sucesso"
}
```

---

### 💰 Orçamentos

#### GET /orcamentos
Lista orçamentos com filtros.

**Query Parameters:**
- `post_id`: uuid
- `prestador_id`: uuid
- `cliente_id`: uuid
- `status`: "PENDENTE" | "ACEITO" | "RECUSADO" | "CANCELADO" | "EXPIRADO"
- `page`: number
- `limit`: number

**Resposta:**
```json
{
  "success": true,
  "data": {
    "orcamentos": [
      {
        "id": "uuid",
        "post_id": "uuid",
        "prestador_id": "uuid",
        "cliente_id": "uuid",
        "valor": "number",
        "descricao": "string",
        "prazo_execucao": "number",
        "condicoes_pagamento": "string",
        "fotos": ["string"],
        "garantia": "string",
        "desconto": "number",
        "status": "string",
        "data_criacao": "string",
        "post": "object",
        "prestador": "object",
        "cliente": "object"
      }
    ],
    "pagination": "object"
  }
}
```

#### POST /orcamentos
Cria um novo orçamento.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "post_id": "uuid",
  "valor": "number",
  "descricao": "string",
  "prazo_execucao": "number",
  "condicoes_pagamento": "string",
  "fotos": ["string"],
  "garantia": "string",
  "desconto": "number"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "orcamento": {
      "id": "uuid",
      "valor": "number",
      "status": "PENDENTE",
      "data_criacao": "string"
    }
  }
}
```

#### POST /orcamentos/:id/aceitar
Aceita um orçamento.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Orçamento aceito com sucesso",
  "data": {
    "contrato": "object"
  }
}
```

#### POST /orcamentos/:id/recusar
Recusa um orçamento.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Orçamento recusado"
}
```

#### POST /orcamentos/:id/cancelar
Cancela um orçamento.

**Headers:** `Authorization: Bearer <token>`

**Resposta:**
```json
{
  "success": true,
  "message": "Orçamento cancelado"
}
```

---

### 📄 Contratos

#### GET /contratos
Lista contratos do usuário.

**Query Parameters:**
- `cliente_id`: uuid
- `prestador_id`: uuid
- `status`: "ATIVO" | "CONCLUIDO" | "CANCELADO" | "DISPUTADO"
- `page`: number
- `limit`: number

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contratos": [
      {
        "id": "uuid",
        "orcamento_id": "uuid",
        "cliente_id": "uuid",
        "prestador_id": "uuid",
        "valor": "number",
        "prazo": "string",
        "condicoes": "string",
        "garantias": "string",
        "status": "string",
        "data_criacao": "string",
        "orcamento": "object",
        "prestador": "object",
        "cliente": "object",
        "_count": {
          "mensagens": "number",
          "avaliacoes": "number"
        }
      }
    ],
    "pagination": "object"
  }
}
```

#### GET /contratos/:id
Busca um contrato específico.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "contrato": {
      "id": "uuid",
      "valor": "number",
      "status": "string",
      "orcamento": "object",
      "mensagens": ["object"],
      "avaliacoes": ["object"]
    }
  }
}
```

#### PUT /contratos/:id/status
Atualiza o status do contrato.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "status": "CONCLUIDO" | "CANCELADO"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Status atualizado com sucesso"
}
```

---

### 💬 Chat

#### GET /chat/messages
Busca mensagens de um contrato.

**Query Parameters:**
- `contrato_id`: uuid (obrigatório)
- `page`: number
- `limit`: number

**Resposta:**
```json
{
  "success": true,
  "data": {
    "mensagens": [
      {
        "id": "uuid",
        "contrato_id": "uuid",
        "usuario_id": "uuid",
        "conteudo": "string",
        "tipo": "TEXTO" | "IMAGEM" | "ARQUIVO" | "SISTEMA",
        "anexo_url": "string",
        "bloqueada": false,
        "motivo_bloqueio": "string",
        "data_criacao": "string",
        "usuario": "object"
      }
    ],
    "pagination": "object"
  }
}
```

#### POST /chat/messages
Envia uma mensagem.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contrato_id": "uuid",
  "conteudo": "string",
  "tipo": "TEXTO" | "IMAGEM" | "ARQUIVO"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "mensagem": {
      "id": "uuid",
      "conteudo": "string",
      "data_criacao": "string"
    }
  }
}
```

#### POST /chat/mark-read
Marca mensagens como lidas.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contrato_id": "uuid"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Mensagens marcadas como lidas"
}
```

---

### ⭐ Avaliações

#### GET /avaliacoes
Lista avaliações.

**Query Parameters:**
- `avaliador_id`: uuid
- `avaliado_id`: uuid
- `contrato_id`: uuid
- `page`: number
- `limit`: number

**Resposta:**
```json
{
  "success": true,
  "data": {
    "avaliacoes": [
      {
        "id": "uuid",
        "avaliador_id": "uuid",
        "avaliado_id": "uuid",
        "contrato_id": "uuid",
        "nota": "number",
        "comentario": "string",
        "aspectos": {
          "competencia": "number",
          "pontualidade": "number",
          "atendimento": "number",
          "preco_qualidade": "number"
        },
        "data_criacao": "string",
        "avaliador": "object",
        "avaliado": "object"
      }
    ],
    "pagination": "object"
  }
}
```

#### POST /avaliacoes
Cria uma nova avaliação.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "contrato_id": "uuid",
  "avaliado_id": "uuid",
  "nota": "number (1-5)",
  "comentario": "string",
  "aspectos": {
    "competencia": "number (1-5)",
    "pontualidade": "number (1-5)",
    "atendimento": "number (1-5)",
    "preco_qualidade": "number (1-5)"
  }
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "avaliacao": {
      "id": "uuid",
      "nota": "number",
      "data_criacao": "string"
    }
  }
}
```

---

### 🔍 Busca

#### GET /busca
Busca posts e usuários.

**Query Parameters:**
- `q`: string (obrigatório)
- `categoria`: string
- `latitude`: number
- `longitude`: number
- `raio`: number
- `page`: number
- `limit`: number

**Resposta:**
```json
{
  "success": true,
  "data": {
    "posts": ["object"],
    "usuarios": ["object"],
    "pagination": "object"
  }
}
```

---

### 📤 Upload

#### POST /upload/foto
Upload de foto.

**Headers:** `Authorization: Bearer <token>`

**Body:** `multipart/form-data`
- `file`: File
- `tipo`: "perfil" | "post" | "evidencia"
- `contrato_id`: uuid (opcional)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "url": "string",
    "filename": "string",
    "size": "number"
  }
}
```

---

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Dados inválidos |
| 401 | Não autorizado |
| 403 | Acesso negado |
| 404 | Não encontrado |
| 409 | Conflito (ex: email já existe) |
| 422 | Erro de validação |
| 429 | Muitas requisições |
| 500 | Erro interno do servidor |

---

## 🔒 Códigos de Erro

### Erros de Validação (422)
```json
{
  "success": false,
  "message": "Erro de validação",
  "errors": [
    "Email é obrigatório",
    "Senha deve ter pelo menos 8 caracteres"
  ]
}
```

### Erros de Autenticação (401)
```json
{
  "success": false,
  "message": "Não autorizado, token inválido"
}
```

### Erros de Autorização (403)
```json
{
  "success": false,
  "message": "Usuário não autorizado a acessar esta rota"
}
```

### Erros de Recursos (404)
```json
{
  "success": false,
  "message": "Post não encontrado"
}
```

### Erros Internos (500)
```json
{
  "success": false,
  "message": "Erro interno do servidor",
  "error": "Detalhes do erro (apenas em desenvolvimento)"
}
```

---

## 📝 Exemplos de Uso

### Criar um Post
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "SOLICITACAO",
    "titulo": "Preciso de um encanador",
    "categoria": "Encanamento",
    "descricao": "Vazamento na torneira da cozinha",
    "localizacao": {
      "endereco": "Rua das Flores, 123",
      "latitude": -23.5505,
      "longitude": -46.6333
    },
    "preco_estimado": 150,
    "urgencia": "ALTA"
  }'
```

### Enviar Orçamento
```bash
curl -X POST http://localhost:3001/api/orcamentos \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "post_id": "uuid-do-post",
    "valor": 120,
    "descricao": "Vou trocar a torneira e verificar toda a instalação",
    "prazo_execucao": 2,
    "condicoes_pagamento": "50% na contratação e 50% na conclusão"
  }'
```

### Enviar Mensagem
```bash
curl -X POST http://localhost:3001/api/chat/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contrato_id": "uuid-do-contrato",
    "conteudo": "Olá! Quando posso começar o serviço?",
    "tipo": "TEXTO"
  }'
```

---

## 🔄 Rate Limiting

A API implementa rate limiting para prevenir abuso:

- **Limite**: 100 requisições por IP a cada 15 minutos
- **Header de resposta**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Resposta quando excedido**: 429 Too Many Requests

---

## 📱 Webhooks

### Pagar.me
A API recebe webhooks do Pagar.me para notificar sobre mudanças no status dos pagamentos:

**Endpoint**: `POST /webhooks/pagarme`

**Payload exemplo**:
```json
{
  "id": "transaction_id",
  "status": "paid",
  "amount": 10000,
  "payment_method": "credit_card"
}
```

---

*Documentação da API - Versão 3.2.0*  
*Última atualização: Janeiro 2025*

