-- AlterEnum: Adicionar LEAD_QUENTE ao enum TipoNotificacao
ALTER TYPE "TipoNotificacao" ADD VALUE IF NOT EXISTS 'LEAD_QUENTE';

