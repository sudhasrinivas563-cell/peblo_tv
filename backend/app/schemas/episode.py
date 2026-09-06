from pydantic import BaseModel
from typing import Optional


class EpisodeCreate(BaseModel):
    season_id: int
    episode_number: int
    title: str
    description: Optional[str] = None
    duration_seconds: Optional[int] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None


class EpisodeResponse(BaseModel):
    id: int
    season_id: int
    episode_number: int
    title: str
    description: Optional[str] = None
    duration_seconds: Optional[int] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None

    class Config:
        from_attributes = True