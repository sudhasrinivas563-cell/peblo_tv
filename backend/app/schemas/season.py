from pydantic import BaseModel
from typing import Optional


class SeasonCreate(BaseModel):
    show_id: int
    season_number: int
    title: Optional[str] = None


class SeasonResponse(BaseModel):
    id: int
    show_id: int
    season_number: int
    title: Optional[str] = None

    class Config:
        from_attributes = True