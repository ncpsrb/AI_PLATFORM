from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.agent import Agent
from app.models.chat import Chat
from app.models.message import Message
from app.models.user import User
from app.schemas.chat import ChatCreate, ChatRead
from app.schemas.message import MessageCreate, MessageRead
from app.services.chat_service import ChatService
from app.services.usage_log_service import UsageLogService

router = APIRouter(tags=["chats"])


@router.get("/agents/{agent_id}/chats", response_model=list[ChatRead])
def list_chats(agent_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Chat)
        .filter(Chat.agent_id == agent_id, Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
        .all()
    )


@router.post("/agents/{agent_id}/chats", response_model=ChatRead, status_code=status.HTTP_201_CREATED)
def create_chat(agent_id: int, payload: ChatCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.owner_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return ChatService.create_chat(db, current_user, agent, payload.title)


@router.get("/chats/{chat_id}/messages", response_model=list[MessageRead])
def list_messages(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = ChatService.ensure_chat_access(db.query(Chat).filter(Chat.id == chat_id).first(), current_user)
    return db.query(Message).filter(Message.chat_id == chat.id).order_by(Message.created_at.asc()).all()


@router.post("/chats/{chat_id}/messages", response_model=list[MessageRead], status_code=status.HTTP_201_CREATED)
def send_message(chat_id: int, payload: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = ChatService.ensure_chat_access(db.query(Chat).filter(Chat.id == chat_id).first(), current_user)
    agent = db.query(Agent).filter(Agent.id == chat.agent_id).first()
    user_message = ChatService.add_user_message(db, chat, current_user, payload.content)
    assistant_message = ChatService.add_agent_reply(db, chat, agent, payload.content)
    UsageLogService.create(
        db,
        user_id=current_user.id,
        agent_id=agent.id,
        action="chat_message",
        prompt=payload.content,
        metadata_json={"chat_id": chat.id},
    )
    return [user_message, assistant_message]
