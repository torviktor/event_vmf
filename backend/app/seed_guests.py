"""
Заполнение базы актуальным списком из 18 участников встречи 2026.
Идемпотентен: добавляет только тех, кого ещё нет (сравнение по началу строки name).

Запуск:
  docker exec reunion-backend python /app/app/seed_guests.py

Для актуализации уже существующей прод-БД использовать
migrations/2026_06_update_guests.sql, а не этот скрипт.
"""
import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal, engine, Base
from app.models.models import Guest
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Актуальный список 18 мужчин-выпускников + участников встречи.
# Жёны и дети живут как поля (adults_count, spouse_name, children) уже зарегистрировавшихся
# записей — отдельные строки на них здесь не заводим.
PARTICIPANTS = [
    "Агапов Эдуард",
    "Аксёнов Дмитрий",
    "Бабич Артём",
    "Бессмертный Дмитрий",
    "Божко Давид",
    "Борисенко Никита",
    "Бучковский Евгений",
    "Веревкин Виктор",
    "Виноградов Алексей",
    "Джабраилов Малик",
    "Дук Денис",
    "Жабин Сергей",
    "Науменко Андрей",
    "Попов Александр",
    "Рябуха Степан",
    "Саморезов Виталий",
    "Саморуков Александр",
    "Санжаров Сергей",
]

# Кто уже оплатил основной взнос (paid_restaurant=True). Конкретные суммы
# проставляет организатор в админке.
PAID = {
    "Попов Александр",
    "Веревкин Виктор",
    "Рябуха Степан",
    "Бессмертный Дмитрий",
    "Бабич Артём",
    "Бучковский Евгений",
    "Санжаров Сергей",
    "Саморуков Александр",
    "Виноградов Алексей",
}

added = 0
for surname_first in PARTICIPANTS:
    exists = db.query(Guest).filter(Guest.name.like(f"{surname_first}%")).first()
    if exists:
        continue
    db.add(Guest(
        name=surname_first,
        phone="",
        graduation_year=2011,
        specialty="",
        adults_count=1,
        children=[],
        will_attend_institute=True,
        will_attend_restaurant=True,
        is_confirmed=True,
        paid_restaurant=(surname_first in PAID),
        paid_amount=0,
        created_at=datetime.utcnow(),
    ))
    added += 1

db.commit()

total = db.query(Guest).filter(Guest.is_confirmed == True).count()
paid_total = db.query(Guest).filter(Guest.is_confirmed == True, Guest.paid_restaurant == True).count()
print(f"Добавлено новых записей: {added}")
print(f"Итого подтверждённых: {total} | с paid_restaurant=true: {paid_total}")
db.close()
