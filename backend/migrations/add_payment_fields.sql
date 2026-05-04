-- Добавление полей для учёта оплат по фотографу и ресторану.
-- Идемпотентно: повторный запуск безопасен.
--
-- Применить на сервере:
--   docker compose exec db psql -U reunion -d reunion -f /tmp/add_payment_fields.sql
-- (или скопировать SQL целиком в psql).

ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS paid_photographer BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS paid_restaurant   BOOLEAN NOT NULL DEFAULT FALSE;

-- Дефолты для info (фиксированные суммы фотографа и правило по детям).
-- Депозит ресторана админ заполнит сам через панель.
INSERT INTO event_info (key, value, updated_at) VALUES
    ('photographer_total',     '24000', NOW()),
    ('photographer_per_adult', '1500',  NOW()),
    ('restaurant_deposit',     '',      NOW()),
    ('restaurant_kids_rule',   'free',  NOW())
ON CONFLICT (key) DO NOTHING;
