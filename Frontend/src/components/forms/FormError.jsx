import { FiAlertCircle } from 'react-icons/fi';

export default function FormError({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-red-200 rounded-lg px-3 py-2">
      <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
