from sqlalchemy.orm import Session
from app.models.user import User

def get_or_create_demo_user(db: Session, role: str):
    """
    Temporary helper: since there's no login yet, we don't have real user
    records tied to a person. This just fetches (or creates) one demo user
    per role, so dashboard endpoints have something to attach data to.
    """
    user = db.query(User).filter(User.role == role).first()
    if not user:
        user = User(full_name=f"Demo {role.title()}", role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user