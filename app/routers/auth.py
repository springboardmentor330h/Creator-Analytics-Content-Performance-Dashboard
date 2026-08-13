# from fastapi import APIRouter, Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordRequestForm

# from app.schemas.user import UserRegister, UserResponse, UserInDB, Token
# from app.core.security import hash_password, verify_password, create_access_token
# from app.core.auth import get_current_user, db_users

# router = APIRouter(prefix="/auth", tags=["Auth"])


# @router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
# def register(user_data: UserRegister):
#     """Registers a new user and hashes their password."""
#     if user_data.username in db_users:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail="Username already registered"
#         )
    
#     hashed_pw = hash_password(user_data.password)
#     user_in_db = UserInDB(
#         username=user_data.username,
#         email=user_data.email,
#         hashed_password=hashed_pw
#     )
#     db_users[user_data.username] = user_in_db
#     return user_in_db


# @router.post("/login", response_model=Token)
# def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     """Authenticates credentials and generates a JWT access token."""
#     user = db_users.get(form_data.username)
#     if not user or not verify_password(form_data.password, user.hashed_password):
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    
#     access_token = create_access_token(data={"sub": user.username})
#     return {"access_token": access_token, "token_type": "bearer"}


# @router.get("/me", response_model=UserResponse)
# def read_current_user(current_user: UserInDB = Depends(get_current_user)):
#     """Protected endpoint returning active authenticated user details."""
#     return current_user

# 5 august 2026
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.schemas.user_schema import UserLogin
from app.core.security import verify_password
from app.core.auth import create_access_token

router = APIRouter()

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={"sub": db_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }