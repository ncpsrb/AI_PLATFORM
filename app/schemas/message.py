from pydantic import BaseModel

from app.schemas.common import TimestampedSchema


class MessageCreate(BaseModel):
    content: str


class MessageRead(TimestampedSchema):
    id: int
    chat_id: int
    user_id: int | None = None
    role: str
    content: str
