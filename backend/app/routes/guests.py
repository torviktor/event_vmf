from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db, ADMIN_PASSWORD
from app.core.security import verify_password, create_token, decode_token
from app.models.models import Guest, EventInfo

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
    paid_photographer: bool = False
    paid_restaurant: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    category: str   # "photographer" | "restaurant"
    paid: bool


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
        "total_guests": total_adults + total_children,
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


@router.get("/public", summary="Публичный список подтверждённых участников с признаками оплаты")
def public_guest_list(db: Session = Depends(get_db)):
    guests = db.query(Guest).filter(Guest.is_confirmed == True).order_by(Guest.name).all()
    rows = []
    for g in guests:
        # Взрослый-регистрант (одной строкой; если adults_count>1 — флаг общий на запись).
        rows.append({
            "name": g.name,
            "paid_photographer": bool(g.paid_photographer),
            "paid_restaurant": bool(g.paid_restaurant),
            "is_child": False,
        })
        # Дети — отдельными строками. У детей нет своих флагов оплаты.
        for idx, child in enumerate(g.children or [], start=1):
            child_name = (child.get("name") or "").strip() if isinstance(child, dict) else ""
            if not child_name:
                child_name = f"Ребёнок ({g.name})"
            rows.append({
                "name": child_name,
                "paid_photographer": False,
                "paid_restaurant": False,
                "is_child": True,
            })
    return rows


@router.patch("/{guest_id}/payment", summary="Отметить оплату (admin)")
def set_payment(guest_id: int, data: PaymentUpdate, db: Session = Depends(get_db), _=Depends(check_admin)):
    if data.category not in ("photographer", "restaurant"):
        raise HTTPException(status_code=400, detail="Неизвестная категория")
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Не найден")
    if data.category == "photographer":
        guest.paid_photographer = bool(data.paid)
    else:
        guest.paid_restaurant = bool(data.paid)
    db.commit()
    return {
        "ok": True,
        "id": guest.id,
        "paid_photographer": guest.paid_photographer,
        "paid_restaurant": guest.paid_restaurant,
    }


@router.get("/payments-summary", summary="Сводка по оплатам (публичная)")
def payments_summary(db: Session = Depends(get_db)):
    # Берём всех подтверждённых: для фотографа — все, для ресторана — только тех, кто идёт в ресторан.
    confirmed = db.query(Guest).filter(Guest.is_confirmed == True).all()

    info_items = {i.key: i.value for i in db.query(EventInfo).all()}

    def _to_int(val, default=0):
        try:
            return int(str(val).strip())
        except (TypeError, ValueError):
            return default

    photo_per_person = _to_int(info_items.get("photographer_per_adult"), 1500)
    photo_total_fixed = _to_int(info_items.get("photographer_total"), 24000)
    restaurant_deposit_raw = (info_items.get("restaurant_deposit") or "").strip()
    restaurant_deposit = _to_int(restaurant_deposit_raw, 0) if restaurant_deposit_raw else None
    kids_rule = (info_items.get("restaurant_kids_rule") or "free").strip() or "free"

    # Photographer: всё подтверждённые взрослые.
    photo_total_adults = sum(g.adults_count or 0 for g in confirmed)
    photo_paid_adults = sum((g.adults_count or 0) for g in confirmed if g.paid_photographer)
    photo_paid_count = sum(1 for g in confirmed if g.paid_photographer)
    photo_unpaid_count = sum(1 for g in confirmed if not g.paid_photographer)

    # Restaurant: только идущие в ресторан.
    rest_guests = [g for g in confirmed if g.will_attend_restaurant]
    rest_total_adults = sum(g.adults_count or 0 for g in rest_guests)
    rest_paid_adults = sum((g.adults_count or 0) for g in rest_guests if g.paid_restaurant)
    rest_paid_count = sum(1 for g in rest_guests if g.paid_restaurant)
    rest_unpaid_count = sum(1 for g in rest_guests if not g.paid_restaurant)

    if restaurant_deposit and rest_total_adults > 0:
        rest_per_person = round(restaurant_deposit / rest_total_adults)
    else:
        rest_per_person = None

    return {
        "photographer": {
            "per_person": photo_per_person,
            "total_fixed": photo_total_fixed,
            "total_expected": photo_total_adults * photo_per_person,
            "total_collected": photo_paid_adults * photo_per_person,
            "paid_count": photo_paid_count,
            "unpaid_count": photo_unpaid_count,
            "total_adults": photo_total_adults,
        },
        "restaurant": {
            "deposit": restaurant_deposit,                    # None если админ ещё не задал
            "per_person": rest_per_person,                    # None если депозит не задан
            "kids_rule": kids_rule,                           # free | half | full
            "total_expected": (restaurant_deposit if restaurant_deposit else None),
            "total_collected": (rest_paid_adults * rest_per_person) if rest_per_person else 0,
            "paid_count": rest_paid_count,
            "unpaid_count": rest_unpaid_count,
            "total_adults": rest_total_adults,
        },
    }
