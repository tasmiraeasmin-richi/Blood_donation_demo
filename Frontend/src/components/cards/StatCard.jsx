export default function StatCard({ label, value, icon: Icon, color = 'primary', className = '' }) {
  const colorMap = {
    primary: {
      bg: 'bg-[var(--color-primary-lt)]',
      icon: 'text-[var(--color-primary)]',
      value: 'text-[var(--color-primary)]',
    },
    success: {
      bg: 'bg-[var(--color-success-bg)]',
      icon: 'text-[var(--color-success)]',
      value: 'text-[var(--color-success)]',
    },
    warning: {
      bg: 'bg-[var(--color-warning-bg)]',
      icon: 'text-[var(--color-warning)]',
      value: 'text-[var(--color-warning)]',
    },
    danger: {
      bg: 'bg-[var(--color-danger-bg)]',
      icon: 'text-[var(--color-danger)]',
      value: 'text-[var(--color-danger)]',
    },
    info: {
      bg: 'bg-[var(--color-info-bg)]',
      icon: 'text-[var(--color-info)]',
      value: 'text-[var(--color-info)]',
    },
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`card-rs p-5 flex items-center gap-4 ${className}`}>
      {Icon && (
        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${c.icon}`} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm text-[var(--color-text-muted)] truncate">{label}</p>
        <p className={`text-2xl font-bold ${c.value}`}>{value ?? '—'}</p>
      </div>
    </div>
  );
}
