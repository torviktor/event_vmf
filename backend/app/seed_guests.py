"""
Запускать на сервере:
  cd /opt/event_vmf
  docker compose exec reunion-backend python /app/seed_guests.py
  
Или напрямую:
  docker run --rm --network event_vmf_reunion-net \
    -e DATABASE_URL=postgresql://reunion:ПАРОЛЬ@reunion-db:5432/reunion \
    event_vmf-reunion-backend python /app/seed_guests.py
"""

import sys
sys.path.insert(0, '/app')

from app.core.database import SessionLocal, engine, Base
from app.models.models import Guest
from datetime import datetime

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Проверяем что база пустая чтобы не задваивать
existing = db.query(Guest).count()
if existing > 0:
    print(f"В базе уже {existing} участников. Пропускаем.")
    db.close()
    sys.exit(0)

guests_data = [
    # Выпускники
    dict(name="Дук Денис Игоревич",          phone="",  specialty="",   adults_count=1, children=[], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
    dict(name="Веревкин Виктор Александрович", phone="", specialty="",  adults_count=3, children=[{"name":"Демид","age":None},{"name":"Артём","age":None}], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
    dict(name="Аксенов Дмитрий Александрович", phone="", specialty="",  adults_count=2, children=[{"name":"Глеб","age":None},{"name":"Артемий","age":None}], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
    dict(name="Тур Сергей Сергеевич",          phone="", specialty="",  adults_count=1, children=[], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
    # Члены семей (отдельно для учёта)
    dict(name="Веревкина Анна Валерьевна (супруга)", phone="", specialty="", adults_count=1, children=[], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
    dict(name="Аксенова Галина Борисовна (супруга)",  phone="", specialty="", adults_count=1, children=[], will_attend_institute=True, will_attend_restaurant=True, is_confirmed=True),
]

for g in guests_data:
    guest = Guest(
        name=g['name'],
        phone=g['phone'],
        graduation_year=2011,
        specialty=g['specialty'],
        adults_count=g['adults_count'],
        children=g['children'],
        will_attend_institute=g['will_attend_institute'],
        will_attend_restaurant=g['will_attend_restaurant'],
        is_confirmed=g['is_confirmed'],
        created_at=datetime.utcnow(),
    )
    db.add(guest)

db.commit()
print(f"Добавлено {len(guests_data)} записей.")

# Итог
total = db.query(Guest).count()
adults = sum(g.adults_count for g in db.query(Guest).all())
children = sum(len(g.children) for g in db.query(Guest).all())
print(f"Итого в базе: {total} записей, {adults} взрослых, {children} детей.")
db.close()
