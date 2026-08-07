from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.database import Base


class RoleEnum(str, Enum):
    """
    Canonical roles for the CreatorIQ platform.

    NOTE: Earlier versions of this project used "admin" / "user" as
    role values. Any existing rows with those legacy values will keep
    working for login, but role-restricted endpoints (RBAC) only
    recognise the four roles below. Update any legacy rows
    ("admin" -> "administrator") if you want those accounts to pass
    the new role checks.
    """
    CREATOR = "creator"
    AGENCY = "agency"
    MARKETING_TEAM = "marketing_team"
    ADMINISTRATOR = "administrator"


class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    role = Column(
        String(50),
        nullable=False
    )

    hashed_password = Column(
        String(255),
        nullable=False
    )

    creator_profile = relationship(
        "CreatorProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    agency_profile = relationship(
        "AgencyProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )


# ============================================================
# CREATOR PROFILE
# ============================================================
class CreatorProfile(Base):
    """
    Extended profile information for users with the CREATOR role.
    One-to-one with User.
    """

    __tablename__ = "creator_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    display_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    niche = Column(String(100), nullable=True)
    social_links = Column(Text, nullable=True)  # simple JSON/comma string, kept flexible
    follower_count = Column(Integer, nullable=True, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="creator_profile")


# ============================================================
# AGENCY PROFILE
# ============================================================
class AgencyProfile(Base):
    """
    Extended profile information for users with the AGENCY role.
    One-to-one with User.
    """

    __tablename__ = "agency_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    company_name = Column(String(150), nullable=True)
    website = Column(String(255), nullable=True)
    contact_person = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="agency_profile")
    