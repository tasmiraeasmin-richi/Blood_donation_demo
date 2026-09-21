import { FiLoader } from 'react-icons/fi';

const variantMap = {
  primary: 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dk)] text-white border-0',
  secondary: 'bg-[var(--color-surface-3)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-surface-3)]',
  outline: 'btn-outline border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]',
  danger: 'bg-[var(--color-danger)] hover:bg-red-700 text-white border-0',
};

const sizeMap = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export default function LoadingButton({
  children,
  variant = 'primary',
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
      className={`btn ${variantMap[variant] || variantMap.primary}
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
