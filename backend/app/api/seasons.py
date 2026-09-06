from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import SessionLocal
from app.models.season import Season
from app.models.show import Show
from app.schemas.season import SeasonCreate, SeasonResponse


router = APIRouter(
    prefix="/seasons",
    tags=["Seasons"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE SEASON
# Editor + Admin
# =========================

@router.post(
    "/",
    response_model=SeasonResponse
)
def create_season(
    season: SeasonCreate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    show = (
        db.query(Show)
        .filter(Show.id == season.show_id)
        .first()
    )

    if not show:
        raise HTTPException(
            status_code=404,
            detail="Show not found"
        )

    existing_season = (
        db.query(Season)
        .filter(
            Season.show_id == season.show_id,
            Season.season_number == season.season_number
        )
        .first()
    )

    if existing_season:
        raise HTTPException(
            status_code=409,
            detail=f"Season {season.season_number} already exists for this show"
        )

    new_season = Season(
        show_id=season.show_id,
        season_number=season.season_number,
        title=season.title
    )

    try:

        db.add(new_season)
        db.commit()
        db.refresh(new_season)

        return new_season

    except IntegrityError:

        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="This season already exists for the selected show"
        )


# =========================
# GET ALL SEASONS
# All roles
# =========================

@router.get(
    "/",
    response_model=list[SeasonResponse]
)
def get_seasons(
    db: Session = Depends(get_db)
):

    return db.query(Season).all()


# =========================
# GET SINGLE SEASON
# All roles
# =========================

@router.get(
    "/{season_id}",
    response_model=SeasonResponse
)
def get_season(
    season_id: int,
    db: Session = Depends(get_db)
):

    season = (
        db.query(Season)
        .filter(Season.id == season_id)
        .first()
    )

    if not season:

        raise HTTPException(
            status_code=404,
            detail="Season not found"
        )

    return season


# =========================
# UPDATE SEASON
# Editor + Admin
# =========================

@router.put(
    "/{season_id}",
    response_model=SeasonResponse
)
def update_season(
    season_id: int,
    season_data: SeasonCreate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role not in {"admin", "editor"}:

        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    season = (
        db.query(Season)
        .filter(Season.id == season_id)
        .first()
    )

    if not season:

        raise HTTPException(
            status_code=404,
            detail="Season not found"
        )

    show = (
        db.query(Show)
        .filter(Show.id == season_data.show_id)
        .first()
    )

    if not show:

        raise HTTPException(
            status_code=404,
            detail="Show not found"
        )

    duplicate = (
        db.query(Season)
        .filter(
            Season.show_id == season_data.show_id,
            Season.season_number == season_data.season_number,
            Season.id != season_id
        )
        .first()
    )

    if duplicate:

        raise HTTPException(
            status_code=409,
            detail="Another season with this number already exists"
        )

    season.show_id = season_data.show_id
    season.season_number = season_data.season_number
    season.title = season_data.title

    db.commit()
    db.refresh(season)

    return season


# =========================
# DELETE SEASON
# Admin only
# =========================

@router.delete(
    "/{season_id}"
)
def delete_season(
    season_id: int,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    season = (
        db.query(Season)
        .filter(Season.id == season_id)
        .first()
    )

    if not season:

        raise HTTPException(
            status_code=404,
            detail="Season not found"
        )

    db.delete(season)
    db.commit()

    return {
        "message": "Season deleted successfully"
    }