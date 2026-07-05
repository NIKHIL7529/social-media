from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.domains.notifications import list_notifications, mark_notifications_read

router = APIRouter()


@router.get("")
async def notifications(current_user: dict = Depends(get_current_user)) -> dict:
    return await list_notifications(current_user)


@router.post("/read")
async def read_notifications(current_user: dict = Depends(get_current_user)) -> dict:
    return await mark_notifications_read(current_user)
