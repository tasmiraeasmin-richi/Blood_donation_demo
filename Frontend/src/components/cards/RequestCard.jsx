import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiUser, FiAlertTriangle } from 'react-icons/fi';
import BloodGroupBadge from '../ui/badges/BloodGroupBadge';
import UrgencyBadge from '../ui/badges/UrgencyBadge';
import StatusBadge from '../ui/badges/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function RequestCard({ request, href, className = '' }) {
  const isCritical = request.urgency === 'critical';

  return (
    <Link
      to={href || `/requests/${request.id}`}
      className={`card-rs p-5 hover:shadow-md transition-shadow block ${isCritical ? 'border-l-4 border-l-[var(--color-critical)]' : ''} ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <BloodGroupBadge bloodGroup={request.blood_group} size="md" />
          <div>
            <h3 className="font-semibold text-[var(--color-text)] text-sm leading-tight">
              {request.patient_name || 'Unknown Patient'}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {request.request_code || `#${request.id}`}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <UrgencyBadge urgency={request.urgency} />
          <StatusBadge status={request.status} />
        </div>
      </div>

      {isCritical && (
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-critical)] font-medium mb-2">
          <FiAlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span>Critical — immediate donation needed</span>
        </div>
      )}

      <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-1.5">
          <FiUser className="w-3 h-3 flex-shrink-0" />
          <span>{request.units} unit{request.units !== 1 ? 's' : ''} needed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiMapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{request.hospital || '—'}, {request.district || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar className="w-3 h-3 flex-shrink-0" />
          <span>Required by {formatDate(request.required_date)}</span>
        </div>
      </div>
    </Link>
  );
}
