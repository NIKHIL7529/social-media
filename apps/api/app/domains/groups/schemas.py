from pydantic import BaseModel, Field


class CreateGroupPayload(BaseModel):
    name: str = Field(default="", max_length=80)
    users: list[str] = Field(default_factory=list)


class RenameGroupPayload(BaseModel):
    chatId: str
    name: str = Field(default="", max_length=80)
