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
    spouse_name: Optional[str] = None
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
    spouse_name: Optional[str] = None
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


class SpouseNameUpdate(BaseModel):
    spouse_name: Optional[str] = None


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
        spouse_name=(data.spouse_name or None),
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
        paid_photo = bool(g.paid_photographer)
        paid_rest = bool(g.paid_restaurant)

        # Регистрант
        rows.append({
            "name": g.name,
            "is_spouse": False,
            "is_child": False,
            "parent_id": None,
            "guest_id": g.id,
            "paid_photographer": paid_photo,
            "paid_restaurant": paid_rest,
        })

        # Супруг(а): если adults_count>=2 и регистрант не один — наследует оплаты.
        if (g.adults_count or 0) >= 2:
            spouse_label = (g.spouse_name or "").strip() or "Супруга"
            rows.append({
                "name": spouse_label,
                "is_spouse": True,
                "is_child": False,
                "parent_id": g.id,
                "guest_id": g.id,
                "paid_photographer": paid_photo,
                "paid_restaurant": paid_rest,
            })

        # Дети — без своих флагов оплаты.
        for child in (g.children or []):
            child_name = (child.get("name") or "").strip() if isinstance(child, dict) else ""
            if not child_name:
                child_name = f"Ребёнок ({g.name})"
            rows.append({
                "name": child_name,
                "is_spouse": False,
                "is_child": True,
                "parent_id": g.id,
                "guest_id": g.id,
                "paid_photographer": False,
                "paid_restaurant": False,
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


@router.patch("/{guest_id}/spouse-name", summary="Установить имя супруга/супруги (admin)")
def set_spouse_name(guest_id: int, data: SpouseNameUpdate, db: Session = Depends(get_db), _=Depends(check_admin)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Не найден")
    cleaned = (data.spouse_name or "").strip()
    guest.spouse_name = cleaned or None
    db.commit()
    return {"ok": True, "id": guest.id, "spouse_name": guest.spouse_name}


@router.get("/payments-summary", summary="Сводка по оплатам (публичная)")
def payments_summary(db: Session = Depends(get_db)):
    # Один guest-record = один плательщик (даже если он с супругой).
    confirmed = db.query(Guest).filter(Guest.is_confirmed == True).all()

    info_items = {i.key: i.value for i in db.query(EventInfo).all()}

    def _to_int(val, default=0):
        try:
            return int(str(val).strip())
        except (TypeError, ValueError):
            return default

    photo_total_fixed = _to_int(info_items.get("photographer_total"), 24000)
    restaurant_deposit_raw = (info_items.get("restaurant_deposit") or "").strip()
    restaurant_deposit = _to_int(restaurant_deposit_raw, 0) if restaurant_deposit_raw else None
    kids_rule = (info_items.get("restaurant_kids_rule") or "free").strip() or "free"

    # Photographer: все подтверждённые записи — плательщики.
    photo_payers = list(confirmed)
    photo_payers_count = len(photo_payers)
    photo_paid_count = sum(1 for g in photo_payers if g.paid_photographer)
    photo_unpaid_count = photo_payers_count - photo_paid_count
    photo_per_person = round(photo_total_fixed / photo_payers_count) if photo_payers_count > 0 else None

    # Restaurant: только идущие в ресторан.
    rest_payers = [g for g in confirmed if g.will_attend_restaurant]
    rest_payers_count = len(rest_payers)
    rest_paid_count = sum(1 for g in rest_payers if g.paid_restaurant)
    rest_unpaid_count = rest_payers_count - rest_paid_count
    rest_per_person = (
        round(restaurant_deposit / rest_payers_count)
        if (restaurant_deposit and rest_payers_count > 0)
        else None
    )

    return {
        "photographer": {
            "per_person": photo_per_person,                       # вычислено: total_fixed / payers; None если payers=0
            "total_fixed": photo_total_fixed,
            "total_expected": photo_total_fixed,                  # фикс из info
            "total_collected": (photo_paid_count * photo_per_person) if photo_per_person else 0,
            "paid_count": photo_paid_count,
            "unpaid_count": photo_unpaid_count,
            "payers_count": photo_payers_count,
        },
        "restaurant": {
            "deposit": restaurant_deposit,                        # None если админ ещё не задал
            "per_person": rest_per_person,                        # None если депозит не задан или payers=0
            "kids_rule": kids_rule,                               # free | half | full
            "total_expected": (restaurant_deposit if restaurant_deposit else None),
            "total_collected": (rest_paid_count * rest_per_person) if rest_per_person else 0,
            "paid_count": rest_paid_count,
            "unpaid_count": rest_unpaid_count,
            "payers_count": rest_payers_count,
        },
    }
