from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    hash_password = Column(String, nullable=False)
    role = Column(String, default="member")
    blood_group = Column(String, nullable=False)
    district = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)
    last_donation_date = Column(DateTime, nullable=True)
    status = Column(String, default="active")
    reset_token = Column(String, nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    blood_requests = relationship("BloodRequest", back_populates="requester")
    offers = relationship("Offer", back_populates="donor")
    donations = relationship("Donation", back_populates="donor")


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_code = Column(String, unique=True, index=True, nullable=False)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    units_needed = Column(Integer, nullable=False)
    hospital_name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    required_date = Column(DateTime, nullable=False)
    urgency = Column(String, default="normal")
    status = Column(String, default="pending")
    rejection_reason = Column(String, nullable=True)

    requester = relationship("User", back_populates="blood_requests")
    offers = relationship("Offer", back_populates="request")
    donations = relationship("Donation", back_populates="request")


class Offer(Base):
    __tablename__ = "offers"
    __table_args__ = (
        UniqueConstraint("request_id", "donor_id", name="uq_offer_request_donor"),
    )

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=False)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="offered")

    request = relationship("BloodRequest", back_populates="offers")
    donor = relationship("User", back_populates="offers")


class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    request_id = Column(Integer, ForeignKey("blood_requests.id"), nullable=True)
    hospital_name = Column(String, nullable=False)
    donation_date = Column(DateTime, server_default=func.now())
    units = Column(Integer, nullable=False)

    donor = relationship("User", back_populates="donations")
    request = relationship("BloodRequest", back_populates="donations")


class BloodCamp(Base):
    __tablename__ = "blood_camps"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    organizer = Column(String, nullable=False)
    district = Column(String, nullable=False)
    venue = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    status = Column(String, default="upcoming")
