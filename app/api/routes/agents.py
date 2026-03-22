from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, get_db
from app.models.agent import Agent
from app.models.user import User
from app.schemas.agent import AgentCreate, AgentRead, AgentUpdate
from app.services.agent_service import AgentService
from app.services.usage_log_service import UsageLogService

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("", response_model=list[AgentRead])
def list_agents(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Agent).filter(Agent.owner_id == current_user.id).order_by(Agent.created_at.desc()).all()


@router.post("", response_model=AgentRead, status_code=status.HTTP_201_CREATED)
def create_agent(payload: AgentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = AgentService.create_for_user(db, current_user.id, payload)
    UsageLogService.create(db, user_id=current_user.id, agent_id=agent.id, action="agent_created")
    return agent


@router.get("/{agent_id}", response_model=AgentRead)
def get_agent(agent_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.owner_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return agent


@router.put("/{agent_id}", response_model=AgentRead)
def update_agent(agent_id: int, payload: AgentUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.owner_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return AgentService.update(agent, payload, db)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_agent(agent_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id, Agent.owner_id == current_user.id).first()
    if not agent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    db.delete(agent)
    db.commit()
