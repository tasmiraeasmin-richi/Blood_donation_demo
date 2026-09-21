import { forwardRef } from 'react';

const DateInput = forwardRef(function DateInput(
  { label, error, required = false, className = '', ...props },
  ref
) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)]">
          {label}
          {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type="date"
        className={`input input-bordered w-full bg-white text-[var(--color-text)]
          ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]' : 'focus:border-[var(--color-primary)]'}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default DateInput;
