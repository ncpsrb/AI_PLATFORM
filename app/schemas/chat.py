from pydantic import BaseModel

from app.schemas.common import TimestampedSchema


class ChatCreate(BaseModel):
    title: str


class ChatRead(TimestampedSchema):
    id: int
    user_id: int
    agent_id: int
    title: str
