import { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const SelectInput = forwardRef(function SelectInput(
  { label, error, required = false, placeholder, children, className = '', ...props },
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
      <div className="relative">
        <select
          ref={ref}
          className={`select select-bordered w-full appearance-none bg-white text-[var(--color-text)] pr-10
            ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]' : 'focus:border-[var(--color-primary)]'}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)] pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default SelectInput;
