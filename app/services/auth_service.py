from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserCreate


class AuthService:
    @staticmethod
    def login(db: Session, payload: LoginRequest, require_admin: bool = False) -> TokenResponse:
        user = db.query(User).filter(User.email == payload.email).first()
        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
        if require_admin and not user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin account required")
        token = create_access_token(subject=user.email, role="admin" if user.is_admin else "user")
        return TokenResponse(access_token=token, role="admin" if user.is_admin else "user")

    @staticmethod
    def create_user(db: Session, payload: UserCreate) -> User:
        existing_user = db.query(User).filter(User.email == payload.email).first()
        if existing_user:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already exists")

        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=get_password_hash(payload.password),
            is_admin=payload.is_admin,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
