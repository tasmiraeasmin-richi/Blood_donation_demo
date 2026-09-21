import { api } from './client';
import { mapRequest } from './mappers';

/**
 * Backend contract (router/admin.py):
 * - GET /admin/requests -> all BloodRequest[] (admin)
 * - PATCH /admin/requests/{id}/approve (admin, pending only)
 * - PATCH /admin/requests/{id}/reject {rejection_reason} (admin, pending only)
 */
export async function listAllRequests() {
  const data = await api.get('/admin/requests');
  return (data || []).map(mapRequest);
}

export async function approveRequest(id) {
  const data = await api.patch(`/admin/requests/${id}/approve`, {});
  return mapRequest(data);
}

export async function rejectRequest(id, rejectionReason) {
  const data = await api.patch(`/admin/requests/${id}/reject`, { rejection_reason: rejectionReason });
  return mapRequest(data);
}
