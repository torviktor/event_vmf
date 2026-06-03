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
    paid_restaurant: bool = False     # факт оплаты основного взноса (категория фотографа из API убрана)
    paid_amount: int = 0              # сумма основного взноса, ₽
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentUpdate(BaseModel):
    """Обновление оплаты основного взноса. Можно передать только paid, только amount, или оба."""
    paid: Optional[bool] = None
    amount: Optional[int] = None


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


@router.get("/public", summary="Публичный список подтверждённых участников с признаком оплаты")
def public_guest_list(db: Session = Depends(get_db)):
    guests = db.query(Guest).filter(Guest.is_confirmed == True).order_by(Guest.name).all()
    rows = []
    for g in guests:
        paid = bool(g.paid_restaurant)

        rows.append({
            "name": g.name,
            "is_spouse": False,
            "is_child": False,
            "parent_id": None,
            "guest_id": g.id,
            "paid": paid,
        })

        if (g.adults_count or 0) >= 2:
            spouse_label = (g.spouse_name or "").strip() or "Супруга"
            rows.append({
                "name": spouse_label,
                "is_spouse": True,
                "is_child": False,
                "parent_id": g.id,
                "guest_id": g.id,
                "paid": paid,
            })

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
                "paid": False,
            })
    return rows


@router.patch("/{guest_id}/payment", summary="Обновить оплату основного взноса (admin)")
def set_payment(guest_id: int, data: PaymentUpdate, db: Session = Depends(get_db), _=Depends(check_admin)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Не найден")
    if data.paid is not None:
        guest.paid_restaurant = bool(data.paid)
    if data.amount is not None:
        if data.amount < 0:
            raise HTTPException(status_code=400, detail="Сумма не может быть отрицательной")
        guest.paid_amount = int(data.amount)
    db.commit()
    return {
        "ok": True,
        "id": guest.id,
        "paid_restaurant": guest.paid_restaurant,
        "paid_amount": guest.paid_amount,
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


@router.get("/payments-summary", summary="Сводка по оплатам основного взноса (публичная)")
def payments_summary(db: Session = Depends(get_db)):
    """Сводка по основному взносу за встречу.
    Категория фотографа удалена из API; в БД поле paid_photographer оставлено для совместимости."""
    confirmed = db.query(Guest).filter(Guest.is_confirmed == True).all()
    payers_count = len(confirmed)
    paid_count = sum(1 for g in confirmed if g.paid_restaurant)
    unpaid_count = payers_count - paid_count
    total_collected = sum(int(g.paid_amount or 0) for g in confirmed if g.paid_restaurant)

    return {
        "paid_count": paid_count,
        "unpaid_count": unpaid_count,
        "payers_count": payers_count,
        "total_collected": total_collected,
    }
