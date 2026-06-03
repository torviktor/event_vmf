-- Миграция 2026-06: актуализация состава участников и переход на единое поле суммы оплаты.
-- Применять на проде вручную после деплоя:
--   docker exec -i reunion-db psql -U reunion -d reunion < /opt/event_vmf/backend/migrations/2026_06_update_guests.sql
-- Скрипт идемпотентный — можно прогонять повторно.

BEGIN;

-- 1. Новое поле для суммы оплаты основного взноса (за встречу).
--    Сам факт оплаты по-прежнему в paid_restaurant. paid_amount — сколько именно человек внёс.
ALTER TABLE guests
    ADD COLUMN IF NOT EXISTS paid_amount INTEGER NOT NULL DEFAULT 0;

-- 2. Опечатка в отчестве Рябухи.
UPDATE guests
SET name = 'Рябуха Степан Викторович'
WHERE name = 'Рябуха Степан Викторрвич';

-- 3. Удаляем Тура Сергея — его в актуальном списке нет.
DELETE FROM guests
WHERE name = 'Тур Сергей Сергеевич';

-- 4. Добавляем недостающих троих. Идемпотентно: INSERT только если такой фамилии ещё нет.
--    Сравнение по началу строки "Фамилия Имя", чтобы не задвоить при будущих правках отчества.
INSERT INTO guests (name, phone, graduation_year, specialty, adults_count, children,
                    will_attend_institute, will_attend_restaurant, is_confirmed,
                    paid_photographer, paid_restaurant, paid_amount, created_at)
SELECT 'Агапов Эдуард', '', 2011, '', 1, '[]'::json, TRUE, TRUE, TRUE, FALSE, FALSE, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE name LIKE 'Агапов Эдуард%');

INSERT INTO guests (name, phone, graduation_year, specialty, adults_count, children,
                    will_attend_institute, will_attend_restaurant, is_confirmed,
                    paid_photographer, paid_restaurant, paid_amount, created_at)
SELECT 'Бучковский Евгений', '', 2011, '', 1, '[]'::json, TRUE, TRUE, TRUE, FALSE, TRUE, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE name LIKE 'Бучковский Евгений%');

INSERT INTO guests (name, phone, graduation_year, specialty, adults_count, children,
                    will_attend_institute, will_attend_restaurant, is_confirmed,
                    paid_photographer, paid_restaurant, paid_amount, created_at)
SELECT 'Науменко Андрей', '', 2011, '', 1, '[]'::json, TRUE, TRUE, TRUE, FALSE, FALSE, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM guests WHERE name LIKE 'Науменко Андрей%');

-- 5. Отмечаем как оплативших основной взнос 9 человек.
--    paid_amount остаётся 0 — конкретные суммы Денис проставит в админке (еда 4500 + подарок 2500 + опц. алкоголь).
--    Используем LIKE, чтобы охватить и текущие записи с отчествами, и новые без.
UPDATE guests
SET paid_restaurant = TRUE
WHERE name LIKE 'Попов Александр%'
   OR name LIKE 'Веревкин Виктор%'
   OR name LIKE 'Рябуха Степан%'
   OR name LIKE 'Бессмертный Дмитрий%'
   OR name LIKE 'Бабич Артём%'
   OR name LIKE 'Бучковский Евгений%'
   OR name LIKE 'Санжаров Сергей%'
   OR name LIKE 'Саморуков Александр%'
   OR name LIKE 'Виноградов Алексей%';

-- 6. Контроль: ожидаем ровно 18 confirmed-записей и 9 с paid_restaurant.
DO $$
DECLARE
    n_total INTEGER;
    n_paid  INTEGER;
BEGIN
    SELECT COUNT(*) INTO n_total FROM guests WHERE is_confirmed = TRUE;
    SELECT COUNT(*) INTO n_paid  FROM guests WHERE is_confirmed = TRUE AND paid_restaurant = TRUE;
    RAISE NOTICE 'После миграции: confirmed=%, paid_restaurant=%', n_total, n_paid;
    IF n_total <> 18 THEN
        RAISE WARNING 'Ожидалось 18 confirmed-записей, фактически %.', n_total;
    END IF;
    IF n_paid <> 9 THEN
        RAISE WARNING 'Ожидалось 9 оплативших, фактически %.', n_paid;
    END IF;
END $$;

COMMIT;
