from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_admin
from app.models.agent import Agent
from app.models.message import Message
from app.models.notification import Notification
from app.models.usage_log import UsageLog
from app.models.user import User
from app.schemas.agent import AgentAssign, AgentRead, AgentUpdate
from app.schemas.notification import NotificationCreate, NotificationRead
from app.schemas.usage_log import UsageLogRead
from app.schemas.user import UserCreate, UserRead
from app.services.agent_service import AgentService
from app.services.auth_service import AuthService
from app.services.notification_service import NotificationService

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/users", response_model=list[UserRead])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("/users", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    return AuthService.create_user(db, payload)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()


@router.get("/agents", response_model=list[AgentRead])
def list_agents(db: Session = Depends(get_db)):
    return db.query(Agent).order_by(Agent.created_at.desc()).all()


@router.post("/agents", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
def assign_agent(payload: AgentAssign, db: Session = Depends(get_db)):
    return AgentService.create_for_user(db, payload.owner_id, payload)


@router.put("/agents/{agent_id}", response_model=AgentRead)
def configure_agent(agent_id: int, payload: AgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return AgentService.update(agent, payload, db)


@router.delete("/agents/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    db.delete(agent)
    db.commit()


@router.post("/notifications", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    return NotificationService.create(db, payload)


@router.get("/notifications", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db)):
    return db.query(Notification).order_by(Notification.created_at.desc()).all()


@router.get("/usage-logs", response_model=list[UsageLogRead])
def usage_logs(db: Session = Depends(get_db)):
    return db.query(UsageLog).order_by(UsageLog.created_at.desc()).all()


@router.get("/prompts", response_model=list[dict])
def user_prompts(db: Session = Depends(get_db)):
    prompts = db.query(Message).filter(Message.role == "user").order_by(Message.created_at.desc()).all()
    return [
        {
            "id": prompt.id,
            "chat_id": prompt.chat_id,
            "user_id": prompt.user_id,
            "content": prompt.content,
            "created_at": prompt.created_at,
        }
        for prompt in prompts
    ]
