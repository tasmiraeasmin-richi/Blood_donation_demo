import { api } from './client';
import { mapCamp, toEndOfDay } from './mappers';

/**
 * Backend contract (main.py + router/admin.py):
 * - GET /camps, GET /camps/{id} (public)
 * - POST /admin/camps {title,organizer,district,venue,date,status} (admin;
 *   date must match status: upcoming->future, completed->past)
 * - PUT /admin/camps/{id} partial (admin)
 * - DELETE /admin/camps/{id} -> 204 (admin)
 */
export async function listCamps() {
  const data = await api.get('/camps', { auth: false });
  return (data || []).map(mapCamp);
}

export async function getCamp(id) {
  const data = await api.get(`/camps/${id}`, { auth: false });
  return mapCamp(data);
}

function toCampPayload(form) {
  return {
    title: form.title?.trim(),
    organizer: form.organizer?.trim(),
    district: form.district,
    venue: form.venue?.trim(),
    date: form.date ? toEndOfDay(form.date) : form.date,
    status: form.status,
  };
}

export async function createCamp(form) {
  const data = await api.post('/admin/camps', toCampPayload(form));
  return mapCamp(data);
}

export async function updateCamp(id, form) {
  const data = await api.put(`/admin/camps/${id}`, toCampPayload(form));
  return mapCamp(data);
}

export async function deleteCamp(id) {
  await api.delete(`/admin/camps/${id}`);
  return true;
}
