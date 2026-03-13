import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://reunion:reunion_secret_2025@localhost:5432/reunion")
SECRET_KEY = os.getenv("SECRET_KEY", "change_me_in_production")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
