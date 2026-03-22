from sqlalchemy.orm import Session

from app.models.usage_log import UsageLog


class UsageLogService:
    @staticmethod
    def create(db: Session, user_id: int, action: str, agent_id: int | None = None, prompt: str | None = None, metadata_json: dict | None = None) -> UsageLog:
        log = UsageLog(
            user_id=user_id,
            agent_id=agent_id,
            action=action,
            prompt=prompt,
            metadata_json=metadata_json or {},
        )
        db.add(log)
        db.commit()
        db.refresh(log)
        return log
