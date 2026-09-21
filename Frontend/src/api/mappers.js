/**
 * Backend -> UI field adapters.
 *
 * The backend is the source of truth for field names (units_needed,
 * hospital_name, ISO datetimes). The UI was built against mock-shaped
 * fields (units, hospital, date-only strings), so services normalize
 * responses here to keep components unchanged.
 */

/** "2026-09-15T00:00:00" -> "2026-09-15" (for display helpers & date inputs) */
export function toDatePart(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value;
}

/** "2026-09-15" (date input) -> "2026-09-15T23:59:59" so same-day
 * required dates pass the backend's "not in the past" check. */
export function toEndOfDay(dateStr) {
  if (!dateStr) return dateStr;
  return `${dateStr}T23:59:59`;
}

export function mapRequest(r) {
  if (!r) return r;
  return {
    id: r.id,
    request_code: r.request_code,
    requester_id: r.requester_id,
    patient_name: r.patient_name,
    blood_group: r.blood_group,
    units: r.units_needed,
    hospital: r.hospital_name,
    district: r.district,
    contact_phone: r.contact_phone,
    required_date: toDatePart(r.required_date),
    urgency: r.urgency,
    status: r.status,
    rejection_reason: r.rejection_reason ?? null,
  };
}

export function mapRequestCreate(form) {
  return {
    patient_name: form.patient_name?.trim(),
    blood_group: form.blood_group,
    units_needed: Number(form.units),
    hospital_name: form.hospital?.trim(),
    district: form.district,
    contact_phone: form.contact_phone?.trim(),
    required_date: toEndOfDay(form.required_date),
    urgency: form.urgency || 'normal',
  };
}

export function mapRequestUpdate(form) {
  const payload = {};
  if (form.patient_name !== undefined) payload.patient_name = form.patient_name?.trim();
  if (form.blood_group) payload.blood_group = form.blood_group;
  if (form.units !== undefined && form.units !== '') payload.units_needed = Number(form.units);
  if (form.hospital !== undefined) payload.hospital_name = form.hospital?.trim();
  if (form.district) payload.district = form.district;
  if (form.contact_phone !== undefined) payload.contact_phone = form.contact_phone?.trim();
  if (form.required_date) payload.required_date = toEndOfDay(form.required_date);
  if (form.urgency) payload.urgency = form.urgency;
  return payload;
}

export function mapDonor(d) {
  if (!d) return d;
  // Backend lists only active + eligible donors; phone is included for authenticated users.
  return {
    id: d.id,
    name: d.name,
    blood_group: d.blood_group,
    district: d.district,
    phone: d.phone ?? null,
    is_available: true,
    last_donation_date: null,
  };
}

export function mapUser(u) {
  if (!u) return u;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    blood_group: u.blood_group,
    district: u.district,
    is_available: u.is_available,
    last_donation_date: toDatePart(u.last_donation_date) || null,
    status: u.status,
    is_eligible_donor: u.is_eligible_donor,
    created_at: null,
  };
}

export function mapCamp(c) {
  if (!c) return c;
  return {
    id: c.id,
    title: c.title,
    organizer: c.organizer,
    district: c.district,
    venue: c.venue,
    date: toDatePart(c.date),
    status: c.status,
  };
}

export function mapMyOffer(o) {
  if (!o) return o;
  return {
    id: o.id,
    request_id: o.request_id,
    request_code: o.request_code,
    patient_name: null,
    blood_group: o.blood_group,
    units: o.units_needed,
    hospital: o.hospital_name,
    district: o.district,
    urgency: o.urgency,
    required_date: toDatePart(o.required_date),
    donation_date: toDatePart(o.donation_date) || null,
    request_status: o.request_status,
    status: o.status,
    created_at: toDatePart(o.required_date),
  };
}

export function mapOfferDetail(o) {
  if (!o) return o;
  return {
    id: o.id,
    request_id: o.request_id,
    donor_id: o.donor_id,
    status: o.status,
    donor_name: o.donor_name,
    blood_group: o.donor_blood_group,
    district: o.donor_district,
    phone: o.donor_phone ?? null,
    is_available: null,
    last_donation_date: null,
  };
}

export function mapDonation(d) {
  if (!d) return d;
  return {
    id: d.id,
    donor_id: d.donor_id,
    donor_name: null,
    request_id: d.request_id,
    request_code: null,
    hospital: d.hospital_name,
    date: toDatePart(d.donation_date),
    units: d.units,
    blood_group: null,
    status: 'completed',
  };
}
