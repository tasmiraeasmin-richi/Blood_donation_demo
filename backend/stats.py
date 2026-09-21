from typing import Dict, Iterable

from sqlalchemy import func
from sqlalchemy.orm import Query, Session

import models
import schemas
from eligibility import days_until_eligible, is_donor_eligible

REQUEST_STATUSES = ("pending", "approved", "rejected", "fulfilled")
OFFER_STATUSES = ("offered", "accepted", "declined")
URGENCIES = ("normal", "urgent", "critical")
CAMP_STATUSES = ("upcoming", "completed")


def _grouped_counts(query: Query, column, keys: Iterable[str]) -> Dict[str, int]:
    rows = query.with_entities(column, func.count()).group_by(column).all()
    counts = {value: n for value, n in rows}
    result = {key: counts.get(key, 0) for key in keys}
    result["total"] = sum(counts.values())
    return result


def _donation_totals(query: Query) -> Dict[str, int]:
    total = query.with_entities(func.count(models.Donation.id)).scalar() or 0
    total_units = query.with_entities(func.coalesce(func.sum(models.Donation.units), 0)).scalar() or 0
    return {"total": total, "total_units": int(total_units)}


def build_member_stats(db: Session, user: models.User) -> schemas.MemberStatsOut:
    my_requests = db.query(models.BloodRequest).filter(models.BloodRequest.requester_id == user.id)
    request_counts = _grouped_counts(my_requests, models.BloodRequest.status, REQUEST_STATUSES)

    pending_offers_received = (
        db.query(func.count(models.Offer.id))
        .join(models.BloodRequest, models.Offer.request_id == models.BloodRequest.id)
        .filter(
            models.BloodRequest.requester_id == user.id,
            models.BloodRequest.status == "approved",
            models.Offer.status == "offered",
        )
        .scalar()
        or 0
    )

    my_offers = db.query(models.Offer).filter(models.Offer.donor_id == user.id)
    offer_counts = _grouped_counts(my_offers, models.Offer.status, OFFER_STATUSES)

    my_donations = db.query(models.Donation).filter(models.Donation.donor_id == user.id)
    donation_counts = _donation_totals(my_donations)

    return schemas.MemberStatsOut(
        requests=schemas.MemberRequestStats(**request_counts, pending_offers_received=pending_offers_received),
        offers=schemas.OfferStatusCounts(**offer_counts),
        donations=schemas.MemberDonationStats(**donation_counts, last_donation_date=user.last_donation_date),
        eligibility=schemas.MemberEligibilityStats(
            is_available=bool(user.is_available),
            is_eligible_donor=is_donor_eligible(user.is_available, user.last_donation_date),
            days_until_eligible=days_until_eligible(user.last_donation_date),
        ),
    )


def build_admin_stats(db: Session) -> schemas.AdminStatsOut:
    users = db.query(models.User)
    role_counts = _grouped_counts(users, models.User.role, ("admin", "member"))
    status_counts = _grouped_counts(users, models.User.status, ("active", "blocked"))

    active_rows = (
        db.query(models.User.is_available, models.User.last_donation_date)
        .filter(models.User.status == "active")
        .all()
    )
    eligible_donors = sum(1 for is_available, last_date in active_rows if is_donor_eligible(is_available, last_date))

    requests = db.query(models.BloodRequest)
    request_counts = _grouped_counts(requests, models.BloodRequest.status, REQUEST_STATUSES)
    open_requests = requests.filter(models.BloodRequest.status == "approved")
    urgency_counts = _grouped_counts(open_requests, models.BloodRequest.urgency, URGENCIES)
    urgency_counts.pop("total")

    offer_counts = _grouped_counts(db.query(models.Offer), models.Offer.status, OFFER_STATUSES)

    donations = db.query(models.Donation)
    donation_counts = _donation_totals(donations)
    unique_donors = donations.with_entities(func.count(func.distinct(models.Donation.donor_id))).scalar() or 0

    camp_counts = _grouped_counts(db.query(models.BloodCamp), models.BloodCamp.status, CAMP_STATUSES)

    return schemas.AdminStatsOut(
        users=schemas.UserStats(
            total=role_counts["total"],
            admins=role_counts["admin"],
            members=role_counts["member"],
            active=status_counts["active"],
            blocked=status_counts["blocked"],
            eligible_donors=eligible_donors,
        ),
        requests=schemas.AdminRequestStats(**request_counts, open_by_urgency=schemas.UrgencyCounts(**urgency_counts)),
        offers=schemas.OfferStatusCounts(**offer_counts),
        donations=schemas.AdminDonationStats(**donation_counts, unique_donors=unique_donors),
        camps=schemas.CampStats(**camp_counts),
    )
