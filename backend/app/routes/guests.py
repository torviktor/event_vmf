from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db, ADMIN_PASSWORD
from app.core.security import verify_password, create_token, decode_token
from app.models.models import Guest

router = APIRouter(prefix="/api/guests", tags=["guests"])


# --- Schemas ---

class ChildInfo(BaseModel):
    name: Optional[str] = None
    age: int


class GuestCreate(BaseModel):
    name: str
    phone: str
    graduation_year: Optional[int] = None
    specialty: Optional[str] = None
    adults_count: int = 1
    children: List[ChildInfo] = []
    will_attend_institute: bool = True
    will_attend_restaurant: bool = True
    dietary_notes: Optional[str] = None
    message: Optional[str] = None


class GuestOut(BaseModel):
    id: int
    name: str
    phone: str
    graduation_year: Optional[int]
    specialty: Optional[str]
    adults_count: int
    children: list
    will_attend_institute: bool
    will_attend_restaurant: bool
    dietary_notes: Optional[str]
    message: Optional[str]
    is_confirmed: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Auth helper ---

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


# --- Routes ---

@router.post("/register", response_model=GuestOut, summary="Регистрация участника")
def register_guest(data: GuestCreate, db: Session = Depends(get_db)):
    guest = Guest(
        name=data.name,
        phone=data.phone,
        graduation_year=data.graduation_year,
        specialty=data.specialty,
        adults_count=data.adults_count,
        children=[c.model_dump() for c in data.children],
        will_attend_institute=data.will_attend_institute,
        will_attend_restaurant=data.will_attend_restaurant,
        dietary_notes=data.dietary_notes,
        message=data.message,
    )
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest


@router.get("/", response_model=List[GuestOut], summary="Список всех участников (admin)")
def list_guests(db: Session = Depends(get_db), _=Depends(check_admin)):
    return db.query(Guest).order_by(Guest.created_at.desc()).all()


@router.get("/stats", summary="Статистика (публичная)")
def guest_stats(db: Session = Depends(get_db)):
    guests = db.query(Guest).all()
    total_adults = sum(g.adults_count for g in guests)
    total_children = sum(len(g.children) for g in guests)
    return {
        "total_guests": len(guests),
        "total_adults": total_adults,
        "total_children": total_children,
        "institute": sum(1 for g in guests if g.will_attend_institute),
        "restaurant": sum(1 for g in guests if g.will_attend_restaurant),
    }


@router.patch("/{guest_id}/confirm", summary="Подтвердить участника (admin)")
def confirm_guest(guest_id: int, db: Session = Depends(get_db), _=Depends(check_admin)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Не найден")
    guest.is_confirmed = not guest.is_confirmed
    db.commit()
    return {"ok": True, "is_confirmed": guest.is_confirmed}


@router.delete("/{guest_id}", summary="Удалить участника (admin)")
def delete_guest(guest_id: int, db: Session = Depends(get_db), _=Depends(check_admin)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Не найден")
    db.delete(guest)
    db.commit()
    return {"ok": True}
