import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiUser, FiEdit2, FiDroplet, FiLock, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile, changePassword } from '../../api/auth';
import { BLOOD_GROUPS, DISTRICTS, DONATION_ELIGIBILITY_DAYS } from '../../utils/constants';
import { formatDate, isDonorEligible } from '../../utils/helpers';
import FormInput from '../../components/forms/FormInput';
import SelectInput from '../../components/forms/SelectInput';
import PasswordInput from '../../components/forms/PasswordInput';
import FormError from '../../components/forms/FormError';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import AvailabilityBadge from '../../components/ui/badges/AvailabilityBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';

const PHONE_RE = /^\+?[\d\s-]{8,}$/;

function validateProfile(data) {
  const errs = {};
  if (!data.name.trim()) errs.name = 'Name is required';
  else if (data.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!data.phone.trim()) errs.phone = 'Phone number is required';
  else if (!PHONE_RE.test(data.phone.trim())) errs.phone = 'Enter a valid phone number';
  if (!data.blood_group) errs.blood_group = 'Blood group is required';
  else if (!BLOOD_GROUPS.includes(data.blood_group)) errs.blood_group = 'Select a valid blood group';
  if (!data.district) errs.district = 'District is required';
  else if (!DISTRICTS.includes(data.district)) errs.district = 'Select a valid district';
  return errs;
}

