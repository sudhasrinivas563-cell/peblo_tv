from sqlalchemy import Column, Integer, DateTime, ForeignKey
from datetime import datetime

from app.db.database import Base


class Catalogue(Base):
    __tablename__ = "catalogues"

    id = Column(Integer, primary_key=True, index=True)
    version = Column(Integer, unique=True, nullable=False)
    published_at = Column(DateTime, default=datetime.utcnow)


class CatalogueItem(Base):
    __tablename__ = "catalogue_items"

    id = Column(Integer, primary_key=True, index=True)
    catalogue_id = Column(
        Integer,
        ForeignKey("catalogues.id"),
        nullable=False
    )
    show_id = Column(
        Integer,
        ForeignKey("shows.id"),
        nullable=False
    )