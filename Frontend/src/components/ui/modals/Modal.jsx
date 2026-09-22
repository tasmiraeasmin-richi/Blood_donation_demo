import { useEffect, useRef, useCallback } from 'react';
import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, title, children, size = 'md', className = '' }) {
  const dialogRef = useRef(null);

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className={`relative box-border w-full min-w-0 ${sizeMap[size] || sizeMap.md} bg-[var(--color-surface)] rounded-xl shadow-[var(--shadow-modal)] max-h-[90vh] flex flex-col overflow-x-hidden ${className}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-[var(--color-surface-3)]">
            <h2 id="modal-title" className="flex-1 min-w-0 text-lg font-semibold text-[var(--color-text)] break-words">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text)]"
              aria-label="Close"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="min-w-0 px-4 py-3 sm:px-6 sm:py-4 overflow-x-hidden overflow-y-auto flex-1 break-words">{children}</div>
      </div>
    </div>
  );
}
