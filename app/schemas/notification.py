from pydantic import BaseModel

from app.schemas.common import TimestampedSchema


class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    rule_name: str | None = None
    generator_agent_id: int | None = None


class NotificationUpdate(BaseModel):
    is_read: bool


class NotificationRead(TimestampedSchema):
    id: int
    user_id: int
    title: str
    message: str
    rule_name: str | None = None
    is_read: bool
    generator_agent_id: int | None = None
