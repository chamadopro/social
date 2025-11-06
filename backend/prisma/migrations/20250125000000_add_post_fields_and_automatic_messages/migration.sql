-- Add new fields to posts table
ALTER TABLE "posts" 
ADD COLUMN "prestador_escolhido_id" TEXT,
ADD COLUMN "manter_visivel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "excluido" BOOLEAN NOT NULL DEFAULT false;

-- Update StatusPost enum to include new statuses
ALTER TYPE "StatusPost" ADD VALUE IF NOT EXISTS 'ORCAMENTO_ACEITO';
ALTER TYPE "StatusPost" ADD VALUE IF NOT EXISTS 'TRABALHO_CONCLUIDO';

-- Create mensagens_automaticas table
CREATE TABLE IF NOT EXISTS "mensagens_automaticas" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_update" TIMESTAMP(3) NOT NULL,
    "criado_por" TEXT,
    "atualizado_por" TEXT,

    CONSTRAINT "mensagens_automaticas_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mensagens_automaticas_tipo_key" UNIQUE ("tipo")
);

-- Insert default automatic messages
INSERT INTO "mensagens_automaticas" ("id", "tipo", "titulo", "conteudo", "ativo", "data_criacao", "data_update")
VALUES 
    (gen_random_uuid()::text, 
     'ORIENTACAO_CLIENTE_ORCAMENTO',
     'Recebimento de Orçamento',
     'Você recebeu um novo orçamento. Negocie diretamente pela plataforma ChamadoPro para ter segurança e benefícios no recebimento do seu serviço. Todas as negociações devem ser feitas aqui para garantir proteção aos usuários.',
     true, 
     CURRENT_TIMESTAMP, 
     CURRENT_TIMESTAMP),
    
    (gen_random_uuid()::text,
     'ORIENTACAO_PRESTADOR_NEGOCIAR',
     'Início de Negociação',
     'Você enviou um orçamento. Mantenha toda a negociação pela plataforma ChamadoPro para garantir segurança e facilitar o processo de pagamento. Não compartilhe contatos externos.',
     true,
     CURRENT_TIMESTAMP,
     CURRENT_TIMESTAMP)
ON CONFLICT ("tipo") DO NOTHING;
