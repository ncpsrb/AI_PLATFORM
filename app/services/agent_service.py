from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.agent import Agent
from app.models.user import User
from app.schemas.agent import AgentAssign, AgentCreate, AgentUpdate


class AgentService:
    @staticmethod
    def create_for_user(db: Session, owner_id: int, payload: AgentCreate | AgentAssign) -> Agent:
        user = db.query(User).filter(User.id == owner_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        agent = Agent(
            owner_id=owner_id,
            name=payload.name,
            description=payload.description,
            source_type=payload.source_type,
            source_reference=payload.source_reference,
            configuration=payload.configuration,
            behavior_prompt=payload.behavior_prompt,
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)
        return agent

    @staticmethod
    def update(agent: Agent, payload: AgentUpdate, db: Session) -> Agent:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(agent, field, value)
        db.commit()
        db.refresh(agent)
        return agent
