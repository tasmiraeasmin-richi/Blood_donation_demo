import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mb-4">
        <FiAlertCircle className="w-7 h-7 text-[var(--color-danger)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)] max-w-md mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2">
          <FiRefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
