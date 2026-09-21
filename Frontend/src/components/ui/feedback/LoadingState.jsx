import LoadingSpinner from './LoadingSpinner';

export default function LoadingState({ message = 'Loading...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
