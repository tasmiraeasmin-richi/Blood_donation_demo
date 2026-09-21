import { FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const urgencyConfig = {
  critical: {
    label: 'Critical',
    className: 'badge-critical',
    Icon: FiAlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    className: 'badge-urgent',
    Icon: FiAlertCircle,
  },
  normal: {
    label: 'Normal',
    className: 'badge-normal',
    Icon: FiInfo,
  },
};

export default function UrgencyBadge({ urgency, showIcon = true, className = '' }) {
  const config = urgencyConfig[urgency] || urgencyConfig.normal;
  const { label, className: badgeClass, Icon } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass} ${className}`}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {label}
    </span>
  );
}
