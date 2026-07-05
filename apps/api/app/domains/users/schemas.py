from pydantic import BaseModel, EmailStr, Field, field_validator

from app.domains.users.rules import normalize_username


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
