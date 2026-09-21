import { FiChevronLeft, FiChevronRight, FiMoreHorizontal } from 'react-icons/fi';

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push('...');

  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  if (total > 1) pages.push(total);

  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="btn btn-sm btn-ghost text-[var(--color-text-muted)] disabled:opacity-30"
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-[var(--color-text-muted)]">
            <FiMoreHorizontal className="w-4 h-4" />
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`btn btn-sm min-w-[2rem] ${
              page === currentPage
                ? 'bg-[var(--color-primary)] text-white border-0'
                : 'btn-ghost text-[var(--color-text-muted)]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="btn btn-sm btn-ghost text-[var(--color-text-muted)] disabled:opacity-30"
        aria-label="Next page"
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function PaginationInfo({ currentPage, totalPages, totalItems, className = '' }) {
  return (
    <p className={`text-sm text-[var(--color-text-muted)] ${className}`}>
      Page {currentPage} of {totalPages}
      {totalItems !== undefined && ` — ${totalItems} total`}
    </p>
  );
}
