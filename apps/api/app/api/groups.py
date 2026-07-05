from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.domains.groups import CreateGroupPayload, RenameGroupPayload
from app.domains.groups import create_group as create_group_service
from app.domains.groups import rename_group as rename_group_service

router = APIRouter()


@router.post("/createGroup")
async def create_group(payload: CreateGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await create_group_service(payload.name, payload.users, current_user)


@router.post("/renameGroup")
async def rename_group(payload: RenameGroupPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await rename_group_service(payload.chatId, payload.name, current_user)
