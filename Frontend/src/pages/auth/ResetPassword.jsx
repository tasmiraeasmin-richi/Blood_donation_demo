import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import PasswordInput from '../../components/forms/PasswordInput';
import LoadingButton from '../../components/ui/buttons/LoadingButton';
import FormError from '../../components/forms/FormError';
import { resetPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');
  const invalidToken = !token || token.length <= 5;

  const validate = useCallback(() => {
    const errs = {};
    if (!password) errs.password = 'New password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    else if (!/[A-Z]/.test(password)) errs.password = 'Must contain an uppercase letter';
    else if (!/\d/.test(password)) errs.password = 'Must contain a number';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }, [password, confirmPassword]);

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
      await resetPassword(token, password);
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (err) {
      setServerError(err?.message || 'Failed to reset password');
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="card-rs p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-4">
          <FiAlertCircle className="w-8 h-8 text-[var(--color-danger)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Invalid or Expired Link</h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          The password reset link is invalid or has expired. Please request a new one.
        </p>
        <div className="space-y-2">
          <Link to="/forgot-password" className="btn btn-sm bg-[var(--color-primary)] text-white border-0 w-full gap-2">
            <FiArrowLeft className="w-4 h-4" />
            Request New Link
          </Link>
          <Link to="/login" className="btn btn-sm btn-outline border-[var(--color-primary)] text-[var(--color-primary)] w-full gap-2">
            <FiArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card-rs p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Password Reset</h1>
        <p className="text-[var(--color-text-muted)] text-sm mb-6">
          Your password has been updated successfully. You can now sign in with your new password.
        </p>
        <Link to="/login" className="btn btn-sm bg-[var(--color-primary)] text-white border-0 w-full gap-2">
          <FiArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="card-rs p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Reset Password</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Enter your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="New Password"
          placeholder="Min 6 chars, 1 uppercase, 1 number"
          value={password}
          onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
          error={errors.password}
          required
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm New Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={e => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <FormError message={serverError} />

        <LoadingButton
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          className="mt-2"
        >
          Reset Password
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
