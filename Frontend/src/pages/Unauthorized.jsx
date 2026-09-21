import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export default function Unauthorized() {
  const { isAuthenticated, isAdmin } = useAuth();

  const homeTarget = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--color-warning-bg)] flex items-center justify-center mx-auto mb-6">
          <FiAlertTriangle className="w-10 h-10 text-[var(--color-warning)]" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Access Denied</h1>
        <p className="text-[var(--color-text-muted)] mb-8 leading-relaxed">
          You don't have permission to access this page. If you believe this
          is an error, please contact an administrator.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? homeTarget : '/'}
            className="flex items-center gap-2 btn bg-[var(--color-primary)] hover:bg-[var(--color-primary-dk)] text-white border-0"
          >
            <FiHome className="w-4 h-4" />
            {isAuthenticated ? 'Back to Dashboard' : 'Go Home'}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 btn btn-outline border-[var(--color-surface-3)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)]"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
