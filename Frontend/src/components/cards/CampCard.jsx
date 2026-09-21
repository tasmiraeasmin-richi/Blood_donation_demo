import { Link } from 'react-router-dom';
import { FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import StatusBadge from '../ui/badges/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function CampCard({ camp, href, className = '' }) {
  return (
    <Link
      to={href || `/camps/${camp.id}`}
      className={`card-rs p-5 hover:shadow-md transition-shadow block ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold text-[var(--color-text)] text-sm leading-tight line-clamp-2">
          {camp.title || 'Blood Camp'}
        </h3>
        <StatusBadge status={camp.status} />
      </div>

      <div className="space-y-1.5 text-xs text-[var(--color-text-muted)]">
        {camp.organizer && (
          <div className="flex items-center gap-1.5">
            <FiUsers className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{camp.organizer}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <FiMapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{camp.venue || '—'}, {camp.district || '—'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar className="w-3 h-3 flex-shrink-0" />
          <span>{formatDate(camp.date)}</span>
        </div>
      </div>
    </Link>
  );
}
