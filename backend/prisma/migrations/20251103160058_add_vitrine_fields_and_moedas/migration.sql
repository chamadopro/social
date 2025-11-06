-- AlterTable: Adicionar campos para Vitrine Cliente
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "servico_relacionado_id" TEXT;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "prestador_recomendado_id" TEXT;

-- AlterTable: Adicionar saldo de moedas ao usuário
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "saldo_moedas" INTEGER NOT NULL DEFAULT 0;

-- CreateTable: Criar tabela de transações de moedas
CREATE TABLE IF NOT EXISTS "transacoes_moedas" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" INTEGER NOT NULL,
    "descricao" TEXT NOT NULL,
    "origem" TEXT,
    "referencia_id" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacoes_moedas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transacoes_moedas_usuario_id_data_criacao_idx" ON "transacoes_moedas"("usuario_id", "data_criacao");

-- AddForeignKey: Relacionar post com contrato
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_servico_relacionado_id_fkey'
    ) THEN
        ALTER TABLE "posts" ADD CONSTRAINT "posts_servico_relacionado_id_fkey" 
        FOREIGN KEY ("servico_relacionado_id") REFERENCES "contratos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Relacionar post com prestador recomendado
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'posts_prestador_recomendado_id_fkey'
    ) THEN
        ALTER TABLE "posts" ADD CONSTRAINT "posts_prestador_recomendado_id_fkey" 
        FOREIGN KEY ("prestador_recomendado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey: Relacionar transação de moeda com usuário
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transacoes_moedas_usuario_id_fkey'
    ) THEN
        ALTER TABLE "transacoes_moedas" ADD CONSTRAINT "transacoes_moedas_usuario_id_fkey" 
        FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

