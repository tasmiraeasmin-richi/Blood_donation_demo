import { api } from './client';
import { mapUser } from './mappers';

/**
 * Backend contract (router/admin.py):
 * - GET /admin/users -> UserOut[] (admin)
 * - PATCH /admin/users/{id}/status {status: active|blocked} (admin; self-block -> 400)
 * - PATCH /admin/users/{id}/role {role: admin|member} (admin; self-demote -> 400)
 * - DELETE /admin/users/{id} -> 204 (admin; self-delete -> 400, has-records -> 409)
 */
export async function listUsers() {
  const data = await api.get('/admin/users');
  return (data || []).map(mapUser);
}

export async function setUserStatus(id, status) {
  const data = await api.patch(`/admin/users/${id}/status`, { status });
  return mapUser(data);
}

export async function setUserRole(id, role) {
  const data = await api.patch(`/admin/users/${id}/role`, { role });
  return mapUser(data);
}

export async function deleteUser(id) {
  await api.delete(`/admin/users/${id}`);
  return true;
}
