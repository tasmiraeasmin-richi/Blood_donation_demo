from datetime import datetime, timezone
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

BloodGroup = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]


def _check_password_bytes(v: str) -> str:
    if len(v.encode("utf-8")) > 72:
        raise ValueError("password must be at most 72 bytes long")
    return v


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    phone: str = Field(..., min_length=1)
    password: str = Field(..., min_length=6)
    blood_group: BloodGroup
    district: str = Field(..., min_length=1)

    @field_validator("password")
    @classmethod
    def password_within_bcrypt_limit(cls, v: str) -> str:
        return _check_password_bytes(v)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    role: str
    blood_group: str
    district: str
    is_available: bool
    last_donation_date: Optional[datetime] = None
    status: str
    is_eligible_donor: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    phone: Optional[str] = Field(default=None, min_length=1)
    blood_group: Optional[BloodGroup] = None
    district: Optional[str] = Field(default=None, min_length=1)
    is_available: Optional[bool] = None

    @model_validator(mode="after")
    def no_explicit_nulls(self):
        for name in self.model_fields_set:
            if getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        return self


class PasswordChange(BaseModel):
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=6)

    @field_validator("new_password")
    @classmethod
    def password_within_bcrypt_limit(cls, v: str) -> str:
        return _check_password_bytes(v)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=6)

    @field_validator("new_password")
    @classmethod
    def password_within_bcrypt_limit(cls, v: str) -> str:
        return _check_password_bytes(v)


class DonorOut(BaseModel):
    id: int
    name: str
    blood_group: str
    district: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    status: Literal["active", "blocked"]


class UserRoleUpdate(BaseModel):
    role: Literal["admin", "member"]


Urgency = Literal["normal", "urgent", "critical"]


class RequestCreate(BaseModel):
    patient_name: str = Field(..., min_length=1)
    blood_group: BloodGroup
    units_needed: int = Field(..., ge=1, le=10)
    hospital_name: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    contact_phone: str = Field(..., min_length=1)
    required_date: datetime
    urgency: Urgency = "normal"

    @field_validator("required_date")
    @classmethod
    def required_date_not_in_past(cls, v: datetime) -> datetime:
        now = datetime.now(v.tzinfo) if v.tzinfo else datetime.now()
        if v < now:
            raise ValueError("required_date cannot be in the past")
        return v


