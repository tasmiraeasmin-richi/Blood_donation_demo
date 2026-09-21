import { FiFilter, FiX } from 'react-icons/fi';

export default function FilterPanel({ filters = [], values = {}, onChange, onReset, className = '' }) {
  const hasActiveFilters = Object.values(values).some(v => v && v !== '');

  return (
    <div className={`flex flex-wrap items-end gap-3 ${className}`}>
      <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-muted)]">
        <FiFilter className="w-4 h-4" />
        Filters
      </div>
      {filters.map(filter => (
        <div key={filter.name} className="flex flex-col gap-1">
          {filter.label && (
            <label className="text-xs font-medium text-[var(--color-text-muted)]">
              {filter.label}
            </label>
          )}
          <select
            value={values[filter.name] || ''}
            onChange={e => onChange?.(filter.name, e.target.value)}
            className="select select-bordered select-sm bg-white text-[var(--color-text)] min-w-[140px]"
          >
            <option value="">All</option>
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="btn btn-sm btn-ghost text-[var(--color-text-muted)] gap-1"
        >
          <FiX className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
