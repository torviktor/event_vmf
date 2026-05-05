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

-- Дефолты для info (фиксированная общая сумма фотографа и правило по детям).
-- per_person теперь вычисляется = photographer_total / payers_count, ключ photographer_per_adult больше не используется.
-- Депозит ресторана админ заполнит сам через панель.
-- Реквизиты для перевода также сидируются — админ потом обновит через панель.
INSERT INTO event_info (key, value, updated_at) VALUES
    ('photographer_total',       '24000',                 NOW()),
    ('restaurant_deposit',       '',                      NOW()),
    ('restaurant_kids_rule',     'free',                  NOW()),
    ('payment_recipient_name',   'Виктор В.',             NOW()),
    ('payment_recipient_phone',  '+7 925 365-35-97',      NOW()),
    ('payment_recipient_bank',   'Сбер',                  NOW()),
    ('payment_qr_filename',      '',                      NOW()),
    ('payment_amount_label',     '1 500 ₽ с человека',    NOW()),
    ('payment_comment',          'Фотограф ВМИРЭ',        NOW())
ON CONFLICT (key) DO NOTHING;
