from pydantic import BaseModel, EmailStr

from app.schemas.common import TimestampedSchema


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    is_admin: bool = False


class UserRead(TimestampedSchema):
    id: int
    email: EmailStr
    full_name: str
    is_admin: bool
    is_active: bool
