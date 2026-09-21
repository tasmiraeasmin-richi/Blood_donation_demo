import { api } from './client';
import { mapDonor } from './mappers';

/**
 * Backend contract (main.py):
 * - GET /donors?blood_group&district -> DonorOut[] (active + eligible only,
 *   phone included when authenticated). No server pagination.
 *
 * Uses opportunistic auth (default auth: true): guests send no token and get
 * donor data without phone numbers; authenticated members send their JWT and
 * receive phone numbers. Backend uses optional auth, so guests never get 401.
 */
export async function listDonors({ blood_group, district } = {}) {
  const data = await api.get('/donors', { params: { blood_group, district } });
  return (data || []).map(mapDonor);
}
