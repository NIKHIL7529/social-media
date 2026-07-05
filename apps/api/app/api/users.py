from fastapi import APIRouter, Depends, Request, Response
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.security import (
    auth_cookie_options,
    create_access_token,
    get_current_user,
    get_optional_user,
    serialize_auth_user,
)
from app.services.user_service import (
    authenticate_user,
    create_user,
    get_user_by_id,
    get_user_by_name,
    list_users,
    normalize_username,
    search_users,
    toggle_follow,
    update_password,
    update_profile,
)

router = APIRouter()


class SignupPayload(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    dob: str
    gender: str
    password: str = Field(min_length=8)
    city: str = ""
    country: str = ""
    description: str = ""
    photo: str = ""

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return normalize_username(value)


class EditProfilePayload(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    dob: str
    gender: str
    city: str = ""
    country: str = ""
    description: str = ""
    photo: str = ""

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        return normalize_username(value)


class ChangePasswordPayload(BaseModel):
    currentPassword: str = Field(min_length=1)
    newPassword: str = Field(min_length=8)


class LoginPayload(BaseModel):
    name: str
    password: str


class SearchPayload(BaseModel):
    name: str = ""


class UserLookupPayload(BaseModel):
    id: str | None = Field(default=None, alias="_id")


class UserNameLookupPayload(BaseModel):
    name: str


class FollowPayload(BaseModel):
    userName: str


@router.get("/")
async def all_users() -> dict:
    return await list_users()


@router.post("/signup")
async def signup(payload: SignupPayload) -> dict:
    return await create_user(payload.model_dump())


@router.post("/login")
async def login(payload: LoginPayload, request: Request, response: Response) -> dict:
    user = await authenticate_user(payload.name, payload.password)
    response.set_cookie("token", create_access_token(user["_id"], user["name"]), **auth_cookie_options(request))
    return {"status": 200, "message": "Login successful", "user": serialize_auth_user(user)}


@router.get("/logout")
async def logout(request: Request, response: Response) -> dict:
    cookie_options = auth_cookie_options(request)
    response.delete_cookie("token", path="/", secure=cookie_options["secure"], samesite=cookie_options["samesite"])
    return {"status": 200}


@router.get("/profile")
async def profile(current_user: dict = Depends(get_current_user)) -> dict:
    return {"status": 200, "message": "Profile data", "user": serialize_auth_user(current_user)}


@router.post("/editProfile")
async def edit_profile(
    payload: EditProfilePayload,
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user),
) -> dict:
    user, username_changed = await update_profile(payload.model_dump(), current_user)
    if username_changed:
        response.set_cookie("token", create_access_token(current_user["_id"], user["name"]), **auth_cookie_options(request))
    return {"status": 200, "message": "User info changed", "user": serialize_auth_user(user)}


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
