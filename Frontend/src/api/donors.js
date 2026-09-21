import { api } from './client';
import { mapDonor } from './mappers';

/**
 * Backend contract (main.py):
 * - GET /donors?blood_group&district -> DonorOut[] (active + eligible only,
 *   phone included when authenticated). No server pagination.
 */
export async function listDonors({ blood_group, district } = {}) {
  const data = await api.get('/donors', { auth: false, params: { blood_group, district } });
  return (data || []).map(mapDonor);
}
