import { FiLoader } from 'react-icons/fi';

const sizeMap = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export default function SecondaryButton({
  children,
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-surface-3)]
        ${sizeMap[size] || ''}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''}
        ${className}`}
      {...props}
    >
      {loading && <FiLoader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}
