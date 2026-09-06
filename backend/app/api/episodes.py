from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.database import SessionLocal
from app.models.episode import Episode
from app.models.season import Season
from app.schemas.episode import EpisodeCreate, EpisodeResponse

router = APIRouter(prefix="/episodes", tags=["Episodes"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/", response_model=EpisodeResponse)
def create_episode(
    episode: EpisodeCreate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):
    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    season = db.query(Season).filter(
        Season.id == episode.season_id
    ).first()

    if not season:
        raise HTTPException(
            status_code=404,
            detail="Season not found"
        )

    existing_episode = db.query(Episode).filter(
        Episode.season_id == episode.season_id,
        Episode.episode_number == episode.episode_number
    ).first()

    if existing_episode:
        raise HTTPException(
            status_code=409,
            detail=f"Episode {episode.episode_number} already exists for this season"
        )

    new_episode = Episode(
        season_id=episode.season_id,
        episode_number=episode.episode_number,
        title=episode.title,
        description=episode.description,
        duration_seconds=episode.duration_seconds,
        video_url=episode.video_url,
        thumbnail_url=episode.thumbnail_url
    )

    try:
        db.add(new_episode)
        db.commit()
        db.refresh(new_episode)
        return new_episode

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This episode already exists for the selected season"
        )


@router.get("/", response_model=list[EpisodeResponse])
def get_episodes(
    db: Session = Depends(get_db)
):
    return db.query(Episode).all()


@router.get("/{episode_id}", response_model=EpisodeResponse)
def get_episode(
    episode_id: int,
    db: Session = Depends(get_db)
):
    episode = db.query(Episode).filter(
        Episode.id == episode_id
    ).first()

    if not episode:
        raise HTTPException(
            status_code=404,
            detail="Episode not found"
        )

    return episode


@router.put("/{episode_id}", response_model=EpisodeResponse)
def update_episode(
    episode_id: int,
    episode_data: EpisodeCreate,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):
    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    episode = db.query(Episode).filter(
        Episode.id == episode_id
    ).first()

    if not episode:
        raise HTTPException(
            status_code=404,
            detail="Episode not found"
        )

    season = db.query(Season).filter(
        Season.id == episode_data.season_id
    ).first()

    if not season:
        raise HTTPException(
            status_code=404,
            detail="Season not found"
        )

    duplicate = db.query(Episode).filter(
        Episode.season_id == episode_data.season_id,
        Episode.episode_number == episode_data.episode_number,
        Episode.id != episode_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Another episode with this number already exists"
        )

    episode.season_id = episode_data.season_id
    episode.episode_number = episode_data.episode_number
    episode.title = episode_data.title
    episode.description = episode_data.description
    episode.duration_seconds = episode_data.duration_seconds
    episode.video_url = episode_data.video_url
    episode.thumbnail_url = episode_data.thumbnail_url

    db.commit()
    db.refresh(episode)

    return episode


@router.delete("/{episode_id}")
def delete_episode(
    episode_id: int,
    db: Session = Depends(get_db),
    x_role: str = Header(default="viewer")
):
    if x_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    episode = db.query(Episode).filter(
        Episode.id == episode_id
    ).first()

    if not episode:
        raise HTTPException(
            status_code=404,
            detail="Episode not found"
        )

    db.delete(episode)
    db.commit()

    return {
        "message": "Episode deleted successfully"
    }