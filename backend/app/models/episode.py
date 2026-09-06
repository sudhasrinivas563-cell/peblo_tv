from sqlalchemy import Column, Integer, String, Text, ForeignKey

from app.db.database import Base


class Episode(Base):
    __tablename__ = "episodes"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("seasons.id"), nullable=False)
    episode_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    duration_seconds = Column(Integer)
    video_url = Column(Text)
    thumbnail_url = Column(Text)