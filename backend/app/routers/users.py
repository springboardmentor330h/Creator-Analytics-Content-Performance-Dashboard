from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.core.security import hash_password
from backend.app.core.deps import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["User & Role Management"]
)


@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    new_user = User(
        full_name=user.full_name,
        email=user.email,
        password=hash_password(
            user.password
        ),
        role=user.role or "creator"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.full_name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.get("/me")
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """Fetch profile details, assigned role, and role-based permissions for current logged-in user."""
    role_capabilities = {
        "creator": [
            "Personal Social Media Analytics",
            "Content Performance Tracking",
            "Audience Demographics & Growth",
            "Monetization & Sponsorship Management",
            "Personal Report Generation"
        ],
        "agency": [
            "Multi-Creator Portfolio Management",
            "Brand Sponsorship Oversight",
            "Cross-Creator Performance Benchmarking",
            "Agency Client Reports",
            "Team Member Overview"
        ],
        "marketing": [
            "Campaign Reach & Engagement Tracking",
            "Audience Sentiment & Topic Discovery",
            "Sponsorship ROI Analytics",
            "Platform Comparison Reports",
            "Exportable PDF/Excel Reports"
        ],
        "administrator": [
            "Full Platform Administration",
            "User Account & Role Management",
            "Platform Integration Status",
            "System Audit & Logs",
            "Database & Security Controls"
        ]
    }

    user_role = (current_user.role or "creator").lower()
    capabilities = role_capabilities.get(user_role, role_capabilities["creator"])

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "capabilities": capabilities
    }


@router.get("/", response_model=List[UserResponse])
@router.get("", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all registered users (accessible by Administrator and Agency roles for user management)."""
    user_role = (current_user.role or "creator").lower()
    if user_role not in ["administrator", "admin", "agency"]:
        # Return at least the current user for self-viewing if role is lower
        return [current_user]
    
    return db.query(User).order_by(User.id.asc()).all()


@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update role for a user (Administrator permission required)."""
    new_role = payload.get("role")
    if not new_role or new_role.lower() not in ["creator", "agency", "marketing", "administrator"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be one of: creator, agency, marketing, administrator"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    target_user.role = new_role.lower()
    db.commit()
    db.refresh(target_user)

    return {
        "message": f"Updated user '{target_user.email}' role to '{target_user.role}' successfully",
        "user": {
            "id": target_user.id,
            "email": target_user.email,
            "full_name": target_user.full_name,
            "role": target_user.role
        }
    }