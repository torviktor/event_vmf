from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from app.core.database import Base


class Guest(Base):
    """Участник встречи — регистрация на мероприятие."""
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)           # ФИО
    phone = Column(String(20), nullable=False)            # Телефон
    graduation_year = Column(Integer, nullable=True)      # Год выпуска
    specialty = Column(String(200), nullable=True)        # Специальность / факультет
    adults_count = Column(Integer, default=1)             # Кол-во взрослых (с собой)
    spouse_name = Column(String(200), nullable=True)      # Имя супруга/супруги (если adults_count>=2)
    children = Column(JSON, default=list)                 # [{age: 5, name: "Петя"}, ...]
    will_attend_institute = Column(Boolean, default=True) # Пойдёт на экскурсию
    will_attend_restaurant = Column(Boolean, default=True)# Пойдёт в ресторан
    dietary_notes = Column(Text, nullable=True)           # Пищевые ограничения
    message = Column(Text, nullable=True)                 # Пожелания / вопросы
    is_confirmed = Column(Boolean, default=False)         # Подтверждён оргкомитетом
    paid_photographer = Column(Boolean, default=False, nullable=False)   # Оплатил фотографа
    paid_restaurant = Column(Boolean, default=False, nullable=False)     # Оплатил ресторан
    created_at = Column(DateTime, default=datetime.utcnow)


class VotePoll(Base):
    """Голосование по дате."""
    __tablename__ = "vote_polls"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class VoteOption(Base):
    """Вариант даты для голосования."""
    __tablename__ = "vote_options"

    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, nullable=False)
    label = Column(String(200), nullable=False)  # напр. "14 июня (суббота)"
    votes = Column(Integer, default=0)


class Photo(Base):
    """Архивные фото для галереи."""
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    caption = Column(String(300), nullable=True)
    url = Column(String(500), nullable=False)      # URL или base64
    year = Column(Integer, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class EventInfo(Base):
    """Информация о программе (редактируется через панель)."""
    __tablename__ = "event_info"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)  # напр. "date", "restaurant", "schedule"
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
