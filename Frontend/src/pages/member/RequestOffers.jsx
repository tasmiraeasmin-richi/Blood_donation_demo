import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiFileText, FiArrowLeft, FiCheckCircle, FiXCircle, FiInfo, FiPhone } from 'react-icons/fi';
import { getRequest } from '../../api/requests';
import { listRequestOffers, respondToOffer } from '../../api/offers';
import { useAuth } from '../../contexts/AuthContext';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import ConfirmationModal from '../../components/ui/modals/ConfirmationModal';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import { toast } from 'react-hot-toast';

export default function RequestOffers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMember } = useAuth();
  const [request, setRequest] = useState(null);
  const [requestOffers, setRequestOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestData, offersData] = await Promise.all([
        getRequest(id),
        listRequestOffers(id),
      ]);
      setRequest(requestData);
      setRequestOffers(offersData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const handleAction = async (offerId, type) => {
    setActionLoading(true);
    try {
      const status = type === 'accept' ? 'accepted' : 'declined';
      await respondToOffer(request.id, offerId, status);
      toast.success(`Offer ${status} successfully`);
      setActionTarget(null);
      setActionType(null);
      await loadOffers();
    } catch (err) {
      toast.error(err?.message || 'Failed to update offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmAction = (offerId, type) => {
    setActionTarget(offerId);
    setActionType(type);
  };

  const handleCloseActionModal = () => {
    setActionTarget(null);
    setActionType(null);
  };

  const handleConfirm = () => {
    if (actionTarget && actionType) {
      handleAction(actionTarget, actionType);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <button onClick={() => navigate('/dashboard/requests')} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to My Requests
          </button>
        </div>
        <LoadingState message="Loading offers..." />
      </div>
    );
  }

  if (error || !request) {
    const forbidden = error?.status === 403;
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <button onClick={() => navigate('/dashboard/requests')} className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">
            <FiArrowLeft className="w-4 h-4" /> Back to My Requests
          </button>
        </div>
        {forbidden ? (
          <EmptyState
            title="Owner Access Only"
            message="Only the request owner can view and manage its donation offers."
            icon={FiFileText}
          />
        ) : error && error?.status !== 404 ? (
          <ErrorState title="Failed to load offers" message={error?.message} onRetry={loadOffers} />
        ) : (
          <EmptyState title="Request Not Found" message="The blood request you're looking for doesn't exist." icon={FiFileText} />
        )}
      </div>
    );
  }

  const acceptedCount = requestOffers.filter(o => o.status === 'accepted').length;
  const offeredCount = requestOffers.filter(o => o.status === 'offered').length;
  const declinedCount = requestOffers.filter(o => o.status === 'declined').length;

  return (
    <div className="page-container py-10">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/requests')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to My Requests
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Request Offers</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          {request.request_code}: {request.patient_name} needs {request.units} unit{request.units !== 1 ? 's' : ''} of {request.blood_group} blood.
          {request.status === 'pending' && ' This request is awaiting donor offers.'}
          {request.status === 'approved' && ' This request has been approved and donors can offer.'}
          {request.status === 'fulfilled' && ' This request has been fulfilled.'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-rs p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-info)]">{offeredCount}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Offered</p>
        </div>
        <div className="card-rs p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-success)]">{acceptedCount}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Accepted</p>
        </div>
        <div className="card-rs p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-text-muted)]">{declinedCount}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Declined</p>
        </div>
      </div>

      {request.status !== 'pending' && request.status !== 'approved' && (
        <div className="card-rs p-4 mb-6 border-l-4 border-l-[var(--color-surface-3)] bg-[var(--color-surface-2)]">
          <div className="flex items-start gap-3">
            <FiInfo className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[var(--color-text-muted)]">
              Offer actions are only available for pending and approved requests. This request is currently <strong>{request.status}</strong>.
            </p>
          </div>
        </div>
      )}

      {requestOffers.length === 0 ? (
        <EmptyState
          title="No offers yet"
          message="No donors have offered blood for this request yet."
          icon={FiFileText}
        />
      ) : (
        <div className="space-y-3">
          {requestOffers.map(offer => {
            return (
              <div key={offer.id} className={`card-rs p-4 sm:p-5 ${offer.status === 'accepted' ? 'border-l-4 border-l-[var(--color-success)]' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BloodGroupBadge bloodGroup={offer.blood_group} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[var(--color-text)] text-sm">{offer.donor_name}</span>
                        <StatusBadge status={offer.status} />
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {offer.district}
                        {offer.phone && (
                          <span className="inline-flex items-center gap-1 ml-2 text-[var(--color-text)]">
                            <FiPhone className="w-3 h-3" /> {offer.phone}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isMember && request.status !== 'fulfilled' && offer.status !== 'accepted' && (
                      <>
                        {offer.status === 'offered' && (
                          <>
                            <button
                              onClick={() => handleConfirmAction(offer.id, 'accept')}
                              className="btn btn-sm bg-[var(--color-success)] text-white border-0 gap-2"
                            >
                              <FiCheckCircle className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleConfirmAction(offer.id, 'decline')}
                              className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] gap-2"
                            >
                              <FiXCircle className="w-4 h-4" />
                              Decline
                            </button>
                          </>
                        )}
                      </>
                    )}
                    {offer.status === 'accepted' && (
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-success)]">
                        <FiCheckCircle className="w-4 h-4" />
                        Accepted
                      </div>
                    )}
                  </div>
                </div>

                {offer.status === 'accepted' && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-surface-3)]">
                    <div className="bg-[var(--color-success-bg)] rounded-lg p-4">
                      <div className="flex items-center gap-2 text-[var(--color-success)] mb-2">
                        <FiCheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Offer Accepted</span>
                      </div>
                      <p className="text-sm text-[var(--color-text-muted)]">
                        {offer.phone
                          ? 'The donor contact number above is now visible to you as the request owner.'
                          : 'Contact information will be shared after the requester confirms the donation.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmationModal
        open={!!actionTarget}
        onClose={handleCloseActionModal}
        onConfirm={handleConfirm}
        title={actionType === 'accept' ? 'Accept Offer' : 'Decline Offer'}
        message={actionType === 'accept'
          ? 'Are you sure you want to accept this donation offer? The donor will be notified.'
          : 'Are you sure you want to decline this donation offer?'}
        confirmLabel={actionType === 'accept' ? 'Accept' : 'Decline'}
        cancelLabel="Cancel"
        variant={actionType === 'accept' ? 'success' : 'danger'}
        loading={actionLoading}
      />
    </div>
  );
}
