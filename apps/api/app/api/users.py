from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field, field_validator
from pymongo.errors import DuplicateKeyError

from app.core.database import get_database
from app.core.security import (
    auth_cookie_options,
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    serialize_auth_user,
    verify_password,
)
from app.schemas.common import serialize_doc
from app.services.cloudinary_service import upload_image

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
    def normalize_username(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized.replace("_", "").replace(".", "").isalnum():
            raise ValueError("Username can contain letters, numbers, dots, and underscores")
        return normalized


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
    def normalize_username(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not normalized.replace("_", "").replace(".", "").isalnum():
            raise ValueError("Username can contain letters, numbers, dots, and underscores")
        return normalized


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
    users = await get_database().users.find({}, {"password": 0, "email": 0}).to_list(length=500)
    return {"status": 200, "user": serialize_doc(users)}


@router.post("/signup")
async def signup(payload: SignupPayload) -> dict:
    db = get_database()
    email = str(payload.email).lower()
    if await db.users.find_one({"$or": [{"name": payload.username}, {"username": payload.username}, {"email": email}]}):
        raise HTTPException(status_code=400, detail="Username or email already exists")

    image = await upload_image(payload.photo, "images") if payload.photo else ""
    now = datetime.now(timezone.utc)
    user = {
        "name": payload.username,
        "username": payload.username,
        "email": email,
        "dob": payload.dob,
        "gender": payload.gender,
        "password": hash_password(payload.password),
        "city": payload.city,
        "country": payload.country,
        "description": payload.description,
        "photo": image,
        "followers": [],
        "followings": [],
        "saved": [],
        "liked": [],
        "createdAt": now,
        "updatedAt": now,
    }

    try:
        result = await db.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=400, detail="Username or email already exists") from exc

    user["_id"] = result.inserted_id
    return {"status": 200, "user": serialize_auth_user(user)}


@router.post("/login")
async def login(payload: LoginPayload, request: Request, response: Response) -> dict:
    identifier = payload.name.strip().lower()
    user = await get_database().users.find_one(
        {"$or": [{"name": identifier}, {"username": identifier}, {"email": identifier}]}
    )
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect Credentials")

    token = create_access_token(user["_id"], user["name"])
    response.set_cookie("token", token, **auth_cookie_options(request))
    return {
        "status": 200,
        "message": "Login successful",
        "user": serialize_auth_user(user),
    }


@router.get("/logout")
async def logout(request: Request, response: Response) -> dict:
    response.delete_cookie(
        "token",
        path="/",
        secure=auth_cookie_options(request)["secure"],
        samesite=auth_cookie_options(request)["samesite"],
    )
    return {"status": 200}


@router.get("/profile")
async def profile(current_user: dict = Depends(get_current_user)) -> dict:
    return {
        "status": 200,
        "message": "Profile data",
        "user": serialize_auth_user(current_user),
    }


@router.post("/editProfile")
async def edit_profile(
    payload: EditProfilePayload,
    request: Request,
    response: Response,
    current_user: dict = Depends(get_current_user),
) -> dict:
    db = get_database()
    previous_username = current_user.get("username") or current_user["name"]
    existing = await db.users.find_one(
        {
            "_id": {"$ne": current_user["_id"]},
            "$or": [
                {"name": payload.username},
                {"username": payload.username},
            ],
        }
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="User with this username already exist. Try again !!!",
        )

    image = await upload_image(payload.photo, "images") if payload.photo else current_user.get("photo", "")
    update = {
        "name": payload.username,
        "username": payload.username,
        "dob": payload.dob,
        "gender": payload.gender,
        "city": payload.city,
        "country": payload.country,
        "description": payload.description,
        "photo": image,
        "updatedAt": datetime.now(timezone.utc),
    }
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update})
    if previous_username != payload.username:
        await db.users.update_many({"followers": previous_username}, {"$set": {"followers.$": payload.username}})
        await db.users.update_many({"followings": previous_username}, {"$set": {"followings.$": payload.username}})
        await db.messages.update_many({"users": previous_username}, {"$set": {"users.$": payload.username}})
        await db.groups.update_many({"users": previous_username}, {"$set": {"users.$": payload.username}})
        await db.chatmessages.update_many({"sender": previous_username}, {"$set": {"sender": payload.username}})
        await db.comments.update_many({"sender": previous_username}, {"$set": {"sender": payload.username}})
        await db.posts.update_many(
            {"comments.sender": previous_username},
            {"$set": {"comments.$[comment].sender": payload.username}},
            array_filters=[{"comment.sender": previous_username}],
        )
        response.set_cookie("token", create_access_token(current_user["_id"], payload.username), **auth_cookie_options(request))
    user = await db.users.find_one({"_id": current_user["_id"]})
    return {"status": 200, "message": "User info changed", "user": serialize_auth_user(user)}


