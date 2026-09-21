import { forwardRef } from 'react';

const TextArea = forwardRef(function TextArea(
  { label, error, required = false, rows = 4, className = '', ...props },
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
      <textarea
        ref={ref}
        rows={rows}
        className={`textarea textarea-bordered w-full bg-white text-[var(--color-text)] resize-none
          ${error ? 'border-[var(--color-danger)] focus:border-[var(--color-danger)]' : 'focus:border-[var(--color-primary)]'}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-[var(--color-danger)] mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default TextArea;
