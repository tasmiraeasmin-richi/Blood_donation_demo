import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/ui/feedback/LoadingSpinner';

/**
 * Shows a loading spinner while auth state is being resolved.
 * Once resolved, renders children or redirects appropriately.
 */
function AuthLoadingGuard({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return children;
}

/**
 * Requires authentication.
 * Redirects to /login with return-path state if not authenticated.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Don't redirect while still loading — wait for auth resolution
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Requires specific role(s).
 * Redirects to /unauthorized if authenticated but wrong role.
 * Redirects to /login if not authenticated.
 *
 * Usage:
 *   <RoleBasedRoute roles={['admin']}><AdminLayout /></RoleBasedRoute>
 *   <RoleBasedRoute roles={['member', 'admin']}><Content /></RoleBasedRoute>
 */
export function RoleBasedRoute({ roles = [], children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Guest-only route.
 * Redirects authenticated users to their dashboard based on role.
 */
export function GuestOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return children;
}

/**
 * Wrapper for route layouts that need auth loading state.
 */
export { AuthLoadingGuard };
