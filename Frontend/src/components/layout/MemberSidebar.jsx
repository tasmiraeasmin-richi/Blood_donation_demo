import { NavLink, Link } from 'react-router-dom';
import {
  FiDroplet, FiHome, FiFileText, FiPlusCircle,
  FiGift, FiHeart, FiUser, FiLogOut, FiX
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome, end: true },
  { to: '/dashboard/requests', label: 'My Requests', icon: FiFileText },
  { to: '/dashboard/requests/create', label: 'Create Request', icon: FiPlusCircle },
  { to: '/dashboard/offers', label: 'My Offers', icon: FiGift },
  { to: '/dashboard/donations', label: 'Donations', icon: FiHeart },
  { to: '/profile', label: 'Profile', icon: FiUser },
];

export default function MemberSidebar({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full bg-white border-r border-[var(--color-surface-3)] flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-surface-3)]">
        <Link to="/" className="flex items-center gap-2 font-bold text-[var(--color-primary)] no-underline">
          <FiDroplet className="w-5 h-5" />
          RaktoSetu
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] lg:hidden"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-[var(--color-surface-3)]">
        <div className="text-xs text-[var(--color-text-muted)] mb-0.5">Logged in as</div>
        <div className="font-semibold text-sm text-[var(--color-text)] truncate">{user?.name || 'Member'}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Member navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary-lt)] text-[var(--color-primary)]'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[var(--color-surface-3)]">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)] transition-colors w-full text-left"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
