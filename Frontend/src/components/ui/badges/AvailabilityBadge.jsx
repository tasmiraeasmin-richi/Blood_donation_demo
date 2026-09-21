import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function AvailabilityBadge({ available, className = '' }) {
  if (available) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-success-bg)] text-[var(--color-success)] border border-emerald-200 ${className}`}
      >
        <FiCheckCircle className="w-3 h-3" />
        Available
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200 ${className}`}
    >
      <FiXCircle className="w-3 h-3" />
      Unavailable
    </span>
  );
}
