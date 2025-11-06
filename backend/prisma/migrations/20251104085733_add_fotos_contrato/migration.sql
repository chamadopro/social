-- AlterTable: Adicionar campos de fotos ao Contrato
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "fotos_antes" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "contratos" ADD COLUMN IF NOT EXISTS "fotos_depois" TEXT[] DEFAULT ARRAY[]::TEXT[];

