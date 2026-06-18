-- Adicionar coluna `grupo` à tabela de votos
-- Aplicar na base de dados PostgreSQL usada pelo projeto

ALTER TABLE "projeto-produtividade-topten".votos
ADD COLUMN IF NOT EXISTS grupo TEXT;

-- Nota: votos existentes ficam com grupo = NULL (acesso genérico)
