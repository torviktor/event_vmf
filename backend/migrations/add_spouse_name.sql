-- Добавление поля spouse_name для guest-записей с adults_count>=2.
-- Идемпотентно: повторный запуск безопасен.
--
-- Применить на сервере:
--   docker compose cp backend/migrations/add_spouse_name.sql reunion-db:/tmp/
--   docker compose exec reunion-db psql -U reunion -d reunion -f /tmp/add_spouse_name.sql

ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(200);
