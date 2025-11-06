-- CreateTable
CREATE TABLE IF NOT EXISTS "movimentacoes_financeiras" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "referencia_id" TEXT,
    "referencia_tipo" TEXT,
    "data_movimentacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movimentacoes_financeiras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "contas_bancarias" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titular" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cartoes" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "numero_hash" TEXT NOT NULL,
    "nome_titular" TEXT NOT NULL,
    "validade" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "bandeira" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cartoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "movimentacoes_financeiras_usuario_id_data_movimentacao_idx" ON "movimentacoes_financeiras"("usuario_id", "data_movimentacao");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "movimentacoes_financeiras_usuario_id_status_idx" ON "movimentacoes_financeiras"("usuario_id", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contas_bancarias_usuario_id_idx" ON "contas_bancarias"("usuario_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "cartoes_usuario_id_idx" ON "cartoes"("usuario_id");

-- AddForeignKey
ALTER TABLE "movimentacoes_financeiras" ADD CONSTRAINT "movimentacoes_financeiras_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cartoes" ADD CONSTRAINT "cartoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