@router.post("/changePassword")
async def change_password(
    payload: ChangePasswordPayload,
    current_user: dict = Depends(get_current_user),
) -> dict:
    if not verify_password(payload.currentPassword, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    await get_database().users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"password": hash_password(payload.newPassword), "updatedAt": datetime.now(timezone.utc)}},
    )
    return {"status": 200, "message": "Password updated"}


@router.post("/search")
async def search(payload: SearchPayload, current_user: dict | None = Depends(get_optional_user)) -> dict:
    query: dict = {
        "$or": [
            {"name": {"$regex": payload.name, "$options": "i"}},
            {"username": {"$regex": payload.name, "$options": "i"}},
        ]
    }
    if current_user:
        query = {"$and": [query, {"_id": {"$ne": current_user["_id"]}}]}
    users = await get_database().users.find(query, {"name": 1, "username": 1, "photo": 1}).to_list(length=50)
    return {
        "status": 200,
        "message": "User found",
        "search_users": serialize_doc(users),
    }


@router.post("/user")
async def user(payload: UserLookupPayload) -> dict:
    if not payload.id or not ObjectId.is_valid(payload.id):
        raise HTTPException(status_code=400, detail="Invalid user id")
    found = await get_database().users.find_one({"_id": ObjectId(payload.id)}, {"password": 0, "email": 0})
    if not found:
        raise HTTPException(status_code=404, detail="User Not Found")
    return {"status": 200, "message": "User data", "user": serialize_doc(found)}


@router.post("/byName")
async def user_by_name(payload: UserNameLookupPayload) -> dict:
    found = await get_database().users.find_one(
        {"$or": [{"name": payload.name}, {"username": payload.name}]},
        {"password": 0, "email": 0},
    )
    if not found:
        raise HTTPException(status_code=404, detail="User Not Found")
    return {"status": 200, "message": "User data", "user": serialize_doc(found)}


@router.post("/follow")
async def follow(payload: FollowPayload, current_user: dict = Depends(get_current_user)) -> dict:
    db = get_database()
    target = await db.users.find_one({"$or": [{"name": payload.userName}, {"username": payload.userName}]})
    if not target:
        raise HTTPException(status_code=404, detail="User Not Found")
    if target["_id"] == current_user["_id"]:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    profile_name = current_user["name"]
    target_name = target["name"]
    is_following = profile_name in target.get("followers", [])
    if is_following:
        await db.users.update_one({"_id": target["_id"]}, {"$pull": {"followers": profile_name}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$pull": {"followings": target_name}})
        message = "User unfollowed"
        following_state = False
    else:
        await db.users.update_one({"_id": target["_id"]}, {"$addToSet": {"followers": profile_name}})
        await db.users.update_one({"_id": current_user["_id"]}, {"$addToSet": {"followings": target_name}})
        message = "User followed"
        following_state = True

    updated = await db.users.find_one({"_id": target["_id"]}, {"password": 0, "email": 0})
    return {"status": 200, "message": message, "following": following_state, "user": serialize_doc(updated)}
