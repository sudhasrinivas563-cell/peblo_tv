from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.db.database import Base


class Show(Base):
    __tablename__ = "shows"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(
        String(255),
        nullable=False
    )

    description = Column(Text)

    language = Column(
        String(100)
    )

    genre = Column(
        String(100)
    )

    artwork_url = Column(
        Text,
        nullable=True
    )

    status = Column(
        String(50),
        default="draft"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow
    )