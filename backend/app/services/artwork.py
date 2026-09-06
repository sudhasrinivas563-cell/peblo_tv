from PIL import Image
from io import BytesIO


ALLOWED_FORMATS = {
    "JPEG",
    "PNG",
    "WEBP"
}


def validate_artwork(file_bytes: bytes, expected_width: int, expected_height: int):

    try:
        image = Image.open(BytesIO(file_bytes))
        image.verify()
    except Exception:
        raise ValueError("Invalid image file")

    image = Image.open(BytesIO(file_bytes))

    if image.format not in ALLOWED_FORMATS:
        raise ValueError(
            f"Unsupported image format: {image.format}"
        )

    width, height = image.size

    if width != expected_width or height != expected_height:
        raise ValueError(
            f"Invalid dimensions. Expected "
            f"{expected_width}x{expected_height}, "
            f"got {width}x{height}"
        )

    return True