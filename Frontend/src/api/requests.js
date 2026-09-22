import { api } from './client';
import { mapRequest, mapRequestCreate, mapRequestUpdate } from './mappers';

/**
 * Backend contract (main.py):
 * - GET /requests -> approved RequestListOut[] (public, no contact_phone)
 * - GET /requests/my -> own requests (auth, full RequestOut incl. phone)
 * - GET /requests/{id} -> RequestDetailOut (contact_phone only when authenticated)
 * - POST /requests {patient_name,blood_group,units_needed,hospital_name,district,contact_phone,required_date,urgency} (auth)
 * - PUT /requests/{id} partial update, pending + owner only (auth)
 * - DELETE /requests/{id} -> 204, pending + owner only (auth)
 * - PATCH /requests/{id}/fulfill (auth, owner, approved only)
 */
export async function listPublicRequests() {
  const data = await api.get('/requests', { auth: false });
  return (data || []).map(mapRequest);
}

export async function getRequest(id) {
  // Opportunistic auth (default auth: true): public requests are viewable by
  // everyone; owners viewing their own non-approved requests need their JWT.
  // Backend uses optional auth + owner check, so guests never get 401 here.
  const data = await api.get(`/requests/${id}`);
  return mapRequest(data);
}

export async function listMyRequests() {
  const data = await api.get('/requests/my');
  return (data || []).map(mapRequest);
}

export async function createRequest(form) {
  const data = await api.post('/requests', mapRequestCreate(form));
  return mapRequest(data);
}

export async function updateRequest(id, form) {
  const data = await api.put(`/requests/${id}`, mapRequestUpdate(form));
  return mapRequest(data);
}

export async function deleteRequest(id) {
  await api.delete(`/requests/${id}`);
  return true;
}

export async function fulfillRequest(id) {
  const data = await api.patch(`/requests/${id}/fulfill`, {});
  return mapRequest(data);
}
