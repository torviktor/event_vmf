import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal, ADMIN_PASSWORD
from app.models.models import EventInfo
from app.routes.guests import router as guests_router
from app.routes.other import auth_router, vote_router, info_router
from app.routes.export import router as export_router
from app.routes.payment import public_router as payment_public_router, admin_router as payment_admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Встреча выпускников", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(guests_router)
app.include_router(auth_router)
app.include_router(vote_router)
app.include_router(info_router)
app.include_router(export_router)
app.include_router(payment_public_router)
app.include_router(payment_admin_router)


@app.on_event("startup")
def seed_default_info():
    db = SessionLocal()
    defaults = {
        "event_date": "27 июня 2026 года",
        "institute_time": "10:00 — 13:00",
        "restaurant_time": "18:00 — 22:00",
        "restaurant_name": "Уточняется",
        "city": "Санкт-Петербург",
        "budget_per_person": "10 000 — 15 000 ₽",
        "organizer_phone": "",
        "organizer_name": "Веревкин Виктор",
        "welcome_text": "Уважаемые выпускники, сослуживцы! Приглашаем вас на встречу выпускников ВМИРЭ им. А.С. Попова 2011 года.",
        # Оплаты:
        "photographer_total":     "24000",   # фикс: общая сумма за фотографа (per_person вычисляется в /payments-summary)
        "restaurant_deposit":     "",        # заполняет админ
        "restaurant_kids_rule":   "free",    # free | half | full
        # Реквизиты для перевода:
        "payment_recipient_name":  "Виктор В.",
        "payment_recipient_phone": "+7 925 365-35-97",
        "payment_recipient_bank":  "Сбер",
        "payment_qr_filename":     "",
        "payment_amount_label":    "1 500 ₽ с человека",
        "payment_comment":         "Фотограф ВМИРЭ",
    }
    for key, value in defaults.items():
        exists = db.query(EventInfo).filter(EventInfo.key == key).first()
        if not exists:
            db.add(EventInfo(key=key, value=value))
    db.commit()
    db.close()

    # Директория для QR-картинок.
    os.makedirs("/app/uploads/payment_qr", exist_ok=True)


@app.get("/api/health")
def health():
    return {"status": "ok"}
