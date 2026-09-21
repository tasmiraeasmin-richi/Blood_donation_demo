import { api } from './client';

/**
 * Backend contract:
 * - GET /stats/me -> MemberStatsOut (auth)
 * - GET /admin/stats -> AdminStatsOut (admin)
 * Shapes are passed through untouched; pages read the documented fields.
 */
export async function getMemberStats() {
  return api.get('/stats/me');
}

export async function getAdminStats() {
  return api.get('/admin/stats');
}
