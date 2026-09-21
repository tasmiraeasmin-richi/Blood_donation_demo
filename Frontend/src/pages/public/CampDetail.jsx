import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft, FiMapPin, FiCalendar, FiUsers, FiClock,
  FiCheckCircle, FiInfo,
} from 'react-icons/fi';
import { getCamp } from '../../api/camps';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import { formatDate } from '../../utils/helpers';

export default function CampDetail() {
  const { id } = useParams();
  const [camp, setCamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCamp = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCamp(await getCamp(id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getCamp(id).then(
      data => { setCamp(data); setError(null); setLoading(false); },
      err => { setError(err); setLoading(false); }
    );
  }, [id]);

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <Link
            to="/camps"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Camps
          </Link>
        </div>
        <LoadingState message="Loading camp..." />
      </div>
    );
  }

  if (error || !camp) {
    const notFound = !error || error?.status === 404 || !camp;
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <Link
            to="/camps"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Camps
          </Link>
        </div>
        {!notFound && (
          <ErrorState
            title="Failed to load camp"
            message={error?.message}
            onRetry={loadCamp}
          />
        )}
        {notFound && (
        <div className="card-rs p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Camp Not Found</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            The blood camp you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/camps"
            className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Browse All Camps
          </Link>
        </div>
        )}
      </div>
    );
  }

  const isUpcoming = camp.status === 'upcoming';

  return (
    <div className="page-container py-10">
      {/* ── Back link ──────────────────────────────────────────── */}
      <div className="mb-6">
        <Link
          to="/camps"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Camps
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Main content ─────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ── Camp header card ────────────────────────────────── */}
          <div className={`card-rs p-6 ${isUpcoming ? 'border-l-4 border-l-[var(--color-info)] bg-[var(--color-info-bg)]' : 'border-l-4 border-l-[var(--color-surface-3)]'}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isUpcoming
                  ? 'bg-[var(--color-info)] text-white'
                  : 'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]'
              }`}>
                <FiCalendar className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">
                    {camp.title}
                  </h1>
                </div>
                <p className="text-sm text-[var(--color-text-muted)] mb-3">
                  Organized by <span className="font-medium text-[var(--color-text)]">{camp.organizer}</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={camp.status} />
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isUpcoming
                      ? 'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                      : 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]'
                  }`}>
                    {isUpcoming ? <FiClock className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
                    {isUpcoming ? 'Upcoming' : 'Completed'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Camp details ─────────────────────────────────────── */}
          <div className="card-rs p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">Camp Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Camp Title</p>
                <p className="text-sm text-[var(--color-text)] font-medium">{camp.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Organizer</p>
                <div className="flex items-center gap-1.5">
                  <FiUsers className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{camp.organizer}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Date</p>
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{formatDate(camp.date)}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">District</p>
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{camp.district}</span>
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Venue</p>
                <div className="flex items-center gap-1.5">
                  <FiMapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                  <span className="text-sm text-[var(--color-text)]">{camp.venue}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Status</p>
                <StatusBadge status={camp.status} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Indicator</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isUpcoming
                    ? 'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                    : 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)]'
                }`}>
                  {isUpcoming ? <FiClock className="w-3 h-3" /> : <FiCheckCircle className="w-3 h-3" />}
                  {isUpcoming ? 'Upcoming' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* ── Quick actions ───────────────────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Camp Actions</h3>
            <div className="space-y-2">
              {isUpcoming ? (
                <button className="btn bg-[var(--color-primary)] text-white border-0 w-full gap-2" disabled>
                  <FiCalendar className="w-4 h-4" />
                  Register for Camp
                </button>
              ) : (
                <div className="bg-[var(--color-surface-3)] rounded-lg p-4">
                  <p className="text-sm text-[var(--color-text-muted)]">
                    This camp has already been completed. Check for future events.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick info ──────────────────────────────────────── */}
          <div className="card-rs p-6">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Quick Info</h3>
            <div className="space-y-2 text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <FiInfo className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Walk-ins welcome at all camp locations</span>
              </div>
              <div className="flex items-center gap-2">
                <FiInfo className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Bring a valid photo ID</span>
              </div>
              <div className="flex items-center gap-2">
                <FiInfo className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Drink plenty of water before donating</span>
              </div>
              <div className="flex items-center gap-2">
                <FiInfo className="w-3.5 h-3.5 flex-shrink-0" />
                <span>No fasting required before donation</span>
              </div>
            </div>
          </div>

          {/* ── Back navigation ─────────────────────────────────── */}
          <div className="card-rs p-6">
            <Link
              to="/camps"
              className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] w-full gap-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Camps
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
