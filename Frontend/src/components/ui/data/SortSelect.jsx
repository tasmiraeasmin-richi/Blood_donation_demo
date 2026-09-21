import { FiArrowDown, FiArrowUp } from 'react-icons/fi';

export default function SortSelect({
  options = [],
  value = '',
  onChange,
  className = '',
}) {
  return (
    <select
      value={value}
      onChange={e => onChange?.(e.target.value)}
      className={`select select-bordered select-sm bg-white text-[var(--color-text)] ${className}`}
    >
      <option value="">Sort by</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function SortButton({ field, currentSort, onSort, className = '' }) {
  const isActive = currentSort?.field === field;
  const isAsc = isActive && currentSort?.order === 'asc';
  const isDesc = isActive && currentSort?.order === 'desc';

  return (
    <button
      onClick={() => {
        if (isAsc) onSort?.({ field, order: 'desc' });
        else onSort?.({ field, order: 'asc' });
      }}
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'
      } hover:text-[var(--color-primary)] ${className}`}
    >
      {isDesc ? (
        <FiArrowDown className="w-3 h-3" />
      ) : (
        <FiArrowUp className="w-3 h-3" />
      )}
    </button>
  );
}
