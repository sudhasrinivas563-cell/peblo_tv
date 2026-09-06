from fastapi import APIRouter, UploadFile, File, HTTPException, Header
from pathlib import Path
import uuid

from app.services.artwork import validate_artwork

router = APIRouter(prefix="/artwork", tags=["Artwork"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.post("/upload")
async def upload_artwork(
    file: UploadFile = File(...),
    x_role: str = Header(default="viewer")
):
    # Only Admin and Editor can upload artwork
    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    extension = Path(file.filename or "").suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format"
        )

    file_bytes = await file.read()

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty file"
        )

    # Maximum file size: 5 MB
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be less than 5 MB"
        )

    expected_width = 1280
    expected_height = 720

    try:
        validate_artwork(
            file_bytes,
            expected_width,
            expected_height
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / filename

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    artwork_url = f"/uploads/{filename}"

    return {
        "message": "Artwork uploaded successfully",
        "filename": filename,
        "path": str(file_path),
        "url": artwork_url
    }