function validatePassword(data) {
  const errs = {};
  if (!data.currentPassword) errs.currentPassword = 'Current password is required';
  if (!data.newPassword) errs.newPassword = 'New password is required';
  else if (data.newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters';
  else if (!/[A-Z]/.test(data.newPassword)) errs.newPassword = 'Must contain an uppercase letter';
  else if (!/\d/.test(data.newPassword)) errs.newPassword = 'Must contain a number';
  if (data.newPassword !== data.confirmPassword) errs.confirmPassword = 'Passwords do not match';
  return errs;
}

export default function Profile() {
  const { user, refreshProfile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profileDraft, setProfileDraft] = useState({ name: '', phone: '', blood_group: '', district: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileFormError, setProfileFormError] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilitySaving, setAvailabilitySaving] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordFormError, setPasswordFormError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await refreshProfile();
      setProfileDraft({
        name: profile.name || '',
        phone: profile.phone || '',
        blood_group: profile.blood_group || '',
        district: profile.district || '',
      });
      setIsAvailable(!!profile.is_available);
    } catch (err) {
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProfile();
  }, []);

  const eligible = user?.is_eligible_donor ?? isDonorEligible(user?.last_donation_date);

  const handleProfileChange = (field, value) => {
    setProfileDraft(prev => ({ ...prev, [field]: value }));
    setProfileErrors(prev => ({ ...prev, [field]: '' }));
    setProfileFormError('');
    setProfileSuccess('');
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    const errs = validateProfile(profileDraft);
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setProfileSaving(true);
    setProfileFormError('');
    setProfileSuccess('');
    try {
      await updateProfile(profileDraft);
      await refreshProfile();
      setProfileSuccess('Profile updated successfully.');
      toast.success('Profile updated successfully');
    } catch (err) {
      setProfileFormError(err?.message || 'Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvailabilitySave = async () => {
    setAvailabilitySaving(true);
    setAvailabilityError('');
    setAvailabilitySuccess('');
    try {
      await updateProfile({ is_available: isAvailable });
      await refreshProfile();
      setAvailabilitySuccess(isAvailable ? 'You are now marked as available to donate.' : 'You are now marked as unavailable to donate.');
      toast.success('Donor availability updated');
    } catch (err) {
      setAvailabilityError(err?.message || 'Failed to update availability. Please try again.');
      toast.error('Failed to update availability');
    } finally {
      setAvailabilitySaving(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    setPasswordFormError('');
    setPasswordSuccess('');
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    const errs = validatePassword(passwordData);
    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPasswordSaving(true);
    setPasswordFormError('');
    setPasswordSuccess('');
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordSuccess('Password changed successfully.');
      toast.success('Password changed successfully');
    } catch (err) {
      setPasswordFormError(err?.message || 'Failed to change password. Please try again.');
      toast.error('Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-[var(--color-text-muted)]">Loading your profile...</p>
        </div>
        <LoadingState message="Loading profile..." />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-[var(--color-text-muted)]">View and manage your personal details.</p>
        </div>
        <ErrorState title="Failed to load profile" message={error || 'Profile not available.'} onRetry={loadProfile} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          View and manage your personal details, donor availability, and account password.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <section aria-labelledby="profile-info-heading" className="card-rs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-lt)] flex items-center justify-center">
                <FiUser className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h2 id="profile-info-heading" className="text-lg font-semibold text-[var(--color-text)]">Profile Information</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Your current account details</p>
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
          </section>

          <section aria-labelledby="availability-heading" className="card-rs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-success-bg)] flex items-center justify-center">
                <FiDroplet className="w-5 h-5 text-[var(--color-success)]" />
              </div>
              <div>
                <h2 id="availability-heading" className="text-lg font-semibold text-[var(--color-text)]">Donor Availability</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Control whether you appear in donor search</p>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 cursor-pointer rounded-lg border border-[var(--color-surface-3)] px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-[var(--color-text)]">Available to donate</span>
                <span className="block text-xs text-[var(--color-text-muted)]">Turn off if you need a break from donations</span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-md checked:bg-[var(--color-success)] checked:border-[var(--color-success)]"
                checked={isAvailable}
                onChange={e => {
                  setIsAvailable(e.target.checked);
                  setAvailabilityError('');
                  setAvailabilitySuccess('');
                }}
                aria-label="Available to donate blood"
              />
            </label>

            <div className="mt-4 rounded-lg bg-[var(--color-surface-2)] p-4 space-y-3">
              {eligible ? (
                <p className="text-[var(--color-text)]">
                  <FiCheckCircle className="inline w-4 h-4 text-[var(--color-success)] mr-1.5 -mt-0.5" />
                  You are currently <strong>eligible</strong> to donate. Donors become eligible again {DONATION_ELIGIBILITY_DAYS} days after their last donation.
                </p>
              ) : (
                <p className="text-[var(--color-text)]">
                  You are <strong>not yet eligible</strong> to donate. With a last donation date of {formatDate(user.last_donation_date)}, your next eligible date is{' '}
                  <strong>{formatDate(new Date(new Date(user.last_donation_date).getTime() + DONATION_ELIGIBILITY_DAYS * 24 * 60 * 60 * 1000)) || '—'}</strong> ({DONATION_ELIGIBILITY_DAYS} days after your last donation).
                </p>
              )}
              {!isAvailable && (
                <p className="mt-2 text-[var(--color-text-muted)]">
                  Note: while marked unavailable you will be hidden from donor search results even if medically eligible.
                </p>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <FormError message={availabilityError} />
              {availabilitySuccess && (
                <p role="status" className="text-sm text-[var(--color-success)] bg-[var(--color-success-bg)] border border-emerald-200 rounded-lg px-3 py-2">
                  {availabilitySuccess}
                </p>
              )}
              <PrimaryButton onClick={handleAvailabilitySave} loading={availabilitySaving}>
                Save Availability
              </PrimaryButton>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="edit-profile-heading" className="card-rs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-info-bg)] flex items-center justify-center">
                <FiEdit2 className="w-5 h-5 text-[var(--color-info)]" />
              </div>
              <div>
                <h2 id="edit-profile-heading" className="text-lg font-semibold text-[var(--color-text)]">Edit Profile</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Update your personal details</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  value={profileDraft.name}
                  onChange={e => handleProfileChange('name', e.target.value)}
                  error={profileErrors.name}
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                />
                <FormInput
                  label="Phone"
                  type="tel"
                  value={profileDraft.phone}
                  onChange={e => handleProfileChange('phone', e.target.value)}
                  error={profileErrors.phone}
                  required
                  autoComplete="tel"
                  placeholder="+8801XXXXXXXXX"
                />
                <SelectInput
                  label="Blood Group"
                  value={profileDraft.blood_group}
                  onChange={e => handleProfileChange('blood_group', e.target.value)}
                  error={profileErrors.blood_group}
                  required
                  placeholder="Select blood group"
                >
                  {BLOOD_GROUPS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </SelectInput>
                <SelectInput
                  label="District"
                  value={profileDraft.district}
                  onChange={e => handleProfileChange('district', e.target.value)}
                  error={profileErrors.district}
                  required
                  placeholder="Select district"
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </SelectInput>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Email address and last donation date cannot be changed here. Your donation history updates automatically when donations are recorded.
              </p>

              <FormError message={profileFormError} />
              {profileSuccess && (
                <p role="status" className="text-sm text-[var(--color-success)] bg-[var(--color-success-bg)] border border-emerald-200 rounded-lg px-3 py-2">
                  {profileSuccess}
                </p>
              )}
              <PrimaryButton type="submit" loading={profileSaving}>
                Save Changes
              </PrimaryButton>
            </form>
          </section>

          <section aria-labelledby="change-password-heading" className="card-rs p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-warning-bg)] flex items-center justify-center">
                <FiLock className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <div>
                <h2 id="change-password-heading" className="text-lg font-semibold text-[var(--color-text)]">Change Password</h2>
                <p className="text-sm text-[var(--color-text-muted)]">Use at least 6 characters with 1 uppercase letter and 1 number</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4" noValidate>
              <PasswordInput
                label="Current Password"
                value={passwordData.currentPassword}
                onChange={e => handlePasswordChange('currentPassword', e.target.value)}
                error={passwordErrors.currentPassword}
                required
                autoComplete="current-password"
                placeholder="Enter current password"
              />
              <PasswordInput
                label="New Password"
                value={passwordData.newPassword}
                onChange={e => handlePasswordChange('newPassword', e.target.value)}
                error={passwordErrors.newPassword}
                required
                autoComplete="new-password"
                placeholder="Min 6 chars, 1 uppercase, 1 number"
              />
              <PasswordInput
                label="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={e => handlePasswordChange('confirmPassword', e.target.value)}
                error={passwordErrors.confirmPassword}
                required
                autoComplete="new-password"
                placeholder="Re-enter new password"
              />

              <FormError message={passwordFormError} />
              {passwordSuccess && (
                <p role="status" className="text-sm text-[var(--color-success)] bg-[var(--color-success-bg)] border border-emerald-200 rounded-lg px-3 py-2">
                  {passwordSuccess}
                </p>
              )}
              <PrimaryButton type="submit" loading={passwordSaving}>
                Change Password
              </PrimaryButton>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
