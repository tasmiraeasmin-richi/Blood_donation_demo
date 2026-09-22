import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiCheckCircle, FiDroplet, FiPauseCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../api/auth';
import { DONATION_ELIGIBILITY_DAYS } from '../../utils/constants';
import { formatDate, isDonorEligible } from '../../utils/helpers';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import AvailabilityBadge from '../../components/ui/badges/AvailabilityBadge';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import SecondaryButton from '../../components/ui/buttons/SecondaryButton';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import FormError from '../../components/forms/FormError';
import { toast } from 'react-hot-toast';

/**
 * Member "Become a Donor" page.
 *
 * NOT a re-registration form: signup already captured name/phone/
 * blood_group/district. This page shows the member's existing
 * donor information (read-only) and lets them confirm availability
 * via the existing PUT /edituser {is_available} mechanism.
 */
export default function BecomeDonor() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await refreshProfile();
    } catch (err) {
      setError(err?.message || 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const medicallyEligible = isDonorEligible(user?.last_donation_date);
  const available = !!user?.is_available;

  const handleSetAvailability = async (nextValue) => {
    setSaving(true);
    setFormError('');
    try {
      await updateProfile({ is_available: nextValue });
      await refreshProfile();
      if (nextValue) {
        toast.success('You are now registered as an available donor!');
        navigate('/donors', { replace: true });
      } else {
        toast.success('Donor availability turned off.');
      }
    } catch (err) {
      setFormError(err?.message || 'Failed to update availability. Please try again.');
      toast.error('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Donor</h1>
          <p className="text-[var(--color-text-muted)]">Loading your donor information...</p>
        </div>
        <LoadingState message="Loading your profile..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Become a Donor</h1>
          <p className="text-[var(--color-text-muted)]">Join the donor community.</p>
        </div>
        <ErrorState title="Failed to load profile" message={error || 'Profile not available.'} onRetry={loadProfile} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Become a Donor</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Your donor details from signup are shown below. Confirm your availability — no need to enter them again.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Existing donor information (read-only) */}
        <section aria-labelledby="donor-info-heading" className="card-rs p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-lt)] flex items-center justify-center">
              <FiDroplet className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 id="donor-info-heading" className="text-lg font-semibold text-[var(--color-text)]">Your Donor Information</h2>
              <p className="text-sm text-[var(--color-text-muted)]">From your account — read-only</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-5">
            <BloodGroupBadge bloodGroup={user.blood_group} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-[var(--color-text)] truncate">{user.name}</p>
              <p className="text-sm text-[var(--color-text-muted)] truncate">{user.email}</p>
              <div className="mt-1">
                <AvailabilityBadge available={user.is_available} />
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Phone</dt>
              <dd className="text-[var(--color-text)] mt-0.5">{user.phone || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Blood Group</dt>
              <dd className="text-[var(--color-text)] mt-0.5">{user.blood_group || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">District</dt>
              <dd className="text-[var(--color-text)] mt-0.5">{user.district || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Last Donation</dt>
              <dd className="text-[var(--color-text)] mt-0.5">{formatDate(user.last_donation_date)}</dd>
            </div>
          </dl>

          <p className="text-xs text-[var(--color-text-muted)] mt-4">
            Need to correct these details?{' '}
            <Link to="/profile" className="text-[var(--color-primary)] font-medium hover:underline">
              Edit them in your profile
            </Link>
            .
          </p>
        </section>

        {/* Availability action */}
        <section aria-labelledby="availability-action-heading" className="card-rs p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center">
              <FiUserPlus className="w-5 h-5 text-[var(--color-success)]" />
            </div>
            <div>
              <h2 id="availability-action-heading" className="text-lg font-semibold text-[var(--color-text)]">Donor Availability</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Control whether you appear in donor search</p>
            </div>
          </div>

          {available ? (
            <div className="bg-[var(--color-success-bg)] border border-emerald-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-[var(--color-success)] mb-1">
                <FiCheckCircle className="w-5 h-5" />
                <span className="font-semibold">You&apos;re already registered as an available donor.</span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">
                {medicallyEligible
                  ? `You are currently eligible to donate (${DONATION_ELIGIBILITY_DAYS}-day rule satisfied).`
                  : `Your last donation was ${formatDate(user.last_donation_date)} — you become medically eligible again ${DONATION_ELIGIBILITY_DAYS} days after that date.`}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--color-surface-2)] rounded-lg p-4 mb-4">
              <p className="text-sm text-[var(--color-text)]">
                Confirm below to become available as a donor. You&apos;ll appear in donor search results
                {medicallyEligible ? ' right away.' : ' once medically eligible.'}
              </p>
              {!medicallyEligible && (
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  Note: your last donation was {formatDate(user.last_donation_date)}. The 90-day eligibility
                  rule is still enforced when offering blood.
                </p>
              )}
            </div>
          )}

          <FormError message={formError} />

          <div className="flex flex-col sm:flex-row gap-3">
            {available ? (
              <>
                <SecondaryButton
                  onClick={() => handleSetAvailability(false)}
                  loading={saving}
                  className="gap-2"
                >
                  <FiPauseCircle className="w-4 h-4" />
                  Turn Off Availability
                </SecondaryButton>
                <Link
                  to="/donors"
                  className="btn bg-[var(--color-primary)] hover:bg-[var(--color-primary-dk)] text-white border-0 gap-2"
                >
                  View Donors
                </Link>
              </>
            ) : (
              <PrimaryButton
                onClick={() => handleSetAvailability(true)}
                loading={saving}
                className="gap-2"
              >
                <FiUserPlus className="w-4 h-4" />
                Confirm — Become a Donor
              </PrimaryButton>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
