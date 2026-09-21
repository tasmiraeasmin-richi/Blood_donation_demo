import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

/**
 * Reusable breadcrumb navigation.
 * Pass `items` array of { label, to } — or it auto-generates from the URL path.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'Dashboard', to: '/dashboard' },
 *     { label: 'My Requests' },
 *   ]} />
 */
export default function Breadcrumb({ items, className = '' }) {
  const location = useLocation();

  // Auto-generate from path if no items provided
  const crumbs = items || generateCrumbs(location.pathname);

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      <Link
        to="/"
        className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors p-1 rounded"
        aria-label="Home"
      >
        <FiHome className="w-4 h-4" />
      </Link>

      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            <FiChevronRight className="w-3.5 h-3.5 text-[var(--color-text-faint)]" />
            {crumb.to && !isLast ? (
              <Link
                to={crumb.to}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}
                aria-current={isLast ? 'page' : undefined}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

/** Auto-generate breadcrumb items from URL path segments */
function generateCrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [];
  let path = '';

  const labelMap = {
    admin: 'Admin',
    dashboard: 'Dashboard',
    requests: 'Blood Requests',
    offers: 'My Offers',
    donations: 'Donations',
    users: 'Users',
    camps: 'Blood Camps',
    profile: 'Profile',
    create: 'Create',
    edit: 'Edit',
  };

  segments.forEach((segment, idx) => {
    path += `/${segment}`;
    const isNumericId = /^\d+$/.test(segment);

    if (isNumericId) return;

    crumbs.push({
      label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      to: idx < segments.length - 1 ? path : undefined,
    });
  });

  return crumbs;
}
