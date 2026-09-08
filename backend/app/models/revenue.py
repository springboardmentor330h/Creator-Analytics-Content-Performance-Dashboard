"""
Revenue and sponsorship models.

WHY two separate tables instead of one "deals" table?
Revenue is a RECORD of money received (already happened, or a scheduled
payout) — ad revenue, platform payouts, affiliate income, etc. It's
inherently a ledger entry: source, amount, date, done.

Sponsorship is a RELATIONSHIP with a brand over a campaign — it has a
lifecycle (pending -> active -> completed), a date RANGE, and may
generate MULTIPLE revenue records (a sponsorship can pay in installments).
Modeling them separately lets a sponsorship exist before any money has
actually arrived (status=pending), which a revenue-only model couldn't
represent.
"""
import enum
import uuid
from datetime import datetime, date

from sqlalchemy import Column, String, DateTime, Date, Enum, Float, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.session import Base
from app.db.types import GUID
from app.models.content import Platform


class RevenueType(str, enum.Enum):
    ad_revenue = "ad_revenue"
    sponsorship = "sponsorship"
    affiliate = "affiliate"
    merchandise = "merchandise"
    membership = "membership"
    other = "other"


class RevenueStatus(str, enum.Enum):
    pending = "pending"
    received = "received"
    cancelled = "cancelled"


class Revenue(Base):
    __tablename__ = "revenue"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    source = Column(Enum(Platform), nullable=False)  # reuse Platform enum as "source"
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)  # ISO 4217 code
    date = Column(Date, nullable=False)
    revenue_type = Column(Enum(RevenueType), nullable=False)
    status = Column(Enum(RevenueStatus), default=RevenueStatus.received, nullable=False)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", backref="revenue_records")


class SponsorshipStatus(str, enum.Enum):
    pending = "pending"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"


class Sponsorship(Base):
    __tablename__ = "sponsorships"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    creator_id = Column(GUID(), ForeignKey("users.id"), nullable=False, index=True)

    brand = Column(String(200), nullable=False)
    campaign = Column(String(200), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(Enum(SponsorshipStatus), default=SponsorshipStatus.pending, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)  # nullable: ongoing/open-ended deals
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    creator = relationship("User", backref="sponsorships")
