from sqlalchemy import Column, Integer, String, Float, Date
from app.database import Base


class Revenue(Base):
    """
    A single earnings record for a creator, from any revenue source
    (sponsorship, ad revenue, affiliate marketing, brand collaboration,
    or subscription revenue).
    """
    __tablename__ = "revenue"

    id = Column(Integer, primary_key=True, index=True)
    creator_id = Column(Integer, nullable=False, index=True)
    source = Column(String, nullable=False)   # e.g. "Sponsorship", "Ad Revenue", ...
    amount = Column(Float, nullable=False, default=0)
    currency = Column(String, nullable=False, default="USD")
    description = Column(String, nullable=True)
    date = Column(Date, nullable=False)