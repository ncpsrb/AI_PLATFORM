from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.chat import Chat
    from app.models.notification import Notification
    from app.models.usage_log import UsageLog
    from app.models.user import User


class Agent(TimestampMixin, Base):
    __tablename__ = "agents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    source_type: Mapped[str] = mapped_column(String(20), nullable=False)
    source_reference: Mapped[Optional[str]] = mapped_column(String(255))
    configuration: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    behavior_prompt: Mapped[Optional[str]] = mapped_column(Text)

    owner: Mapped["User"] = relationship(back_populates="agents")
    chats: Mapped[list["Chat"]] = relationship(back_populates="agent", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="generator_agent")
    usage_logs: Mapped[list["UsageLog"]] = relationship(back_populates="agent")
