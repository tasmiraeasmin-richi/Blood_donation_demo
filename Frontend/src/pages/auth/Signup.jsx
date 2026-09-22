import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import FormInput from '../../components/forms/FormInput';
import PasswordInput from '../../components/forms/PasswordInput';
import SelectInput from '../../components/forms/SelectInput';
import LoadingButton from '../../components/ui/buttons/LoadingButton';
import { BLOOD_GROUPS, DISTRICTS } from '../../utils/constants';
import { toast } from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    bloodGroup: '', district: '', agreedToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = useCallback(() => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    else if (formData.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';

    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';

    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-]{8,}$/.test(formData.phone)) errs.phone = 'Enter a valid phone number';

    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    //else if (!/[A-Z]/.test(formData.password)) errs.password = 'Must contain an uppercase letter';
    //else if (!/\d/.test(formData.password)) errs.password = 'Must contain a number';

    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (!formData.bloodGroup) errs.bloodGroup = 'Blood group is required';
    if (!formData.district) errs.district = 'District is required';
    if (!formData.agreedToTerms) errs.agreedToTerms = 'Please accept the Terms and Conditions';
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
      await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        blood_group: formData.bloodGroup,
        district: formData.district,
      });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      setServerError(err?.message || 'Registration failed. Please try again.');
      toast.error('Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-rs p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Create Account</h1>
        <p className="text-[var(--color-text-muted)] text-sm">Join RaktoSetu as a blood donor</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          error={errors.name}
          required
          autoComplete="name"
        />

        <FormInput
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={e => handleChange('email', e.target.value)}
          error={errors.email}
          required
          autoComplete="email"
        />

        <FormInput
          label="Phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={e => handleChange('phone', e.target.value)}
          error={errors.phone}
          required
          autoComplete="tel"
        />

        <SelectInput
          label="Blood Group"
          error={errors.bloodGroup}
          required
          placeholder="Select blood group"
          value={formData.bloodGroup}
          onChange={e => handleChange('bloodGroup', e.target.value)}
        >
          {BLOOD_GROUPS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </SelectInput>

        <SelectInput
          label="District"
          error={errors.district}
          required
          placeholder="Select your district"
          value={formData.district}
          onChange={e => handleChange('district', e.target.value)}
        >
          {DISTRICTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectInput>

        <PasswordInput
          label="Password"
          placeholder="Create password"
          value={formData.password}
          onChange={e => handleChange('password', e.target.value)}
          error={errors.password}
          required
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChange={e => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <div className="space-y-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.agreedToTerms}
              onChange={e => handleChange('agreedToTerms', e.target.checked)}
              className="w-4 h-4 rounded border-[var(--color-surface-3)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-text)]">I agree to the Terms and Conditions</span>
          </label>
          {errors.agreedToTerms && (
            <p className="text-xs text-[var(--color-danger)] mt-0.5">{errors.agreedToTerms}</p>
          )}
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
          Create Account
        </LoadingButton>
      </form>

      <p className="mt-6 pt-6 border-t border-[var(--color-surface-3)] text-center text-sm text-[var(--color-text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--color-primary)] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
