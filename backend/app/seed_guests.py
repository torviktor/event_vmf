"""
Запускать на сервере ТОЛЬКО если база пустая:
  docker compose exec reunion-backend python /app/app/seed_guests.py
"""
import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal, engine, Base
from app.models.models import Guest
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()

existing = db.query(Guest).count()
if existing > 0:
    print(f"В базе уже {existing} записей. Удалите их вручную если хотите перезалить.")
    db.close()
    sys.exit(0)

# Логика:
# - Каждый выпускник — отдельная запись, adults_count=1
# - Супруга — отдельная запись, adults_count=1
# - Дети — в поле children у выпускника (не отдельные записи)

guests_data = [
    dict(
        name="Дук Денис Игоревич",
        adults_count=1,
        children=[],
    ),
    dict(
        name="Веревкин Виктор Александрович",
        adults_count=1,
        children=[
            {"name": "Демид", "age": None},
            {"name": "Артём", "age": None},
        ],
    ),
    dict(
        name="Веревкина Анна Валерьевна (супруга)",
        adults_count=1,
        children=[],
    ),
    dict(
        name="Аксенов Дмитрий Александрович",
        adults_count=1,
        children=[
            {"name": "Глеб", "age": None},
            {"name": "Артемий", "age": None},
        ],
    ),
    dict(
        name="Аксенова Галина Борисовна (супруга)",
        adults_count=1,
        children=[],
    ),
    dict(
        name="Тур Сергей Сергеевич",
        adults_count=1,
        children=[],
    ),
]

for g in guests_data:
    guest = Guest(
        name=g['name'],
        phone="",
        graduation_year=2011,
        specialty="",
        adults_count=g['adults_count'],
        children=g['children'],
        will_attend_institute=True,
        will_attend_restaurant=True,
        is_confirmed=True,
        created_at=datetime.utcnow(),
    )
    db.add(guest)

db.commit()

total    = db.query(Guest).count()
adults   = sum(g.adults_count for g in db.query(Guest).all())
children = sum(len(g.children) for g in db.query(Guest).all())
print(f"Добавлено {len(guests_data)} записей.")
print(f"Итого: {total} записей | {adults} взрослых | {children} детей")
db.close()
