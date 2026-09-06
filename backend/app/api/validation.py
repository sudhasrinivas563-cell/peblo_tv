from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.show import Show
from app.services.validation import validate_show

router = APIRouter(
    prefix="/validation",
    tags=["Validation"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/show/{show_id}")
def validate_show_api(
    show_id: int,
    db: Session = Depends(get_db)
):

    show = db.query(Show).filter(
        Show.id == show_id
    ).first()

    if not show:
        return {
            "valid": False,
            "errors": ["Show not found"]
        }

    errors = validate_show(show, db)

    return {
        "show_id": show.id,
        "valid": len(errors) == 0,
        "errors": errors
    }