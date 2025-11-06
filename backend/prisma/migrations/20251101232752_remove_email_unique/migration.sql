-- Remove unique constraint from email to allow multiple profiles
DROP INDEX IF EXISTS "usuarios_email_key";
