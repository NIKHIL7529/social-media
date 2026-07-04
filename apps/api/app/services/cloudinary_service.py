import cloudinary
import cloudinary.uploader

from app.core.config import get_settings


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
    result = cloudinary.uploader.upload(
        data_url,
        folder=folder,
        resource_type="image",
        transformation=[
            {"quality": "auto", "fetch_format": "auto"},
        ],
    )
    return result["secure_url"]
