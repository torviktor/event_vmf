import io
import csv
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routes.guests import check_admin
from app.models.models import Guest

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/guests.csv", summary="Выгрузка участников в CSV (admin)")
def export_guests_csv(db: Session = Depends(get_db), _=Depends(check_admin)):
    guests = db.query(Guest).order_by(Guest.created_at).all()

    output = io.StringIO()
    writer = csv.writer(output, dialect='excel')

    writer.writerow([
        "№", "ФИО", "Телефон", "Кафедра",
        "Взрослых", "Детей", "Имена детей",
        "Институт", "Ресторан",
        "Подтверждён", "Пожелания", "Дата заявки"
    ])

    for i, g in enumerate(guests, 1):
        children_names = "; ".join(
            f"{c.get('name','?')} ({c.get('age','?')} л.)" for c in (g.children or [])
        )
        writer.writerow([
            i,
            g.name,
            g.phone,
            g.specialty or "",
            g.adults_count,
            len(g.children or []),
            children_names,
            "Да" if g.will_attend_institute else "Нет",
            "Да" if g.will_attend_restaurant else "Нет",
            "Да" if g.is_confirmed else "Нет",
            g.message or "",
            g.created_at.strftime("%d.%m.%Y %H:%M") if g.created_at else "",
        ])

    output.seek(0)
    # BOM для корректного открытия в Excel
    content = "\ufeff" + output.getvalue()

    return StreamingResponse(
        iter([content.encode("utf-8")]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=uchastniki.csv"}
    )
