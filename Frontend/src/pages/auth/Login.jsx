import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FormInput from '../../components/forms/FormInput';
import PasswordInput from '../../components/forms/PasswordInput';
import LoadingButton from '../../components/ui/buttons/LoadingButton';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      const profile = await login(formData.email.trim(), formData.password, rememberMe);
      toast.success('Welcome back!');
      // Return to the protected page the user originally requested
      // (set by ProtectedRoute/RoleBasedRoute), falling back to the
      // role-based default. Ignore auth paths to avoid redirect loops.
      const from = location.state?.from?.pathname;
      const isAuthPath = from === '/login' || from === '/signup';
      navigate(from && !isAuthPath ? from : profile?.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setServerError(err?.message || 'Invalid email or password. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-rs p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Welcome Back</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Login to your RaktoSetu account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-surface-3)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-[var(--color-primary)] hover:underline">
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <div className="flex items-start gap-2 text-sm text-[var(--color-danger)] bg-[var(--color-danger-bg)] border border-red-200 rounded-lg px-3 py-2">
            <span className="mt-0.5">{serverError}</span>
          </div>
        )}

        <LoadingButton
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="mt-2"
        >
          Login
        </LoadingButton>
      </form>

      <p className="mt-6 pt-6 border-t border-[var(--color-surface-3)] text-center text-sm text-[var(--color-text-muted)]">
        Don't have an account?{' '}
        <Link to="/signup" className="text-[var(--color-primary)] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
