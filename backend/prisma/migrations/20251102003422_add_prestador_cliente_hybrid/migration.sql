-- Adicionar campos para perfil híbrido (PRESTADOR + CLIENTE associado)
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "prestador_associado_id" TEXT;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "preferencia_modo_feed" TEXT;

-- Adicionar foreign key constraint
ALTER TABLE "usuarios" ADD CONSTRAINT IF NOT EXISTS "usuarios_prestador_associado_id_fkey" FOREIGN KEY ("prestador_associado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
