import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiUser, FiPhone,
  FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiXCircle,
  FiFileText, FiClock, FiHeart, FiSend, FiEye, FiEdit2,
} from 'react-icons/fi';
import { getRequest, fulfillRequest } from '../../api/requests';
import { createOffer } from '../../api/offers';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import UrgencyBadge from '../../components/ui/badges/UrgencyBadge';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import ConfirmationModal from '../../components/ui/modals/ConfirmationModal';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const urgencyStyles = {
  critical: 'border-l-4 border-l-[var(--color-critical)] bg-[var(--color-danger-bg)]',
  urgent: 'border-l-4 border-l-[var(--color-urgent)] bg-[var(--color-warning-bg)]',
  normal: 'border-l-4 border-l-[var(--color-normal)] bg-[var(--color-success-bg)]',
};

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isMember, user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offering, setOffering] = useState(false);
  const [offered, setOffered] = useState(false);
  const [confirmingOffer, setConfirmingOffer] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequest(await getRequest(id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const isOwner = isAuthenticated && user?.id != null && request?.requester_id === user.id;

  const handleOffer = async () => {
    setOffering(true);
    try {
      await createOffer(request.id);
      setOffered(true);
      setConfirmingOffer(false);
      toast.success('Blood Donation Offer submitted');
    } catch (err) {
      toast.error(err?.message || 'Failed to submit offer');
    } finally {
      setOffering(false);
    }
  };

  const handleFulfill = async () => {
    setFulfilling(true);
    try {
      const updated = await fulfillRequest(request.id);
      setRequest(updated);
      toast.success('Request marked as fulfilled');
    } catch (err) {
      toast.error(err?.message || 'Failed to fulfill request');
    } finally {
      setFulfilling(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>
        </div>
        <LoadingState message="Loading request..." />
      </div>
    );
  }

  if (error || !request) {
    const notFound = !error || error?.status === 404 || !request;
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <Link
            to="/requests"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Requests
          </Link>
        </div>
        {notFound ? (
          <div className="card-rs p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mx-auto mb-4">
              <FiFileText className="w-8 h-8 text-[var(--color-text-muted)]" />
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Request Not Found</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              The blood request you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/requests"
              className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Browse All Requests
            </Link>
          </div>
        ) : (
          <ErrorState
            title="Failed to load request"
            message={error?.message}
            onRetry={loadRequest}
          />
        )}
      </div>
    );
  }

  const isCritical = request.urgency === 'critical';

  return (
    <div className="page-container py-10">
      {/* ── Back link ──────────────────────────────────────────── */}
      <div className="mb-6">
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Request header card ─────────────────────────────── */}
          <div className={`card-rs p-6 ${urgencyStyles[request.urgency] || ''}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <BloodGroupBadge bloodGroup={request.blood_group} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    {request.patient_name}
                  </h1>
                  {isCritical && (
                    <FiAlertTriangle className="w-5 h-5 text-[var(--color-critical)] animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  Request Code: <span className="font-mono font-medium text-[var(--color-text)]">{request.request_code}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <UrgencyBadge urgency={request.urgency} />
                  <StatusBadge status={request.status} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Request details ─────────────────────────────────── */}
          <div className="card-rs p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Request Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Patient Name</p>
                <p className="text-sm text-[var(--color-text)]">{request.patient_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Blood Group</p>
                <div className="flex items-center gap-2">
                  <BloodGroupBadge bloodGroup={request.blood_group} size="sm" />
                  <span className="text-sm text-[var(--color-text)] font-medium">{request.blood_group}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Units Needed</p>
                <p className="text-sm text-[var(--color-text)]">
                  {request.units} unit{request.units !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Required Date</p>
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{formatDate(request.required_date)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Hospital</p>
                <p className="text-sm text-[var(--color-text)]">{request.hospital}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">District</p>
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{request.district}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Requested By</p>
                <div className="flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">
                    {isOwner ? 'You' : `Requester #${request.requester_id}`}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Urgency</p>
                <UrgencyBadge urgency={request.urgency} />
              </div>
            </div>
          </div>

          {/* ── Rejection reason (if rejected) ──────────────────── */}
          {request.status === 'rejected' && request.rejection_reason && (
            <div className="card-rs p-6 border-l-4 border-l-[var(--color-danger)] bg-[var(--color-danger-bg)]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-danger)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FiXCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-danger)] mb-1">Request Rejected</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{request.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Contact information ─────────────────────────────── */}
          <div className="card-rs p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Contact Information</h2>
            {isAuthenticated && (isMember || user?.role === 'admin') ? (
              request.contact_phone ? (
                <div className="bg-[var(--color-info-bg)] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[var(--color-info)] mb-2">
                    <FiPhone className="w-4 h-4" />
                    <span className="text-sm font-medium">Requester Phone</span>
                  </div>
                  <a
                    href={`tel:${request.contact_phone}`}
                    className="btn btn-sm bg-[var(--color-success)] text-white border-0 gap-2"
                  >
                    <FiPhone className="w-4 h-4" />
                    Call Requester: {request.contact_phone}
                  </a>
                  <p className="text-xs text-[var(--color-text-muted)] mt-2">
                    Visible only to logged-in members. Please be respectful when calling.
                  </p>
                </div>
              ) : (
                <div className="bg-[var(--color-surface-3)] rounded-lg p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    Contact information is not available for this request.
                  </p>
                </div>
              )
            ) : (
              <div className="bg-[var(--color-surface-3)] rounded-lg p-4">
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  Log in to view the requester&apos;s contact number.
                </p>
                <Link
                  to="/login"
                  state={{ from: location }}
                  className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] gap-2"
                >
                  <FiPhone className="w-4 h-4" />
                  Login to Contact Requester
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* ── Donate / Offer button ───────────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Help This Patient</h3>
            {isAuthenticated && isMember && !isOwner ? (
              offered ? (
                <div className="bg-[var(--color-success-bg)] rounded-lg p-4">
                  <div className="flex items-center gap-2 text-[var(--color-success)]">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Offer submitted</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    The requester will review your offer.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingOffer(true)}
                  disabled={offering || request.status !== 'approved'}
                  className="btn bg-[var(--color-primary)] text-white border-0 w-full gap-2 disabled:opacity-60"
                >
                  {offering ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FiHeart className="w-4 h-4" />
                  )}
                  Offer Blood
                </button>
              )
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-[var(--color-text-muted)]">
                  {isAuthenticated
                    ? 'Only members can offer to donate blood.'
                    : 'Log in as a member to offer a blood donation.'}
                </p>
                <Link
                  to="/login"
                  state={isAuthenticated ? undefined : { from: location }}
                  className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] w-full gap-2"
                >
                  <FiHeart className="w-4 h-4" />
                  Log in to Donate
                </Link>
              </div>
            )}
          </div>

          <ConfirmationModal
            open={confirmingOffer}
            onClose={() => setConfirmingOffer(false)}
            onConfirm={handleOffer}
            title="Offer Blood"
            message={`Confirm your blood donation offer for ${request.patient_name} (${request.blood_group}) at ${request.hospital}?`}
            confirmLabel="Confirm Offer"
            variant="info"
            loading={offering}
          />

          {/* ── Owner actions ───────────────────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Request Actions</h3>
            <div className="space-y-2">
              {isOwner ? (
                <>
                  <button
                    onClick={() => navigate(`/dashboard/requests/${request.id}/offers`)}
                    className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] w-full gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    View Offers
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/requests/${request.id}/edit`)}
                    disabled={request.status !== 'pending'}
                    className="btn btn-sm btn-outline border-[var(--color-surface-3)] text-[var(--color-text-muted)] w-full gap-2 disabled:opacity-60"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit Request
                  </button>
                  <button
                    onClick={handleFulfill}
                    disabled={request.status !== 'approved' || fulfilling}
                    className="btn btn-sm bg-[var(--color-success)] text-white border-0 w-full gap-2 disabled:opacity-60"
                  >
                    {fulfilling ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiCheckCircle className="w-4 h-4" />
                    )}
                    Fulfill Request
                  </button>
                </>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">
                  {!isAuthenticated
                    ? 'Log in to manage this request.'
                    : 'Only the request owner can manage this request.'}
                </p>
              )}
            </div>
          </div>

          {/* ── Status timeline placeholder ─────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Status Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-success)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)]">Request Created</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Submitted by the requester</p>
                </div>
              </div>
              {request.status === 'approved' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-success)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">Approved</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Verified by admin</p>
                  </div>
                </div>
              )}
              {request.status === 'rejected' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-danger)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">Rejected</p>
                    <p className="text-xs text-[var(--color-text-muted)]">See rejection reason above</p>
                  </div>
                </div>
              )}
              {request.status === 'fulfilled' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-success)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">Fulfilled</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Donation completed</p>
                  </div>
                </div>
              )}
              {request.status === 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[var(--color-warning)] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text)]">Pending Approval</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Awaiting admin review</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 opacity-40">
                <div className="w-2 h-2 rounded-full bg-[var(--color-surface-3)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)]">Donation Offer</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Waiting for donors</p>
                </div>
              </div>
              <div className="flex items-start gap-3 opacity-40">
                <div className="w-2 h-2 rounded-full bg-[var(--color-surface-3)] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[var(--color-text)]">Fulfillment</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Pending donation</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Quick info ──────────────────────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Quick Info</h3>
            <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Only approved requests are shown publicly</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Contact info shared after offer acceptance</span>
              </div>
              <div className="flex items-center gap-2">
                <FiSend className="w-3.5 h-3.5 flex-shrink-0" />
                <span>One offer per donor per request</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
