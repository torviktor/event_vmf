from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, SessionLocal, ADMIN_PASSWORD
from app.models.models import EventInfo
from app.routes.guests import router as guests_router
from app.routes.other import auth_router, vote_router, info_router

# Create tables
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


@app.on_event("startup")
def seed_default_info():
    """Заполнить начальные данные если база пустая."""
    db = SessionLocal()
    defaults = {
        "event_date": "ТБД — голосуем!",
        "institute_time": "10:00 — 13:00",
        "restaurant_time": "18:00 — 22:00",
        "restaurant_name": "Уточняется",
        "city": "Ваш город",
        "budget_per_person": "10 000 — 15 000 ₽",
        "organizer_phone": "",
        "organizer_name": "Оргкомитет",
        "welcome_text": "Дорогие выпускники! Приглашаем вас на встречу выпускников. Будем рады видеть вас и ваши семьи.",
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
