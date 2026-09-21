import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText, FiGift, FiHeart, FiCheckCircle,
  FiPlusCircle, FiSearch, FiArrowRight, FiInfo,
  FiClock,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getMemberStats } from '../../api/stats';
import { listMyRequests } from '../../api/requests';
import { listMyOffers } from '../../api/offers';
import { listMyDonations } from '../../api/donations';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import AvailabilityBadge from '../../components/ui/badges/AvailabilityBadge';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import OutlineButton from '../../components/ui/buttons/OutlineButton';

const ITEMS_LIMIT = 3;

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [myDonations, setMyDonations] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, requestsData, offersData, donationsData] = await Promise.all([
        getMemberStats(),
        listMyRequests(),
        listMyOffers(),
        listMyDonations(),
      ]);
      setStats(statsData);
      setMyRequests(requestsData);
      setMyOffers(offersData);
      setMyDonations(donationsData);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadDashboard();
  }, []);

  const eligible = stats ? stats.eligibility.is_eligible_donor : false;

  const summaryCards = [
    {
      label: 'My Requests',
      value: stats ? stats.requests.total : null,
      icon: FiFileText,
      color: 'primary',
    },
    {
      label: 'My Offers',
      value: stats ? stats.offers.total : null,
      icon: FiGift,
      color: 'info',
    },
    {
      label: 'Donations',
      value: stats ? stats.donations.total : null,
      icon: FiHeart,
      color: 'danger',
    },
    {
      label: 'Donor Availability',
      value: stats ? (eligible ? 'Eligible' : 'Not Eligible') : null,
      icon: FiCheckCircle,
      color: eligible ? 'success' : 'warning',
    },
  ];

  const recentRequests = myRequests.slice(0, ITEMS_LIMIT);
  const recentOffers = myOffers.slice(0, ITEMS_LIMIT);
  const recentDonations = myDonations.slice(0, ITEMS_LIMIT);

  const lastDonationDate = user?.last_donation_date || null;
  const nextEligibleDate = lastDonationDate
    ? new Date(new Date(lastDonationDate).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('en-BD', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  const handleQuickAction = (path) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">Loading your dashboard...</p>
        </div>
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">Your dashboard overview.</p>
        </div>
        <ErrorState title="Failed to load dashboard" message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      {/* ── Welcome Section ──────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Welcome back, {user?.name || 'Member'}!
        </h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Here's your donation overview. Keep helping those in need — every donation saves lives.
        </p>
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        {summaryCards.map(card => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Content Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* ── Recent Requests ────────────────────────────────── */}
        <div className="card-rs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Requests</h2>
            <button
              onClick={() => handleQuickAction('/dashboard/requests')}
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View all <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <EmptyState
              title="No requests yet"
              message="Create your first blood request to get started."
              icon={FiFileText}
              action={
                <PrimaryButton size="sm" onClick={() => handleQuickAction('/dashboard/requests/create')}>
                  <FiPlusCircle className="w-4 h-4" />
                  Create Request
                </PrimaryButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentRequests.map(request => (
                <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <BloodGroupBadge bloodGroup={request.blood_group} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)]">{request.patient_name}</span>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {request.units} unit{request.units !== 1 ? 's' : ''} · {request.hospital} ·{' '}
                      {formatDate(request.required_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Offers ──────────────────────────────────── */}
        <div className="card-rs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Offers</h2>
            <button
              onClick={() => handleQuickAction('/dashboard/offers')}
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View all <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentOffers.length === 0 ? (
            <EmptyState
              title="No offers yet"
              message="Make offers on blood requests to help patients in need."
              icon={FiGift}
              action={
                <OutlineButton size="sm" onClick={() => handleQuickAction('/dashboard/requests')}>
                  <FiSearch className="w-4 h-4" />
                  Browse Requests
                </OutlineButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentOffers.map(offer => (
                <div key={offer.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <BloodGroupBadge bloodGroup={offer.blood_group} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)] font-mono">{offer.request_code}</span>
                      <StatusBadge status={offer.status} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {offer.units} unit{offer.units !== 1 ? 's' : ''} · {offer.hospital} ·{' '}
                      {formatDate(offer.required_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Donations ───────────────────────────────── */}
        <div className="card-rs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Donations</h2>
            <button
              onClick={() => handleQuickAction('/dashboard/donations')}
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View all <FiArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentDonations.length === 0 ? (
            <EmptyState
              title="No donations yet"
              message="Your donation history will appear here."
              icon={FiHeart}
            />
          ) : (
            <div className="space-y-3">
              {recentDonations.map(donation => (
                <div key={donation.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center flex-shrink-0">
                    <FiHeart className="w-4 h-4 text-[var(--color-danger)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)]">{donation.units} unit{donation.units !== 1 ? 's' : ''}</span>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">{donation.request_id ? `Request #${donation.request_id}` : 'Walk-in'}</span>
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {donation.hospital} · {formatDate(donation.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Eligibility / Availability ─────────────────────── */}
        <div className="card-rs p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--color-text)]">Donor Eligibility</h2>
            <AvailabilityBadge available={user?.is_available} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center flex-shrink-0">
                <BloodGroupBadge bloodGroup={user?.blood_group} size="lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">Your Blood Type</p>
                <p className="text-xs text-[var(--color-text-muted)]">{user?.district || '—'} · {user?.blood_group || '—'}</p>
              </div>
            </div>

            <div className="bg-[var(--color-surface-2)] rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FiCheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${eligible ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`} />
                <div>
                  <p className={`text-sm font-medium ${eligible ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                    {eligible ? 'You are eligible to donate' : 'You are temporarily unavailable'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {eligible
                      ? 'You can donate blood right now. Thank you for your willingness to help!'
                      : `Your last donation was on ${formatDate(lastDonationDate)}. You'll be eligible again on ${nextEligibleDate}.`
                    }
                  </p>
                </div>
              </div>

              {!eligible && (
                <div className="flex items-start gap-3">
                  <FiClock className="w-5 h-5 text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">Next Eligible Date</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{nextEligibleDate}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <FiInfo className="w-5 h-5 text-[var(--color-info)] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">Eligibility Rule</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Donors must wait 90 days between donations to ensure their health and safety.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleQuickAction('/dashboard/requests/create')}
              className="btn bg-[var(--color-primary)] text-white border-0 w-full gap-2"
            >
              <FiPlusCircle className="w-4 h-4" />
              Create Blood Request
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <div className="card-rs p-6 mb-8">
        <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleQuickAction('/dashboard/requests/create')}
            className="card-rs p-5 hover:shadow-md transition-shadow block text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-lt)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
              <FiPlusCircle className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Create Blood Request</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Submit a new blood request for patients in need</p>
          </button>

          <button
            onClick={() => handleQuickAction('/donors')}
            className="card-rs p-5 hover:shadow-md transition-shadow block text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--color-success)] group-hover:text-white transition-colors">
              <FiSearch className="w-6 h-6 text-[var(--color-success)] group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Find Donors</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Search for available donors by blood group or district</p>
          </button>

          <button
            onClick={() => handleQuickAction('/dashboard/offers')}
            className="card-rs p-5 hover:shadow-md transition-shadow block text-center group"
          >
            <div className="w-12 h-12 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center mx-auto mb-3 group-hover:bg-[var(--color-info)] group-hover:text-white transition-colors">
              <FiGift className="w-6 h-6 text-[var(--color-info)] group-hover:text-white" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">View My Offers</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Check the status of your blood donation offers</p>
          </button>
        </div>
      </div>
    </div>
  );
}


