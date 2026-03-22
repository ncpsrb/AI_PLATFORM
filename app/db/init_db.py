from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User


def seed_admin(session: Session) -> None:
    admin_email = "admin@platform.local"
    admin = session.query(User).filter(User.email == admin_email).first()
    if admin:
        return

    session.add(
        User(
            email=admin_email,
            full_name="Platform Admin",
            hashed_password=get_password_hash("admin123"),
            is_admin=True,
        )
    )
    session.commit()
