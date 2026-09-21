import { api } from './client';
import { mapDonation, toEndOfDay } from './mappers';

/**
 * Backend contract:
 * - GET /donations/my -> DonationOut[] (auth)
 * - POST /admin/donations {donor_id,request_id?,hospital_name,donation_date?,units 1-2} (admin)
 * - PUT /admin/donations/{id} partial (admin)
 * - DELETE /admin/donations/{id} -> 204 (admin)
 * Note: no admin list endpoint exists; the admin page derives what it can
 * from member history + stats.
 */
export async function listMyDonations() {
  const data = await api.get('/donations/my');
  return (data || []).map(mapDonation);
}

export async function createDonation(form) {
  const payload = {
    donor_id: Number(form.donor_id),
    request_id: form.request_id ? Number(form.request_id) : null,
    hospital_name: form.hospital?.trim(),
    units: Number(form.units ?? 1),
  };
  if (form.date) payload.donation_date = toEndOfDay(form.date);
  const data = await api.post('/admin/donations', payload);
  return mapDonation(data);
}

export async function updateDonation(id, form) {
  const payload = {};
  if (form.donor_id !== undefined && form.donor_id !== '') payload.donor_id = Number(form.donor_id);
  if (form.request_id !== undefined) payload.request_id = form.request_id ? Number(form.request_id) : null;
  if (form.hospital !== undefined) payload.hospital_name = form.hospital?.trim();
  if (form.date) payload.donation_date = toEndOfDay(form.date);
  if (form.units !== undefined && form.units !== '') payload.units = Number(form.units);
  const data = await api.put(`/admin/donations/${id}`, payload);
  return mapDonation(data);
}

export async function deleteDonation(id) {
  await api.delete(`/admin/donations/${id}`);
  return true;
}
