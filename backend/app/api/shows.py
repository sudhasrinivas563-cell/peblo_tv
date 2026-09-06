from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.show import Show
from app.schemas.show import ShowCreate, ShowResponse


router = APIRouter(
    prefix="/shows",
    tags=["Shows"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# CREATE SHOW
# Editor + Admin
# =========================

@router.post(
    "/",
    response_model=ShowResponse
)
def create_show(
    show: ShowCreate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    new_show = Show(
        title=show.title,
        description=show.description,
        language=show.language,
        genre=show.genre,
        artwork_url=show.artwork_url
    )

    db.add(new_show)
    db.commit()
    db.refresh(new_show)

    return new_show


# =========================
# GET ALL SHOWS
# All roles
# =========================

@router.get(
    "/",
    response_model=list[ShowResponse]
)
def get_shows(
    db: Session = Depends(get_db)
):

    return db.query(Show).all()


# =========================
# SEARCH PUBLISHED SHOWS
# Public / Viewer
# =========================

@router.get(
    "/search",
    response_model=list[ShowResponse]
)
def search_shows(
    query: str | None = None,
    language: str | None = None,
    genre: str | None = None,
    db: Session = Depends(get_db)
):

    shows_query = db.query(Show).filter(
        Show.status == "published"
    )

    if query:

        shows_query = shows_query.filter(
            Show.title.ilike(
                f"%{query}%"
            )
        )

    if language:

        shows_query = shows_query.filter(
            Show.language.ilike(
                f"%{language}%"
            )
        )

    if genre:

        shows_query = shows_query.filter(
            Show.genre.ilike(
                f"%{genre}%"
            )
        )

    return shows_query.all()


# =========================
# GET SINGLE SHOW
# All roles
# =========================

@router.get(
    "/{show_id}",
    response_model=ShowResponse
)
def get_show(
    show_id: int,
    db: Session = Depends(get_db)
):

    show = (
        db.query(Show)
        .filter(
            Show.id == show_id
        )
        .first()
    )

    if not show:

        raise HTTPException(
            status_code=404,
            detail="Show not found"
        )

    return show


# =========================
# UPDATE SHOW
# Editor + Admin
# =========================

@router.put(
    "/{show_id}",
    response_model=ShowResponse
)
def update_show(
    show_id: int,
    show_data: ShowCreate,
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
        .filter(
            Show.id == show_id
        )
        .first()
    )

    if not show:

        raise HTTPException(
            status_code=404,
            detail="Show not found"
        )

    show.title = show_data.title
    show.description = show_data.description
    show.language = show_data.language
    show.genre = show_data.genre

    if show_data.artwork_url is not None:
        show.artwork_url = (
            show_data.artwork_url
        )

    db.commit()
    db.refresh(show)

    return show


# =========================
# DELETE SHOW
# Admin only
# =========================

@router.delete(
    "/{show_id}"
)
def delete_show(
    show_id: int,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    show = (
        db.query(Show)
        .filter(
            Show.id == show_id
        )
        .first()
    )

    if not show:

        raise HTTPException(
            status_code=404,
            detail="Show not found"
        )

    db.delete(show)
    db.commit()

    return {
        "message": "Show deleted successfully"
    }