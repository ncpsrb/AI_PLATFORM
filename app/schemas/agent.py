from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import TimestampedSchema


class AgentBase(BaseModel):
    name: str
    description: str | None = None
    source_type: str
    source_reference: str | None = None
    configuration: dict[str, Any] = Field(default_factory=dict)
    behavior_prompt: str | None = None


class AgentCreate(AgentBase):
    pass


class AgentAssign(AgentBase):
    owner_id: int


class AgentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    source_type: str | None = None
    source_reference: str | None = None
    configuration: dict[str, Any] | None = None
    behavior_prompt: str | None = None


class AgentRead(TimestampedSchema):
    id: int
    owner_id: int
    name: str
    description: str | None = None
    source_type: str
    source_reference: str | None = None
    configuration: dict[str, Any]
    behavior_prompt: str | None = None
