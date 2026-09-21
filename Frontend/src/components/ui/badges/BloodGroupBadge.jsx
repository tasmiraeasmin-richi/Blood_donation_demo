export default function BloodGroupBadge({ bloodGroup, size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white font-bold ${sizeMap[size] || sizeMap.md} ${className}`}
      title={`Blood Group: ${bloodGroup}`}
    >
      {bloodGroup || '—'}
    </span>
  );
}
