from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.db.database import Base


class AudienceDemographics(Base):
    __tablename__ = "audience_demographics"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    age_group = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    country = Column(String, nullable=False)
    percentage = Column(Float, nullable=False)

    creator = relationship("User")

Audience = AudienceDemographics