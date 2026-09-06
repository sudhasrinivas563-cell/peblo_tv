from pydantic import BaseModel
from typing import Optional


class ShowCreate(BaseModel):
    title: str
    description: Optional[str] = None
    language: Optional[str] = None
    genre: Optional[str] = None
    artwork_url: Optional[str] = None


class ShowResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    language: Optional[str] = None
    genre: Optional[str] = None
    artwork_url: Optional[str] = None
    status: str

    class Config:
        from_attributes = True