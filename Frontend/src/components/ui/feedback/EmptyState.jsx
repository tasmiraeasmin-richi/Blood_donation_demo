import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  title = 'No data found',
  message = 'There are no records to display at this time.',
  icon: Icon = FiInbox,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-4">{message}</p>
      {action}
    </div>
  );
}
