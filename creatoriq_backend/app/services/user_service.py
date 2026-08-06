"""User persistence operations shared by API routers."""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


class UserAlreadyExistsError(Exception):
    """Raised when a unique e-mail address is already in use."""


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.scalar(select(User).where(User.email == email.lower()))


def list_users(db: Session, role: Optional[str] = None) -> list[User]:
    query = select(User)
    if role is not None:
        query = query.where(User.role == role)
    return list(db.scalars(query))


def create_user(
    db: Session, *, full_name: str, email: str, password: str, role: str = "creator"
) -> User:
    user = User(
        full_name=full_name,
        email=email.lower(),
        password=hash_password(password),
        role=role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise UserAlreadyExistsError from exc
    db.refresh(user)
    return user


def update_user(
    db: Session,
    user: User,
    *,
    full_name: Optional[str] = None,
    email: Optional[str] = None,
    password: Optional[str] = None,
    role: Optional[str] = None,
) -> User:
    if full_name is not None:
        user.full_name = full_name
    if email is not None:
        user.email = email.lower()
    if password is not None:
        user.password = hash_password(password)
    if role is not None:
        user.role = role
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise UserAlreadyExistsError from exc
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
