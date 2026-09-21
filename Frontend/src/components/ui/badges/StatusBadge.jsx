const statusStyles = {
  pending:
    'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-amber-200',
  approved:
    'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-emerald-200',
  rejected:
    'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-red-200',
  fulfilled:
    'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200',
  offered:
    'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-blue-200',
  accepted:
    'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-emerald-200',
  declined:
    'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200',
  upcoming:
    'bg-[var(--color-info-bg)] text-[var(--color-info)] border border-blue-200',
  completed:
    'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200',
  active:
    'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-emerald-200',
  blocked:
    'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-red-200',
};

export default function StatusBadge({ status, className = '' }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : '—';
  const style = statusStyles[status] || 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style} ${className}`}
    >
      {label}
    </span>
  );
}
