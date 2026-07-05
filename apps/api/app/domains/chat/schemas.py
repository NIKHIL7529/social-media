from pydantic import BaseModel, Field

from app.domains.chat.constants import MAX_PAGE_SIZE


class SendMessagePayload(BaseModel):
    receiver: list[str] = Field(default_factory=list)
    msg: str = ""
    id: str | None = Field(default=None, alias="_id")


class MessagesPayload(BaseModel):
    id: str = Field(alias="_id")
    before: str | None = None
    limit: int = Field(default=50, ge=1, le=MAX_PAGE_SIZE)


class MarkReadPayload(BaseModel):
    id: str = Field(alias="_id")


class DirectConversationPayload(BaseModel):
    userName: str
