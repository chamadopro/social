-- AlterTable: Adicionar campos de andamento ao Contrato
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "data_inicio" TIMESTAMP(3);
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "data_fim" TIMESTAMP(3);
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "quem_iniciou" TEXT;
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "quem_finalizou" TEXT;
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "aguardando_liberacao" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "data_liberacao_prevista" TIMESTAMP(3);

-- AlterEnum: Adicionar EM_EXECUCAO ao StatusContrato
ALTER TYPE "StatusContrato" ADD VALUE IF NOT EXISTS 'EM_EXECUCAO';

-- AlterEnum: Adicionar AGUARDANDO_LIBERACAO ao StatusPagamento
ALTER TYPE "StatusPagamento" ADD VALUE IF NOT EXISTS 'AGUARDANDO_LIBERACAO';

-- AlterTable: Adicionar campos de liberação ao Pagamento
ALTER TABLE "pagamentos" ADD COLUMN IF NOT EXISTS "liberado_por" TEXT;
ALTER TABLE "pagamentos" ADD COLUMN IF NOT EXISTS "motivo_liberacao" TEXT;

-- CreateTable: Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS "configuracoes_sistema" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" TEXT NOT NULL,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: Índice único para chave
CREATE UNIQUE INDEX IF NOT EXISTS "configuracoes_sistema_chave_key" ON "configuracoes_sistema"("chave");

-- Inserir configuração padrão de tempo de liberação (24 horas)
INSERT INTO "configuracoes_sistema" ("id", "chave", "valor", "descricao", "tipo", "data_criacao", "data_atualizacao")
VALUES (
    gen_random_uuid()::text,
    'TEMPO_LIBERACAO_PRESTADOR',
    '24',
    'Tempo em horas para liberação automática do pagamento quando prestador finaliza o trabalho (padrão: 24 horas)',
    'INTEGER',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("chave") DO NOTHING;

