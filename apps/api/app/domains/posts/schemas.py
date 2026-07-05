from pydantic import BaseModel, Field


class FeedPayload(BaseModel):
    cursor: str | None = None
    limit: int = Field(default=10, ge=1, le=25)


class AddPostPayload(BaseModel):
    topic: str = ""
    text: str = ""
    photo: str
    commentable: bool = True


class PostIdPayload(BaseModel):
    id: str = Field(alias="_id")


class CommentPayload(BaseModel):
    id: str = Field(alias="_id")
    comment: str = Field(min_length=1, max_length=1000)
