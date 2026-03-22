from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.schemas.notification import NotificationCreate


class NotificationService:
    @staticmethod
    def create(db: Session, payload: NotificationCreate) -> Notification:
        notification = Notification(**payload.model_dump())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
