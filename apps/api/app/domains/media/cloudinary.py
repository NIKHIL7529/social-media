import base64
from urllib.parse import urlparse

import cloudinary
import cloudinary.uploader
from fastapi import HTTPException

from app.core.config import get_settings

ALLOWED_IMAGE_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024


def configure_cloudinary() -> None:
    settings = get_settings()
    if not settings.cloudinary_cloud_name:
        return
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


async def upload_image(data_url: str, folder: str) -> str:
    if not data_url:
        return ""
    validate_data_url(data_url)
    result = cloudinary.uploader.upload(
        data_url,
        folder=folder,
        resource_type="image",
        transformation=[
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return result["secure_url"]


async def delete_image(image_url: str) -> None:
    public_id = cloudinary_public_id(image_url)
    if not public_id:
        return
    try:
        cloudinary.uploader.destroy(public_id, resource_type="image")
    except Exception:
        return


def validate_data_url(data_url: str) -> None:
    if not data_url.startswith("data:"):
        raise HTTPException(status_code=400, detail="Image must be uploaded as a data URL")
    metadata, _, encoded = data_url.partition(",")
    if not encoded or ";base64" not in metadata:
        raise HTTPException(status_code=400, detail="Image must be base64 encoded")
    mime_type = metadata.removeprefix("data:").split(";", 1)[0]
    if mime_type not in ALLOWED_IMAGE_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported image type")
    try:
        size = len(base64.b64decode(encoded, validate=True))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid image data") from exc
    if size > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image must be 10MB or smaller")


def cloudinary_public_id(image_url: str) -> str:
    settings = get_settings()
    if not image_url or not settings.cloudinary_cloud_name:
        return ""
    parsed = urlparse(image_url)
    expected_host = f"res.cloudinary.com"
    if expected_host not in parsed.netloc or f"/{settings.cloudinary_cloud_name}/" not in parsed.path:
        return ""

    marker = "/upload/"
    if marker not in parsed.path:
        return ""
    path = parsed.path.split(marker, 1)[1]
    parts = path.split("/")
    if parts and parts[0].startswith("v") and parts[0][1:].isdigit():
        parts = parts[1:]
    public_path = "/".join(parts)
    return public_path.rsplit(".", 1)[0] if "." in public_path else public_path
