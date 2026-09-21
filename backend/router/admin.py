from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

import models
import schemas
import stats
from database import get_db
from deps import get_current_admin
from security import utcnow_naive
from serializers import user_to_out

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[schemas.UserOut])
def list_users(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    users = db.query(models.User).all()
    return [user_to_out(u) for u in users]


def _get_user_or_404(user_id: int, db: Session) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.patch("/users/{user_id}/status", response_model=schemas.UserOut)
def update_user_status(
    user_id: int,
    payload: schemas.UserStatusUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    target = _get_user_or_404(user_id, db)

    if target.id == admin.id and payload.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot block your own account",
        )

    target.status = payload.status
    db.commit()
    db.refresh(target)
    return user_to_out(target)


@router.patch("/users/{user_id}/role", response_model=schemas.UserOut)
def update_user_role(
    user_id: int,
    payload: schemas.UserRoleUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    target = _get_user_or_404(user_id, db)

    if target.id == admin.id and payload.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot remove your own admin access",
        )

    target.role = payload.role
    db.commit()
    db.refresh(target)
    return user_to_out(target)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own account",
        )

    target = _get_user_or_404(user_id, db)

    has_records = (
        db.query(models.BloodRequest).filter(models.BloodRequest.requester_id == target.id).first()
        or db.query(models.Offer).filter(models.Offer.donor_id == target.id).first()
        or db.query(models.Donation).filter(models.Donation.donor_id == target.id).first()
    )
    if has_records:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This user has blood requests, offers or donation records and cannot be deleted; block the account instead",
        )

    db.delete(target)
    db.commit()
    return None


def _get_request_or_404(request_id: int, db: Session) -> models.BloodRequest:
    req = db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return req


@router.get("/requests", response_model=List[schemas.RequestOut])
def list_all_requests(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    return db.query(models.BloodRequest).all()


@router.patch("/requests/{request_id}/approve", response_model=schemas.RequestOut)
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    req = _get_request_or_404(request_id, db)

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve a request with status '{req.status}'; only pending requests can be approved",
        )

    req.status = "approved"
    db.commit()
    db.refresh(req)
    return req


@router.patch("/requests/{request_id}/reject", response_model=schemas.RequestOut)
def reject_request(
    request_id: int,
    payload: schemas.RequestReject,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    req = _get_request_or_404(request_id, db)

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject a request with status '{req.status}'; only pending requests can be rejected",
        )

    req.status = "rejected"
    req.rejection_reason = payload.rejection_reason
    db.commit()
    db.refresh(req)
    return req


def _sync_last_donation_date(db: Session, donor_id: int) -> None:
    latest = db.query(func.max(models.Donation.donation_date)).filter(models.Donation.donor_id == donor_id).scalar()
    donor = db.query(models.User).filter(models.User.id == donor_id).first()
    if donor:
        donor.last_donation_date = latest


def _get_donation_or_404(donation_id: int, db: Session) -> models.Donation:
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    return donation


def _validate_donation_refs(db: Session, donor_id: int, request_id) -> None:
    if not db.query(models.User).filter(models.User.id == donor_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donor not found")
    if request_id is not None and not db.query(models.BloodRequest).filter(models.BloodRequest.id == request_id).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")


def _ensure_no_duplicate_donation(db: Session, donor_id: int, request_id, exclude_id=None) -> None:
    if request_id is None:
        return
    query = db.query(models.Donation).filter(
        models.Donation.donor_id == donor_id, models.Donation.request_id == request_id
    )
    if exclude_id is not None:
        query = query.filter(models.Donation.id != exclude_id)
    if query.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A donation for this donor and request already exists",
        )


@router.post("/donations", response_model=schemas.DonationOut, status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: schemas.DonationCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    _validate_donation_refs(db, payload.donor_id, payload.request_id)
    _ensure_no_duplicate_donation(db, payload.donor_id, payload.request_id)

    donation = models.Donation(
        donor_id=payload.donor_id,
        request_id=payload.request_id,
        hospital_name=payload.hospital_name,
        donation_date=payload.donation_date or utcnow_naive(),
        units=payload.units,
    )
    db.add(donation)
    db.flush()
    _sync_last_donation_date(db, donation.donor_id)
    db.commit()
    db.refresh(donation)
    return donation


@router.put("/donations/{donation_id}", response_model=schemas.DonationOut)
def update_donation(
    donation_id: int,
    payload: schemas.DonationUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    donation = _get_donation_or_404(donation_id, db)
    update_data = payload.model_dump(exclude_unset=True)

    old_donor_id = donation.donor_id
    new_donor_id = update_data.get("donor_id", donation.donor_id)
    new_request_id = update_data.get("request_id", donation.request_id)

    _validate_donation_refs(db, new_donor_id, new_request_id)
    _ensure_no_duplicate_donation(db, new_donor_id, new_request_id, exclude_id=donation.id)

    for field, value in update_data.items():
        setattr(donation, field, value)
    db.flush()

    _sync_last_donation_date(db, new_donor_id)
    if old_donor_id != new_donor_id:
        _sync_last_donation_date(db, old_donor_id)

    db.commit()
    db.refresh(donation)
    return donation


@router.delete("/donations/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donation(
    donation_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    donation = _get_donation_or_404(donation_id, db)
    donor_id = donation.donor_id

    db.delete(donation)
    db.flush()
    _sync_last_donation_date(db, donor_id)
    db.commit()
    return None


def _get_camp_or_404(camp_id: int, db: Session) -> models.BloodCamp:
    camp = db.query(models.BloodCamp).filter(models.BloodCamp.id == camp_id).first()
    if not camp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camp not found")
    return camp


@router.post("/camps", response_model=schemas.CampOut, status_code=status.HTTP_201_CREATED)
def create_camp(
    payload: schemas.CampCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    camp = models.BloodCamp(
        title=payload.title,
        organizer=payload.organizer,
        district=payload.district,
        venue=payload.venue,
        date=payload.date,
        status=payload.status,
    )
    db.add(camp)
    db.commit()
    db.refresh(camp)
    return camp


@router.put("/camps/{camp_id}", response_model=schemas.CampOut)
def update_camp(
    camp_id: int,
    payload: schemas.CampUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    camp = _get_camp_or_404(camp_id, db)
    update_data = payload.model_dump(exclude_unset=True)

    if "date" in update_data or "status" in update_data:
        try:
            schemas.check_camp_date_matches_status(
                update_data.get("date", camp.date),
                update_data.get("status", camp.status),
            )
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    for field, value in update_data.items():
        setattr(camp, field, value)

    db.commit()
    db.refresh(camp)
    return camp


@router.delete("/camps/{camp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camp(
    camp_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    camp = _get_camp_or_404(camp_id, db)
    db.delete(camp)
    db.commit()
    return None


@router.get("/stats", response_model=schemas.AdminStatsOut)
def admin_stats(db: Session = Depends(get_db), admin: models.User = Depends(get_current_admin)):
    return stats.build_admin_stats(db)
