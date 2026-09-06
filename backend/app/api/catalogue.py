from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import SessionLocal
from app.models.show import Show
from app.models.catalogue import Catalogue, CatalogueItem
from app.services.validation import validate_show


router = APIRouter(
    prefix="/catalogue",
    tags=["Catalogue"]
)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# PUBLISH CATALOGUE
# =========================

@router.post("/publish")
def publish_catalogue(
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):

    if x_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required to publish"
        )

    published_shows = (
        db.query(Show)
        .filter(Show.status == "published")
        .all()
    )

    draft_shows = (
        db.query(Show)
        .filter(Show.status == "draft")
        .all()
    )

    if not published_shows and not draft_shows:
        raise HTTPException(
            status_code=400,
            detail="No shows available for publishing"
        )

    # Validate all draft shows before publishing
    validation_errors = {}

    for show in draft_shows:

        errors = validate_show(
            show,
            db
        )

        if errors:
            validation_errors[show.id] = errors

    if validation_errors:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Publishing failed. Validation errors found.",
                "errors": validation_errors
            }
        )

    # Find latest catalogue version
    latest_version = (
        db.query(
            func.max(Catalogue.version)
        ).scalar()
    )

    new_version = (
        latest_version or 0
    ) + 1

    try:

        catalogue = Catalogue(
            version=new_version
        )

        db.add(catalogue)

        # Get catalogue ID before adding items
        db.flush()

        # Add already published shows
        for show in published_shows:

            db.add(
                CatalogueItem(
                    catalogue_id=catalogue.id,
                    show_id=show.id
                )
            )

        # Add draft shows and publish them
        for show in draft_shows:

            db.add(
                CatalogueItem(
                    catalogue_id=catalogue.id,
                    show_id=show.id
                )
            )

            show.status = "published"

        # Atomic commit
        db.commit()

        return {
            "message": "Catalogue published successfully",
            "catalogue_id": catalogue.id,
            "version": catalogue.version,
            "shows_published": len(draft_shows),
            "total_shows_in_catalogue": (
                len(published_shows)
                + len(draft_shows)
            )
        }

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Publishing failed. No changes were applied."
        )


# =========================
# CURRENT CATALOGUE
# =========================

@router.get("/")
def get_catalogue(
    db: Session = Depends(get_db)
):

    catalogue = (
        db.query(Catalogue)
        .order_by(
            Catalogue.version.desc()
        )
        .first()
    )

    if not catalogue:

        return {
            "message": "No catalogue has been published yet"
        }

    items = (
        db.query(CatalogueItem)
        .filter(
            CatalogueItem.catalogue_id
            == catalogue.id
        )
        .all()
    )

    return {
        "catalogue_id": catalogue.id,
        "version": catalogue.version,
        "published_at": catalogue.published_at,
        "shows": [
            item.show_id
            for item in items
        ]
    }


# =========================
# PUBLIC CATALOGUE SHOWS
# =========================

@router.get("/shows")
def get_catalogue_shows(
    db: Session = Depends(get_db)
):

    catalogue = (
        db.query(Catalogue)
        .order_by(
            Catalogue.version.desc()
        )
        .first()
    )

    if not catalogue:

        return {
            "version": None,
            "shows": []
        }

    shows = (
        db.query(Show)
        .join(
            CatalogueItem,
            CatalogueItem.show_id == Show.id
        )
        .filter(
            CatalogueItem.catalogue_id == catalogue.id,
            Show.status == "published"
        )
        .all()
    )

    return {
        "version": catalogue.version,
        "shows": [
            {
                "id": show.id,
                "title": show.title,
                "description": show.description,
                "language": show.language,
                "genre": show.genre,
                "artwork_url": show.artwork_url,
                "status": show.status
            }
            for show in shows
        ]
    }


# =========================
# PUBLISH HISTORY
# =========================

@router.get("/history")
def get_publish_history(
    db: Session = Depends(get_db)
):

    catalogues = (
        db.query(Catalogue)
        .order_by(
            Catalogue.version.desc()
        )
        .all()
    )

    history = []

    for catalogue in catalogues:

        items = (
            db.query(CatalogueItem)
            .filter(
                CatalogueItem.catalogue_id
                == catalogue.id
            )
            .all()
        )

        history.append(
            {
                "catalogue_id": catalogue.id,
                "version": catalogue.version,
                "published_at": catalogue.published_at,
                "show_count": len(items),
                "show_ids": [
                    item.show_id
                    for item in items
                ]
            }
        )

    return {
        "history": history
    }