import { api } from './client';
import { mapMyOffer, mapOfferDetail } from './mappers';

/**
 * Backend contract (main.py):
 * - GET /offers/my -> MyOfferOut[] (auth)
 * - POST /requests/{id}/offers (auth, approved requests, not own, eligible donor)
 * - GET /requests/{id}/offers -> OfferDetailOut[] (auth, owner only)
 * - PATCH /requests/{id}/offers/{offer_id} {status: accepted|declined} (auth, owner)
 */
export async function listMyOffers() {
  const data = await api.get('/offers/my');
  return (data || []).map(mapMyOffer);
}

export async function createOffer(requestId) {
  const data = await api.post(`/requests/${requestId}/offers`, {});
  return data;
}

export async function listRequestOffers(requestId) {
  const data = await api.get(`/requests/${requestId}/offers`);
  return (data || []).map(mapOfferDetail);
}

export async function respondToOffer(requestId, offerId, status) {
  const data = await api.patch(`/requests/${requestId}/offers/${offerId}`, { status });
  return mapOfferDetail(data);
}
