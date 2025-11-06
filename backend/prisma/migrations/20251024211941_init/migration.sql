-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'PRESTADOR', 'MODERADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "TipoPost" AS ENUM ('SOLICITACAO', 'OFERTA');

-- CreateEnum
CREATE TYPE "Urgencia" AS ENUM ('BAIXA', 'MEDIA', 'ALTA');

-- CreateEnum
CREATE TYPE "StatusPost" AS ENUM ('ATIVO', 'FINALIZADO', 'CANCELADO', 'ARQUIVADO');

-- CreateEnum
CREATE TYPE "StatusOrcamento" AS ENUM ('PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "StatusContrato" AS ENUM ('ATIVO', 'CONCLUIDO', 'CANCELADO', 'DISPUTADO');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'BOLETO', 'TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'PAGO', 'LIBERADO', 'REEMBOLSADO', 'DISPUTADO');

-- CreateEnum
CREATE TYPE "TipoDisputa" AS ENUM ('SERVICO_INCOMPLETO', 'QUALIDADE_INFERIOR', 'MATERIAL_DIFERENTE', 'ATRASO_EXCESSIVO', 'COMPORTAMENTO_INADEQUADO');

-- CreateEnum
CREATE TYPE "StatusDisputa" AS ENUM ('ABERTA', 'EM_ANALISE', 'RESOLVIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoMensagem" AS ENUM ('TEXTO', 'IMAGEM', 'ARQUIVO', 'SISTEMA');

-- CreateEnum
CREATE TYPE "TipoNotificacao" AS ENUM ('NOVO_ORCAMENTO', 'ORCAMENTO_ACEITO', 'ORCAMENTO_RECUSADO', 'NOVA_MENSAGEM', 'PAGAMENTO_CONFIRMADO', 'SERVICO_CONCLUIDO', 'DISPUTA_ABERTA', 'DISPUTA_RESOLVIDA', 'LEMBRETE_PRAZO', 'PROMOCAO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "data_nascimento" TIMESTAMP(3) NOT NULL,
    "endereco" JSONB NOT NULL,
    "foto_perfil" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "reputacao" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pontos_penalidade" INTEGER NOT NULL DEFAULT 0,
    "data_cadastro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoPost" NOT NULL,
    "titulo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "localizacao" JSONB NOT NULL,
    "preco_estimado" DOUBLE PRECISION,
    "prazo" TIMESTAMP(3),
    "fotos" TEXT[],
    "urgencia" "Urgencia" NOT NULL DEFAULT 'BAIXA',
    "status" "StatusPost" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "prestador_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "prazo_execucao" INTEGER NOT NULL,
    "condicoes_pagamento" TEXT NOT NULL,
    "fotos" TEXT[],
    "garantia" TEXT,
    "desconto" DOUBLE PRECISION,
    "status" "StatusOrcamento" NOT NULL DEFAULT 'PENDENTE',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratos" (
    "id" TEXT NOT NULL,
    "orcamento_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "prestador_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "condicoes" TEXT NOT NULL,
    "garantias" TEXT NOT NULL,
    "status" "StatusContrato" NOT NULL DEFAULT 'ATIVO',
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL,
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "transacao_id" TEXT,
    "data_pagamento" TIMESTAMP(3),
    "data_liberacao" TIMESTAMP(3),
    "taxa_plataforma" DOUBLE PRECISION NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "avaliador_id" TEXT NOT NULL,
    "avaliado_id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "aspectos" JSONB NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputas" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "prestador_id" TEXT NOT NULL,
    "moderador_id" TEXT,
    "tipo" "TipoDisputa" NOT NULL,
    "descricao" TEXT NOT NULL,
    "evidencias" TEXT[],
    "status" "StatusDisputa" NOT NULL DEFAULT 'ABERTA',
    "decisao" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_resolucao" TIMESTAMP(3),

    CONSTRAINT "disputas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "contrato_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tipo" "TipoMensagem" NOT NULL DEFAULT 'TEXTO',
    "anexo_url" TEXT,
    "bloqueada" BOOLEAN NOT NULL DEFAULT false,
    "motivo_bloqueio" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curtidas" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curtidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comentarios" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" "TipoNotificacao" NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "acao" TEXT NOT NULL,
    "detalhes" TEXT NOT NULL,
    "ip" TEXT,
    "user_agent" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_cnpj_key" ON "usuarios"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "contratos_orcamento_id_key" ON "contratos"("orcamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_contrato_id_key" ON "pagamentos"("contrato_id");

-- CreateIndex
CREATE UNIQUE INDEX "disputas_contrato_id_key" ON "disputas"("contrato_id");

-- CreateIndex
CREATE UNIQUE INDEX "curtidas_post_id_usuario_id_key" ON "curtidas"("post_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratos" ADD CONSTRAINT "contratos_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliador_id_fkey" FOREIGN KEY ("avaliador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliado_id_fkey" FOREIGN KEY ("avaliado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputas" ADD CONSTRAINT "disputas_moderador_id_fkey" FOREIGN KEY ("moderador_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_contrato_id_fkey" FOREIGN KEY ("contrato_id") REFERENCES "contratos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curtidas" ADD CONSTRAINT "curtidas_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curtidas" ADD CONSTRAINT "curtidas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios" ADD CONSTRAINT "comentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
