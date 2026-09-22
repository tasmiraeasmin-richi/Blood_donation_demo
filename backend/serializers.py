import models
import schemas
from eligibility import is_donor_eligible


def user_to_out(user: models.User) -> schemas.UserOut:
    return schemas.UserOut(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role,
        blood_group=user.blood_group,
        district=user.district,
        is_available=user.is_available,
        last_donation_date=user.last_donation_date,
        status=user.status,
        is_eligible_donor=is_donor_eligible(user.is_available, user.last_donation_date),
    )


def offer_to_detail(offer: models.Offer) -> schemas.OfferDetailOut:
    donor = offer.donor
    return schemas.OfferDetailOut(
        id=offer.id,
        request_id=offer.request_id,
        donor_id=offer.donor_id,
        status=offer.status,
        donor_name=donor.name,
        donor_blood_group=donor.blood_group,
        donor_district=donor.district,
        donor_phone=donor.phone if offer.status == "accepted" else None,
    )


def request_to_list_out(req: models.BloodRequest) -> schemas.RequestListOut:
    return schemas.RequestListOut(
        id=req.id,
        request_code=req.request_code,
        requester_id=req.requester_id,
        patient_name=req.patient_name,
        blood_group=req.blood_group,
        units_needed=req.units_needed,
        hospital_name=req.hospital_name,
        district=req.district,
        required_date=req.required_date,
        urgency=req.urgency,
        status=req.status,
        rejection_reason=req.rejection_reason,
    )


def request_to_detail_out(req: models.BloodRequest, show_contact: bool) -> schemas.RequestDetailOut:
    return schemas.RequestDetailOut(
        id=req.id,
        request_code=req.request_code,
        requester_id=req.requester_id,
        patient_name=req.patient_name,
        blood_group=req.blood_group,
        units_needed=req.units_needed,
        hospital_name=req.hospital_name,
        district=req.district,
        contact_phone=req.contact_phone if show_contact else None,
        required_date=req.required_date,
        urgency=req.urgency,
        status=req.status,
        rejection_reason=req.rejection_reason,
    )


def my_offer_to_out(offer: models.Offer, donation_date=None) -> schemas.MyOfferOut:
    req = offer.request
    return schemas.MyOfferOut(
        id=offer.id,
        request_id=offer.request_id,
        request_code=req.request_code,
        status=offer.status,
        request_status=req.status,
        blood_group=req.blood_group,
        units_needed=req.units_needed,
        hospital_name=req.hospital_name,
        district=req.district,
        urgency=req.urgency,
        required_date=req.required_date,
        donation_date=donation_date,
    )
