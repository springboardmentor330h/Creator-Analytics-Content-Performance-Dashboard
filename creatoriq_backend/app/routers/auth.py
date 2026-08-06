from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import LoginRequest, TokenResponse, UserRegister

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserRegister, db: Session = Depends(get_db)):
    email = user.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    new_user = User(full_name=user.full_name, email=email, password=hash_password(user.password), role="creator")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "full_name": new_user.full_name, "email": new_user.email, "role": new_user.role}


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if user is None or not verify_password(credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(access_token=create_access_token(str(user.id)))
