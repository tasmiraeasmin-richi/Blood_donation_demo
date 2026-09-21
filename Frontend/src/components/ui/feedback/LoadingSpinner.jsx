import { FiLoader } from 'react-icons/fi';

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FiLoader className={`animate-spin text-[var(--color-primary)] ${sizeMap[size] || sizeMap.md}`} />
    </div>
  );
}
