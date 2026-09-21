import { FiMapPin, FiPhone } from 'react-icons/fi';
import BloodGroupBadge from '../ui/badges/BloodGroupBadge';
import AvailabilityBadge from '../ui/badges/AvailabilityBadge';
import { isDonorEligible } from '../../utils/helpers';

export default function DonorCard({ donor, showPhone = false, className = '' }) {
  const eligible = isDonorEligible(donor.last_donation_date);

  return (
    <div className={`card-rs p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <BloodGroupBadge bloodGroup={donor.blood_group} size="md" />
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm leading-tight">
              {donor.name || 'Unknown Donor'}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <FiMapPin className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">{donor.district || '—'}</span>
            </div>
          </div>
        </div>
        <AvailabilityBadge available={donor.is_available} />
      </div>

      <div className="space-y-1.5">
        {!eligible && (
          <p className="text-xs text-[var(--color-warning)]">
            Eligible after 90-day donation gap
          </p>
        )}
        {showPhone && donor.phone && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <FiPhone className="w-3 h-3" />
            <span>{donor.phone}</span>
          </div>
        )}
        {!showPhone && (
          <p className="text-xs text-[var(--color-text-faint)] italic">
            Phone visible after offer acceptance
          </p>
        )}
      </div>
    </div>
  );
}