class RequestUpdate(BaseModel):
    patient_name: Optional[str] = Field(default=None, min_length=1)
    blood_group: Optional[BloodGroup] = None
    units_needed: Optional[int] = Field(default=None, ge=1, le=10)
    hospital_name: Optional[str] = Field(default=None, min_length=1)
    district: Optional[str] = Field(default=None, min_length=1)
    contact_phone: Optional[str] = Field(default=None, min_length=1)
    required_date: Optional[datetime] = None
    urgency: Optional[Urgency] = None

    @model_validator(mode="after")
    def no_explicit_nulls(self):
        for name in self.model_fields_set:
            if getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        return self

    @field_validator("required_date")
    @classmethod
    def required_date_not_in_past(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        now = datetime.now(v.tzinfo) if v.tzinfo else datetime.now()
        if v < now:
            raise ValueError("required_date cannot be in the past")
        return v


class RequestOut(BaseModel):
    id: int
    request_code: str
    requester_id: int
    patient_name: str
    blood_group: str
    units_needed: int
    hospital_name: str
    district: str
    contact_phone: str
    required_date: datetime
    urgency: str
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class RequestReject(BaseModel):
    rejection_reason: str = Field(..., min_length=1)


class RequestListOut(BaseModel):
    """Public request-list item. contact_phone is intentionally excluded."""

    id: int
    request_code: str
    requester_id: int
    patient_name: str
    blood_group: str
    units_needed: int
    hospital_name: str
    district: str
    required_date: datetime
    urgency: str
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class RequestDetailOut(BaseModel):
    """Request detail. contact_phone is only populated for authenticated users."""

    id: int
    request_code: str
    requester_id: int
    patient_name: str
    blood_group: str
    units_needed: int
    hospital_name: str
    district: str
    contact_phone: Optional[str] = None
    required_date: datetime
    urgency: str
    status: str
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class OfferOut(BaseModel):
    id: int
    request_id: int
    donor_id: int
    status: str

    class Config:
        from_attributes = True


class OfferStatusUpdate(BaseModel):
    status: Literal["accepted", "declined"]


class OfferDetailOut(BaseModel):
    id: int
    request_id: int
    donor_id: int
    status: str
    donor_name: str
    donor_blood_group: str
    donor_district: str
    donor_phone: Optional[str] = None


class MyOfferOut(BaseModel):
    id: int
    request_id: int
    request_code: str
    status: str
    request_status: str
    blood_group: str
    units_needed: int
    hospital_name: str
    district: str
    urgency: str
    required_date: datetime
    donation_date: Optional[datetime] = None


def _donation_date_to_naive_utc(v: Optional[datetime]) -> Optional[datetime]:
    if v is None:
        return v
    if v.tzinfo is not None:
        v = v.astimezone(timezone.utc).replace(tzinfo=None)
    if v > datetime.now(timezone.utc).replace(tzinfo=None):
        raise ValueError("donation_date cannot be in the future")
    return v


class DonationOut(BaseModel):
    id: int
    donor_id: int
    request_id: Optional[int] = None
    hospital_name: str
    donation_date: datetime
    units: int

    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    donor_id: int
    request_id: Optional[int] = None
    hospital_name: str = Field(..., min_length=1)
    donation_date: Optional[datetime] = None
    units: int = Field(default=1, ge=1, le=2)

    @field_validator("donation_date")
    @classmethod
    def validate_donation_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        return _donation_date_to_naive_utc(v)


class DonationUpdate(BaseModel):
    donor_id: Optional[int] = None
    request_id: Optional[int] = None
    hospital_name: Optional[str] = Field(default=None, min_length=1)
    donation_date: Optional[datetime] = None
    units: Optional[int] = Field(default=None, ge=1, le=2)

    @field_validator("donation_date")
    @classmethod
    def validate_donation_date(cls, v: Optional[datetime]) -> Optional[datetime]:
        return _donation_date_to_naive_utc(v)

    @model_validator(mode="after")
    def no_null_for_required_fields(self):
        for name in ("donor_id", "hospital_name", "donation_date", "units"):
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        return self


CampStatus = Literal["upcoming", "completed"]


def check_camp_date_matches_status(date: datetime, camp_status: str) -> None:
    now = datetime.now(date.tzinfo) if date.tzinfo else datetime.now()
    if camp_status == "upcoming" and date < now:
        raise ValueError("An upcoming camp cannot have a date in the past (use status 'completed')")
    if camp_status == "completed" and date > now:
        raise ValueError("A completed camp cannot have a date in the future (use status 'upcoming')")


class CampOut(BaseModel):
    id: int
    title: str
    organizer: str
    district: str
    venue: str
    date: datetime
    status: str

    class Config:
        from_attributes = True


class CampCreate(BaseModel):
    title: str = Field(..., min_length=1)
    organizer: str = Field(..., min_length=1)
    district: str = Field(..., min_length=1)
    venue: str = Field(..., min_length=1)
    date: datetime
    status: CampStatus = "upcoming"

    @model_validator(mode="after")
    def date_matches_status(self):
        check_camp_date_matches_status(self.date, self.status)
        return self


class CampUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1)
    organizer: Optional[str] = Field(default=None, min_length=1)
    district: Optional[str] = Field(default=None, min_length=1)
    venue: Optional[str] = Field(default=None, min_length=1)
    date: Optional[datetime] = None
    status: Optional[CampStatus] = None

    @model_validator(mode="after")
    def no_null_for_required_fields(self):
        for name in ("title", "organizer", "district", "venue", "date", "status"):
            if name in self.model_fields_set and getattr(self, name) is None:
                raise ValueError(f"{name} cannot be null")
        return self


class RequestStatusCounts(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int
    fulfilled: int


class OfferStatusCounts(BaseModel):
    total: int
    offered: int
    accepted: int
    declined: int


class MemberRequestStats(RequestStatusCounts):
    pending_offers_received: int


class MemberDonationStats(BaseModel):
    total: int
    total_units: int
    last_donation_date: Optional[datetime] = None


class MemberEligibilityStats(BaseModel):
    is_available: bool
    is_eligible_donor: bool
    days_until_eligible: int


class MemberStatsOut(BaseModel):
    requests: MemberRequestStats
    offers: OfferStatusCounts
    donations: MemberDonationStats
    eligibility: MemberEligibilityStats


class UserStats(BaseModel):
    total: int
    admins: int
    members: int
    active: int
    blocked: int
    eligible_donors: int


class UrgencyCounts(BaseModel):
    normal: int
    urgent: int
    critical: int


class AdminRequestStats(RequestStatusCounts):
    open_by_urgency: UrgencyCounts


class AdminDonationStats(BaseModel):
    total: int
    total_units: int
    unique_donors: int


class CampStats(BaseModel):
    total: int
    upcoming: int
    completed: int


class AdminStatsOut(BaseModel):
    users: UserStats
    requests: AdminRequestStats
    offers: OfferStatusCounts
    donations: AdminDonationStats
    camps: CampStats
