from sqlalchemy import Column, Integer, String, ForeignKey

from app.db.database import Base


class Season(Base):
    __tablename__ = "seasons"

    id = Column(Integer, primary_key=True, index=True)
    show_id = Column(Integer, ForeignKey("shows.id"), nullable=False)
    season_number = Column(Integer, nullable=False)
    title = Column(String(255))