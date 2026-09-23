from typing import List, Optional
from contextlib import asynccontextmanager
import logging

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

import models
import schemas
import stats
from database import Base, engine, get_db
from deps import get_current_user, get_optional_current_user
from eligibility import days_until_eligible, is_donor_eligible
from request_codes import generate_request_code
from router import auth, admin
from serializers import my_offer_to_out, offer_to_detail, request_to_detail_out, request_to_list_out
from security import utcnow_naive
from seed import seed_admin

Base.metadata.create_all(bind=engine)


logger = logging.getLogger("raktosetu.startup")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Idempotent: creates admin@raktosetu.com once, skips if it exists.
    try:
        seed_admin()
    except Exception:
        # Never start silently without the seed: a DB problem must show up
        # as a loud startup error, not an app that hangs on every request.
        logger.exception("Startup seed failed: database unreachable or seed error; refusing to start.")
        raise
    yield


app = FastAPI(title="RaktoSetu API", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "https://radiant-liger-59172b.netlify.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "RaktoSetu API is running"}


@app.get("/donors", response_model=List[schemas.DonorOut])
def list_donors(
    blood_group: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    query = db.query(models.User).filter(models.User.status == "active")

    if blood_group:
        query = query.filter(models.User.blood_group == blood_group)
    if district:
        query = query.filter(models.User.district == district)

    candidates = query.all()

    eligible_donors = [u for u in candidates if is_donor_eligible(u.is_available, u.last_donation_date)]

    show_phone = current_user is not None

    return [
        schemas.DonorOut(
            id=donor.id,
            name=donor.name,
            blood_group=donor.blood_group,
            district=donor.district,
            phone=donor.phone if show_phone else None,
        )
        for donor in eligible_donors
    ]


@app.post("/requests", response_model=schemas.RequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    payload: schemas.RequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    new_request = models.BloodRequest(
        request_code=generate_request_code(db),
        requester_id=current_user.id,
        patient_name=payload.patient_name,
        blood_group=payload.blood_group,
        units_needed=payload.units_needed,
        hospital_name=payload.hospital_name,
        district=payload.district,
        contact_phone=payload.contact_phone,
        required_date=payload.required_date,
        urgency=payload.urgency,
        status="pending",
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request


@app.get("/requests", response_model=List[schemas.RequestListOut])
def list_public_requests(db: Session = Depends(get_db)):
    requests = db.query(models.BloodRequest).filter(models.BloodRequest.status == "approved").all()
    return [request_to_list_out(r) for r in requests]


@app.get("/requests/my", response_model=List[schemas.RequestOut])
def list_my_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.BloodRequest)
        .filter(models.BloodRequest.requester_id == current_user.id)
        .all()
    )


@app.get("/requests/{request_id}", response_model=schemas.RequestDetailOut)
def get_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(get_optional_current_user),
):
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    is_owner = current_user is not None and current_user.id == req.requester_id
    if req.status != "approved" and not is_owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    return request_to_detail_out(req, show_contact=current_user is not None)


@app.put("/requests/{request_id}", response_model=schemas.RequestOut)
def update_request(
    request_id: int,
    payload: schemas.RequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own requests")

    if req.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be edited")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(req, field, value)

    db.commit()
    db.refresh(req)
    return req


@app.delete("/requests/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.requester_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own requests")

    if req.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only pending requests can be deleted")

    db.delete(req)
    db.commit()
    return None


@app.patch("/requests/{request_id}/fulfill", response_model=schemas.RequestOut)
def fulfill_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.requester_id != current_user.id:
        if req.status != "approved":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only fulfill your own requests")

    if req.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot fulfill a request with status '{req.status}'; only approved requests can be fulfilled",
        )

    accepted_offers = (
        db.query(models.Offer)
        .filter(models.Offer.request_id == req.id, models.Offer.status == "accepted")
        .all()
    )
    now = utcnow_naive()
    for offer in accepted_offers:
        already_recorded = (
            db.query(models.Donation)
            .filter(models.Donation.request_id == req.id, models.Donation.donor_id == offer.donor_id)
            .first()
        )
        if already_recorded:
            recorded_on = already_recorded.donation_date
            if recorded_on and (offer.donor.last_donation_date is None or offer.donor.last_donation_date < recorded_on):
                offer.donor.last_donation_date = recorded_on
            continue
        if days_until_eligible(offer.donor.last_donation_date) > 0:
            continue
        db.add(
            models.Donation(
                donor_id=offer.donor_id,
                request_id=req.id,
                hospital_name=req.hospital_name,
                donation_date=now,
                units=1,
            )
        )
        offer.donor.last_donation_date = now

    req.status = "fulfilled"
    db.commit()
    db.refresh(req)
    return req


@app.post("/requests/{request_id}/offers", response_model=schemas.OfferOut, status_code=status.HTTP_201_CREATED)
def create_offer(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    is_owner = req.requester_id == current_user.id

    if req.status in ("pending", "rejected") and not is_owner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if is_owner:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot offer to donate to your own request")

    if req.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot offer on a request with status '{req.status}'; only approved requests accept offers",
        )

    if not is_donor_eligible(current_user.is_available, current_user.last_donation_date):
        if not current_user.is_available:
            detail = "You are marked as unavailable; set yourself available to offer"
        else:
            detail = f"You are not eligible to donate yet; {days_until_eligible(current_user.last_donation_date)} day(s) remaining in the 90-day waiting period"
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    duplicate_detail = "You have already made an offer on this request"
    existing = (
        db.query(models.Offer)
        .filter(models.Offer.request_id == req.id, models.Offer.donor_id == current_user.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=duplicate_detail)

    offer = models.Offer(request_id=req.id, donor_id=current_user.id, status="offered")
    db.add(offer)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=duplicate_detail)
    db.refresh(offer)
    return offer


def _get_owned_request_or_error(request_id: int, db: Session, current_user: models.User) -> models.BloodRequest:
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.requester_id != current_user.id:
        if req.status != "approved":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the request owner can manage its offers")
    return req


@app.get("/requests/{request_id}/offers", response_model=List[schemas.OfferDetailOut])
def list_request_offers(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = _get_owned_request_or_error(request_id, db, current_user)
    offers = db.query(models.Offer).filter(models.Offer.request_id == req.id).order_by(models.Offer.id).all()
    return [offer_to_detail(o) for o in offers]


@app.patch("/requests/{request_id}/offers/{offer_id}", response_model=schemas.OfferDetailOut)
def respond_to_offer(
    request_id: int,
    offer_id: int,
    payload: schemas.OfferStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    req = _get_owned_request_or_error(request_id, db, current_user)

    offer = (
        db.query(models.Offer)
        .filter(models.Offer.id == offer_id, models.Offer.request_id == req.id)
        .first()
    )
    if not offer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")

    if req.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot respond to offers on a request with status '{req.status}'",
        )

    if offer.status != "offered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot change an offer with status '{offer.status}'; only offered offers can be accepted or declined",
        )

    if payload.status == "accepted":
        donor = offer.donor
        if not is_donor_eligible(donor.is_available, donor.last_donation_date):
            if not donor.is_available:
                detail = "This donor is currently marked as unavailable; the offer cannot be accepted"
            else:
                detail = f"This donor is still in the 90-day waiting period ({days_until_eligible(donor.last_donation_date)} day(s) remaining); the offer cannot be accepted"
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    offer.status = payload.status
    db.commit()
    db.refresh(offer)
    return offer_to_detail(offer)


@app.get("/offers/my", response_model=List[schemas.MyOfferOut])
def list_my_offers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    offers = (
        db.query(models.Offer)
        .filter(models.Offer.donor_id == current_user.id)
        .order_by(models.Offer.id.desc())
        .all()
    )

    donation_dates = {
        d.request_id: d.donation_date
        for d in db.query(models.Donation).filter(models.Donation.donor_id == current_user.id).all()
    }
    return [my_offer_to_out(o, donation_dates.get(o.request_id) if o.status == "accepted" else None) for o in offers]


@app.get("/donations/my", response_model=List[schemas.DonationOut])
def list_my_donations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Donation)
        .filter(models.Donation.donor_id == current_user.id)
        .order_by(models.Donation.donation_date.desc(), models.Donation.id.desc())
        .all()
    )


@app.get("/camps", response_model=List[schemas.CampOut])
def list_camps(db: Session = Depends(get_db)):
    return db.query(models.BloodCamp).order_by(models.BloodCamp.date, models.BloodCamp.id).all()


@app.get("/camps/{camp_id}", response_model=schemas.CampOut)
def get_camp(camp_id: int, db: Session = Depends(get_db)):
    camp = db.query(models.BloodCamp).filter(models.BloodCamp.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camp not found")
    return camp


@app.get("/stats/me", response_model=schemas.MemberStatsOut)
def my_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return stats.build_member_stats(db, current_user)
