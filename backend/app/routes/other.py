from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db, ADMIN_PASSWORD
from app.core.security import create_token, decode_token
from app.models.models import VotePoll, VoteOption, EventInfo, Photo

# ---- Auth ----

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginData(BaseModel):
    password: str


@auth_router.post("/login")
def login(data: LoginData):
    if data.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Неверный пароль")
    token = create_token({"role": "admin"})
    return {"token": token}


# ---- Voting ----

vote_router = APIRouter(prefix="/api/vote", tags=["vote"])


def check_admin(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Нет доступа")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_token(token)
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Только для администратора")
    except Exception:
        raise HTTPException(status_code=401, detail="Неверный токен")


@vote_router.get("/", summary="Текущий опрос по дате")
def get_poll(db: Session = Depends(get_db)):
    poll = db.query(VotePoll).filter(VotePoll.is_active == True).first()
    if not poll:
        return None
    options = db.query(VoteOption).filter(VoteOption.poll_id == poll.id).all()
    return {
        "id": poll.id,
        "title": poll.title,
        "options": [{"id": o.id, "label": o.label, "votes": o.votes} for o in options],
    }


@vote_router.post("/{option_id}/vote", summary="Проголосовать")
def cast_vote(option_id: int, db: Session = Depends(get_db)):
    opt = db.query(VoteOption).filter(VoteOption.id == option_id).first()
    if not opt:
        raise HTTPException(status_code=404, detail="Вариант не найден")
    opt.votes += 1
    db.commit()
    return {"ok": True, "votes": opt.votes}


class PollCreate(BaseModel):
    title: str
    options: List[str]


@vote_router.post("/create", summary="Создать опрос (admin)")
def create_poll(data: PollCreate, db: Session = Depends(get_db), _=Depends(check_admin)):
    # Деактивировать старые
    db.query(VotePoll).update({"is_active": False})
    poll = VotePoll(title=data.title)
    db.add(poll)
    db.flush()
    for label in data.options:
        db.add(VoteOption(poll_id=poll.id, label=label))
    db.commit()
    return {"ok": True, "poll_id": poll.id}


# ---- Event Info ----

info_router = APIRouter(prefix="/api/info", tags=["info"])


@info_router.get("/", summary="Вся информация о мероприятии")
def get_all_info(db: Session = Depends(get_db)):
    items = db.query(EventInfo).all()
    return {i.key: i.value for i in items}


class InfoUpdate(BaseModel):
    key: str
    value: str


@info_router.post("/", summary="Обновить информацию (admin)")
def set_info(data: InfoUpdate, db: Session = Depends(get_db), _=Depends(check_admin)):
    item = db.query(EventInfo).filter(EventInfo.key == data.key).first()
    if item:
        item.value = data.value
    else:
        item = EventInfo(key=data.key, value=data.value)
        db.add(item)
    db.commit()
    return {"ok": True}
