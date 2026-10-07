from typing import Annotated

from pydantic import AfterValidator, BaseModel, BeforeValidator, EmailStr, Field

from app.domains.users.rules import normalize_email, normalize_login_identifier, validate_password, validate_username

Username = Annotated[str, BeforeValidator(validate_username)]
AccountEmail = Annotated[EmailStr, BeforeValidator(normalize_email)]
StrongPassword = Annotated[str, AfterValidator(validate_password)]


class SignupPayload(BaseModel):
    username: Username
    email: AccountEmail
    dob: str
    gender: str
    password: StrongPassword
    city: str = ""
    country: str = ""
    description: str = ""
    photo: str = ""


class EditProfilePayload(BaseModel):
    username: Username
    dob: str
    gender: str
    city: str = ""
    country: str = ""
    description: str = ""
    photo: str = ""


class ChangePasswordPayload(BaseModel):
    currentPassword: str = Field(min_length=1)
    newPassword: StrongPassword


class LoginPayload(BaseModel):
    name: Annotated[str, BeforeValidator(normalize_login_identifier), Field(min_length=1)]
    password: str = Field(min_length=1)


class SearchPayload(BaseModel):
    name: str = ""


class UserLookupPayload(BaseModel):
    id: str | None = Field(default=None, alias="_id")


class UserNameLookupPayload(BaseModel):
    name: str


class FollowPayload(BaseModel):
    userName: str
