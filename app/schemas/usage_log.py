from typing import Any

from app.schemas.common import TimestampedSchema


class UsageLogRead(TimestampedSchema):
    id: int
    user_id: int
    agent_id: int | None = None
    action: str
    prompt: str | None = None
    metadata_json: dict[str, Any]
