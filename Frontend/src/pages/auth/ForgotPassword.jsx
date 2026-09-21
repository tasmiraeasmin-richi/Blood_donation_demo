import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import FormInput from '../../components/forms/FormInput';
import LoadingButton from '../../components/ui/buttons/LoadingButton';
import { forgotPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
      toast.success('If that email is registered, a reset link was logged for development');
    } catch (err) {
      setError(err?.message || 'Failed to send reset link. Please try again.');
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card-rs p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
          <FiMail className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Check the Dev Logs</h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          If <span className="font-medium text-[var(--color-text)]">{email}</span> is registered, a password
          reset link was logged for development (email delivery is not configured in this demo).
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="card-rs p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Forgot Password</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Enter your email to receive a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          error={error}
          required
          autoComplete="email"
        />

        <LoadingButton
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="mt-2"
        >
          Send Reset Link
        </LoadingButton>
      </form>

      <p className="mt-6 pt-6 border-t border-[var(--color-surface-3)] text-center text-sm text-[var(--color-text-muted)]">
        <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
          <FiArrowLeft className="w-4 h-4 inline" /> Back to Login
        </Link>
      </p>
    </div>
  );
}
