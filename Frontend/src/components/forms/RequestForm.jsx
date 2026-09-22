import { forwardRef, useState, useCallback } from 'react';
import FormInput from './FormInput';
import SelectInput from './SelectInput';
import DateInput from './DateInput';
import { BLOOD_GROUPS, DISTRICTS } from '../../utils/constants';

const urgencyOptions = ['normal', 'urgent', 'critical'].map(u => ({
  value: u,
  label: u.charAt(0).toUpperCase() + u.slice(1),
}));

function validateForm(data) {
  const errs = {};
  if (!data.patient_name.trim()) errs.patient_name = 'Patient name is required';
  else if (data.patient_name.trim().length < 2) errs.patient_name = 'Name must be at least 2 characters';
  if (!data.blood_group) errs.blood_group = 'Blood group is required';
  if (!data.units) errs.units = 'Units needed is required';
  else if (isNaN(data.units) || data.units < 1 || data.units > 10) errs.units = 'Units must be 1–10';
  if (!data.hospital.trim()) errs.hospital = 'Hospital is required';
  if (!data.district) errs.district = 'District is required';
  if (!data.contact_phone.trim()) errs.contact_phone = 'Contact phone is required';
  else if (!/^\+?[\d\s-]{8,}$/.test(data.contact_phone)) errs.contact_phone = 'Enter a valid phone number';
  if (!data.required_date) errs.required_date = 'Required date is required';
  // Compare calendar dates (not timestamps): the service sends end-of-day,
  // so a request needed today is valid — only past days are rejected,
  // matching the backend's "required_date cannot be in the past" check.
  else if (data.required_date < new Date().toLocaleDateString('en-CA')) errs.required_date = 'Date must be in the future';
  if (!data.urgency) errs.urgency = 'Urgency is required';
  return errs;
}

const defaultData = {
  patient_name: '',
  blood_group: '',
  units: '',
  hospital: '',
  district: '',
  contact_phone: '',
  required_date: '',
  urgency: '',
};

const RequestForm = forwardRef(function RequestForm(
  { onSubmit, initialData, submitting = false, submitLabel = 'Submit', cancelLabel = 'Cancel', onCancel, className = '', ...props },
  ref
) {
  const [formData, setFormData] = useState(initialData ? { ...initialData } : { ...defaultData });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validateForm(formData);
    if (errs[field]) setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateForm(formData);
    setErrors(errs);
    setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(errs).length === 0) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({ ...defaultData });
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} ref={ref} {...props}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Patient Name"
          placeholder="Full name"
          value={formData.patient_name}
          onChange={e => handleChange('patient_name', e.target.value)}
          onBlur={() => handleBlur('patient_name')}
          error={touched.patient_name ? errors.patient_name : ''}
          required
        />
        <SelectInput
          label="Blood Group"
          value={formData.blood_group}
          onChange={e => handleChange('blood_group', e.target.value)}
          error={touched.blood_group ? errors.blood_group : ''}
          required
          placeholder="Select blood group"
        >
          {BLOOD_GROUPS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </SelectInput>
        <FormInput
          label="Units Needed"
          type="number"
          min="1"
          max="10"
          placeholder="1–10"
          value={formData.units}
          onChange={e => handleChange('units', e.target.value)}
          onBlur={() => handleBlur('units')}
          error={touched.units ? errors.units : ''}
          required
        />
        <FormInput
          label="Hospital"
          placeholder="Hospital name"
          value={formData.hospital}
          onChange={e => handleChange('hospital', e.target.value)}
          onBlur={() => handleBlur('hospital')}
          error={touched.hospital ? errors.hospital : ''}
          required
        />
        <SelectInput
          label="District"
          value={formData.district}
          onChange={e => handleChange('district', e.target.value)}
          error={touched.district ? errors.district : ''}
          required
          placeholder="Select district"
        >
          {DISTRICTS.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </SelectInput>
        <FormInput
          label="Contact Phone"
          type="tel"
          placeholder="+8801XXXXXXXXX"
          value={formData.contact_phone}
          onChange={e => handleChange('contact_phone', e.target.value)}
          onBlur={() => handleBlur('contact_phone')}
          error={touched.contact_phone ? errors.contact_phone : ''}
          required
        />
        <DateInput
          label="Required Date"
          value={formData.required_date}
          onChange={e => handleChange('required_date', e.target.value)}
          onBlur={() => handleBlur('required_date')}
          error={touched.required_date ? errors.required_date : ''}
          required
        />
        <SelectInput
          label="Urgency"
          value={formData.urgency}
          onChange={e => handleChange('urgency', e.target.value)}
          error={touched.urgency ? errors.urgency : ''}
          required
          placeholder="Select urgency level"
        >
          {urgencyOptions.map(u => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </SelectInput>
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

export default RequestForm;