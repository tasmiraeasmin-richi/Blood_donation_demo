import { forwardRef, useState, useCallback } from 'react';
import FormInput from './FormInput';
import SelectInput from './SelectInput';
import DateInput from './DateInput';

function validateDonationForm(data) {
  const errs = {};
  if (!data.donor_id) errs.donor_id = 'Donor is required';
  if (!data.hospital.trim()) errs.hospital = 'Hospital is required';
  if (!data.date) errs.date = 'Donation date is required';
  else {
    const d = new Date(data.date);
    if (Number.isNaN(d.getTime())) errs.date = 'Enter a valid date';
    else if (d > new Date()) errs.date = 'Donation date cannot be in the future';
  }
  if (!data.units) errs.units = 'Units is required';
  else if (isNaN(data.units) || data.units < 1 || data.units > 2) errs.units = 'Units must be 1–2';
  return errs;
}

const donationDefaultData = {
  donor_id: '',
  request_id: '',
  hospital: '',
  date: '',
  units: '1',
};

const DonationForm = forwardRef(function DonationForm(
  {
    onSubmit,
    initialData,
    donors = [],
    requests = [],
    submitting = false,
    submitLabel = 'Submit',
    cancelLabel = 'Cancel',
    onCancel,
    className = '',
    ...props
  },
  ref
) {
  const [formData, setFormData] = useState(initialData ? { ...initialData } : { ...donationDefaultData });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleBlur = field => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validateDonationForm(formData);
    if (errs[field]) setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validateDonationForm(formData);
    setErrors(errs);
    setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(errs).length === 0) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({ ...donationDefaultData });
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} ref={ref} noValidate {...props}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectInput
          label="Donor"
          value={formData.donor_id}
          onChange={e => handleChange('donor_id', e.target.value)}
          onBlur={() => handleBlur('donor_id')}
          error={touched.donor_id ? errors.donor_id : ''}
          required
          placeholder="Select donor"
        >
          {donors.map(d => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.blood_group})
            </option>
          ))}
        </SelectInput>
        <SelectInput
          label="Linked Request (optional)"
          value={formData.request_id || ''}
          onChange={e => handleChange('request_id', e.target.value)}
        >
          <option value="">No linked request</option>
          {requests.map(r => (
            <option key={r.id} value={r.id}>
              {r.request_code} — {r.patient_name}
            </option>
          ))}
        </SelectInput>
        <FormInput
          label="Hospital"
          placeholder="Hospital name"
          value={formData.hospital}
          onChange={e => handleChange('hospital', e.target.value)}
          onBlur={() => handleBlur('hospital')}
          error={touched.hospital ? errors.hospital : ''}
          required
        />
        <DateInput
          label="Donation Date"
          value={formData.date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={e => handleChange('date', e.target.value)}
          onBlur={() => handleBlur('date')}
          error={touched.date ? errors.date : ''}
          required
        />
        <FormInput
          label="Units"
          type="number"
          min="1"
          max="2"
          placeholder="1–2"
          value={formData.units}
          onChange={e => handleChange('units', e.target.value)}
          onBlur={() => handleBlur('units')}
          error={touched.units ? errors.units : ''}
          required
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn bg-[var(--color-primary)] text-white border-0 gap-2"
        >
          {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline border-[var(--color-primary)] text-[var(--color-primary)]"
          >
            {cancelLabel}
          </button>
        )}
      </div>
    </form>
  );
});

export default DonationForm;
