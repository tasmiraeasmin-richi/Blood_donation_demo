import { FiAlertTriangle } from 'react-icons/fi';
import Modal from './Modal';
import DangerButton from '../buttons/DangerButton';
import SecondaryButton from '../buttons/SecondaryButton';

const variantConfig = {
  danger: {
    iconClass: 'text-[var(--color-danger)]',
    bgClass: 'bg-[var(--color-danger-bg)]',
  },
  warning: {
    iconClass: 'text-[var(--color-warning)]',
    bgClass: 'bg-[var(--color-warning-bg)]',
  },
  info: {
    iconClass: 'text-[var(--color-info)]',
    bgClass: 'bg-[var(--color-info-bg)]',
  },
};

export default function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const config = variantConfig[variant] || variantConfig.danger;

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-full ${config.bgClass} flex items-center justify-center mb-4`}>
          <FiAlertTriangle className={`w-6 h-6 ${config.iconClass}`} />
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 max-w-xs">{message}</p>
        <div className="flex gap-3 w-full">
          <SecondaryButton onClick={onClose} fullWidth disabled={loading}>
            {cancelLabel}
          </SecondaryButton>
          <DangerButton onClick={onConfirm} fullWidth loading={loading}>
            {confirmLabel}
          </DangerButton>
        </div>
      </div>
    </Modal>
  );
}
