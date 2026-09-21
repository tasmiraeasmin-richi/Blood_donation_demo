import { Link } from 'react-router-dom';
import { FiDroplet, FiPhone, FiMail, FiMapPin, FiHeart } from 'react-icons/fi';

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/donors', label: 'Find Donors' },
  { to: '/requests', label: 'Blood Requests' },
  { to: '/camps', label: 'Blood Camps' },
];

const authLinks = [
  { to: '/login', label: 'Login' },
  { to: '/signup', label: 'Sign Up' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--color-text)] text-white/70 mt-auto">
      {/* Main footer content */}
      <div className="page-container py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        {/* Brand column */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white no-underline mb-3">
            <FiDroplet className="w-6 h-6 text-[var(--color-primary)]" />
            RaktoSetu
          </Link>
          <p className="text-sm leading-relaxed mb-4 max-w-xs">
            Connecting blood donors with patients in need. A trusted platform
            for emergency blood donation assistance across Bangladesh.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <FiHeart className="w-3 h-3 text-[var(--color-primary)]" />
            Built to save lives
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
          <ul className="space-y-2.5">
            {quickLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Account</h3>
          <ul className="space-y-2.5">
            {authLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-sm hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency & Contact */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-4">Emergency</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <FiPhone className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">16401</p>
                <p className="text-xs text-white/50">National Blood Bank Helpline</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiMail className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm">support@raktosetu.org</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FiMapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">
                For life-threatening emergencies, contact your nearest hospital blood bank directly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} RaktoSetu. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>Blood Donation &amp; Emergency Assistance Platform</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
