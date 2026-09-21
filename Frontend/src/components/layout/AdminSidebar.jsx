import { NavLink, Link } from 'react-router-dom';
import {
  FiDroplet, FiGrid, FiFileText, FiUsers,
  FiHeart, FiCalendar, FiLogOut, FiX
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/requests', label: 'Requests', icon: FiFileText },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
  { to: '/admin/donations', label: 'Donations', icon: FiHeart },
  { to: '/admin/camps', label: 'Blood Camps', icon: FiCalendar },
];

export default function AdminSidebar({ onClose }) {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 h-full bg-[var(--color-text)] flex flex-col">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 font-bold text-white no-underline">
          <FiDroplet className="w-5 h-5 text-[var(--color-primary)]" />
          RaktoSetu
          <span className="ml-auto text-[10px] font-normal bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">
            ADMIN
          </span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/60 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-white/10">
        <div className="text-xs text-white/40 mb-0.5">Administrator</div>
        <div className="font-semibold text-sm text-white truncate">{user?.name || 'Admin'}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
