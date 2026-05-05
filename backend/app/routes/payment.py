"""
Реквизиты для оплаты + QR-код.
QR — файл на диске под /app/uploads/payment_qr/<filename>.
Метаданные (имя файла, реквизиты) — в таблице info.
"""
import os
import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.models.models import EventInfo
from app.routes.guests import check_admin


UPLOADS_DIR = "/app/uploads/payment_qr"
ALLOWED_MIME = {
    b"\x89PNG\r\n\x1a\n": ("png", "image/png"),
    b"\xff\xd8\xff":      ("jpg", "image/jpeg"),
}
MAX_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB


# Ключи реквизитов в info, и как они называются в JSON-ответе.
INFO_FIELDS = [
    ("payment_recipient_name",  "recipient_name"),
    ("payment_recipient_phone", "recipient_phone"),
    ("payment_recipient_bank",  "recipient_bank"),
    ("payment_amount_label",    "amount_label"),
    ("payment_comment",         "comment"),
]


public_router = APIRouter(prefix="/api/payment", tags=["payment"])
admin_router  = APIRouter(prefix="/api/admin/payment", tags=["payment-admin"])


def _info_value(db: Session, key: str) -> str:
    item = db.query(EventInfo).filter(EventInfo.key == key).first()
    return (item.value if item else "") or ""


def _set_info(db: Session, key: str, value: str) -> None:
    item = db.query(EventInfo).filter(EventInfo.key == key).first()
    if item:
        item.value = value
    else:
        item = EventInfo(key=key, value=value)
        db.add(item)


def _detect_image(buf: bytes) -> Optional[tuple]:
    """Возвращает (ext, content_type) по magic bytes или None."""
    for sig, info in ALLOWED_MIME.items():
        if buf.startswith(sig):
            return info
    return None


@public_router.get("/info", summary="Реквизиты для перевода (публично)")
def get_payment_info(db: Session = Depends(get_db)):
    payload = {json_key: _info_value(db, info_key) for info_key, json_key in INFO_FIELDS}
    qr_filename = _info_value(db, "payment_qr_filename").strip()
    qr_path = os.path.join(UPLOADS_DIR, qr_filename) if qr_filename else None
    payload["qr_url"] = "/api/payment/qr" if qr_filename and qr_path and os.path.isfile(qr_path) else None
    return payload


@public_router.get("/qr", summary="Картинка QR-кода (публично)")
def get_payment_qr(db: Session = Depends(get_db)):
    qr_filename = _info_value(db, "payment_qr_filename").strip()
    if not qr_filename:
        raise HTTPException(status_code=404, detail="QR не загружен")
    path = os.path.join(UPLOADS_DIR, qr_filename)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Файл QR не найден")
    ext = qr_filename.rsplit(".", 1)[-1].lower()
    media_type = "image/png" if ext == "png" else "image/jpeg"
    return FileResponse(path, media_type=media_type)


class PaymentInfoUpdate(BaseModel):
    recipient_name: Optional[str] = None
    recipient_phone: Optional[str] = None
    recipient_bank: Optional[str] = None
    amount_label: Optional[str] = None
    comment: Optional[str] = None


@admin_router.patch("/info", summary="Обновить реквизиты (admin)")
def update_payment_info(data: PaymentInfoUpdate, db: Session = Depends(get_db), _=Depends(check_admin)):
    payload = data.model_dump(exclude_unset=True)
    json_to_info = {json_key: info_key for info_key, json_key in INFO_FIELDS}
    for json_key, value in payload.items():
        info_key = json_to_info.get(json_key)
        if info_key is None:
            continue
        _set_info(db, info_key, (value or "").strip())
    db.commit()
    return {"ok": True}


@admin_router.post("/qr", summary="Загрузить QR (admin)")
async def upload_payment_qr(file: UploadFile = File(...), db: Session = Depends(get_db), _=Depends(check_admin)):
    # Читаем сразу всё, ограничивая объём.
    head = await file.read(MAX_SIZE_BYTES + 1)
    if len(head) > MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Файл больше 2 МБ")

    detected = _detect_image(head)
    if not detected:
        raise HTTPException(status_code=400, detail="Поддерживаются только PNG и JPEG")
    ext, _media = detected

    os.makedirs(UPLOADS_DIR, exist_ok=True)

    # Удалить старый файл, если был.
    old_filename = _info_value(db, "payment_qr_filename").strip()
    if old_filename:
        old_path = os.path.join(UPLOADS_DIR, old_filename)
        if os.path.isfile(old_path):
            try:
                os.remove(old_path)
            except OSError:
                pass

    new_filename = f"qr_{int(time.time())}.{ext}"
    new_path = os.path.join(UPLOADS_DIR, new_filename)
    with open(new_path, "wb") as f:
        f.write(head)

    _set_info(db, "payment_qr_filename", new_filename)
    db.commit()

    return {"filename": new_filename, "url": "/api/payment/qr"}
