from app.schemas.common import serialize_doc
from fastapi import APIRouter, Depends, Response

from app.core.security import (
    auth_cookie_options,
    create_access_token,
    get_current_user,
    get_optional_user,
)
from app.domains.users import (
    authenticate_user,
    ChangePasswordPayload,
    create_user,
    EditProfilePayload,
    FollowPayload,
    get_user_by_id,
    get_user_by_name,
    list_users,
    LoginPayload,
    SearchPayload,
    search_users,
    SignupPayload,
    toggle_follow,
    update_password,
    update_profile,
    UserLookupPayload,
    UserNameLookupPayload,
)

router = APIRouter()


@router.get("/")
async def all_users() -> dict:
    return await list_users()


@router.post("/signup")
async def signup(payload: SignupPayload) -> dict:
    return await create_user(payload.model_dump())


@router.post("/login")
async def login(payload: LoginPayload, response: Response) -> dict:
    user = await authenticate_user(payload.name, payload.password)
    response.set_cookie(
        "token",
        create_access_token(user["_id"], user["username"]),
        **auth_cookie_options(),
    )
    return {"status": 200, "message": "Login successful", "user": serialize_doc(user)}


@router.post("/logout")
async def logout(
    response: Response,
) -> dict:
    cookie_options = auth_cookie_options()
    response.delete_cookie("token", path="/", secure=cookie_options["secure"], samesite=cookie_options["samesite"])
    return {"status": 200}


@router.get("/profile")
async def profile(current_user: dict = Depends(get_current_user)) -> dict:
    return {"status": 200, "message": "Profile data", "user": serialize_doc(current_user)}


@router.post("/editProfile")
async def edit_profile(
    payload: EditProfilePayload,
    response: Response,
    current_user: dict = Depends(get_current_user),
) -> dict:
    user, username_changed = await update_profile(payload.model_dump(), current_user)
    if username_changed:
        response.set_cookie(
            "token",
            create_access_token(user["_id"], user["username"]),
            **auth_cookie_options(),
        )
    return {"status": 200, "message": "User info changed", "user": serialize_doc(user)}


@router.post("/changePassword")
async def change_password(
    payload: ChangePasswordPayload,
    current_user: dict = Depends(get_current_user),
) -> dict:
    return await update_password(payload.currentPassword, payload.newPassword, current_user)


@router.post("/search")
async def search(payload: SearchPayload, current_user: dict | None = Depends(get_optional_user)) -> dict:
    return await search_users(payload.name, current_user)


@router.post("/user")
async def user(payload: UserLookupPayload) -> dict:
    return await get_user_by_id(payload.id)


@router.post("/byName")
async def user_by_name(payload: UserNameLookupPayload) -> dict:
    return await get_user_by_name(payload.name)


@router.post("/follow")
async def follow(payload: FollowPayload, current_user: dict = Depends(get_current_user)) -> dict:
    return await toggle_follow(payload.userName, current_user)
