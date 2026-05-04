from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal, ADMIN_PASSWORD
from app.models.models import EventInfo
from app.routes.guests import router as guests_router
from app.routes.other import auth_router, vote_router, info_router
from app.routes.export import router as export_router

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
        "photographer_total":     "24000",   # фикс: общая сумма за фотографа
        "photographer_per_adult": "1500",    # фикс: 24000 / 16
        "restaurant_deposit":     "",        # заполняет админ
        "restaurant_kids_rule":   "free",    # free | half | full
    }
    for key, value in defaults.items():
        exists = db.query(EventInfo).filter(EventInfo.key == key).first()
        if not exists:
            db.add(EventInfo(key=key, value=value))
    db.commit()
    db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
