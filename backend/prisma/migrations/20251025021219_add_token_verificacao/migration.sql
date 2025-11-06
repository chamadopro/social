-- CreateEnum
CREATE TYPE "TipoToken" AS ENUM ('VERIFICACAO_EMAIL', 'RECUPERACAO_SENHA');

-- CreateTable
CREATE TABLE "tokens_verificacao" (
    "id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "tipo" "TipoToken" NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_verificacao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokens_verificacao_token_key" ON "tokens_verificacao"("token");

-- AddForeignKey
ALTER TABLE "tokens_verificacao" ADD CONSTRAINT "tokens_verificacao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
