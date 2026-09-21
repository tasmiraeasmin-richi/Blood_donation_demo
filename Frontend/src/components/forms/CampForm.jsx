import { forwardRef, useState, useCallback } from 'react';
import FormInput from './FormInput';
import SelectInput from './SelectInput';
import DateInput from './DateInput';
import { DISTRICTS } from '../../utils/constants';

const CAMP_STATUSES = ['upcoming', 'completed'];

function validateCampForm(data) {
  const errs = {};
  if (!data.title.trim()) errs.title = 'Title is required';
  else if (data.title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
  if (!data.organizer.trim()) errs.organizer = 'Organizer is required';
  if (!data.district) errs.district = 'District is required';
  else if (!DISTRICTS.includes(data.district)) errs.district = 'Select a valid district';
  if (!data.venue.trim()) errs.venue = 'Venue is required';
  if (!data.date) errs.date = 'Date is required';
  else if (Number.isNaN(new Date(data.date).getTime())) errs.date = 'Enter a valid date';
  if (!data.status) errs.status = 'Status is required';
  else if (!CAMP_STATUSES.includes(data.status)) errs.status = 'Select a valid status';
  return errs;
}

const campDefaultData = {
  title: '',
  organizer: '',
  district: '',
  venue: '',
  date: '',
  status: 'upcoming',
};

const CampForm = forwardRef(function CampForm(
  { onSubmit, initialData, submitting = false, submitLabel = 'Submit', cancelLabel = 'Cancel', onCancel, className = '', ...props },
  ref
) {
  const [formData, setFormData] = useState(initialData ? { ...initialData } : { ...campDefaultData });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  const handleBlur = field => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errs = validateCampForm(formData);
    if (errs[field]) setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validateCampForm(formData);
    setErrors(errs);
    setTouched(Object.keys(errs).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
    if (Object.keys(errs).length === 0) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({ ...campDefaultData });
    setErrors({});
    setTouched({});
    onCancel?.();
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} ref={ref} noValidate {...props}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Camp Title"
          placeholder="e.g. Dhaka University Blood Drive"
          value={formData.title}
          onChange={e => handleChange('title', e.target.value)}
          onBlur={() => handleBlur('title')}
          error={touched.title ? errors.title : ''}
          required
          className="sm:col-span-2"
        />
        <FormInput
          label="Organizer"
          placeholder="Organizing body"
          value={formData.organizer}
          onChange={e => handleChange('organizer', e.target.value)}
          onBlur={() => handleBlur('organizer')}
          error={touched.organizer ? errors.organizer : ''}
          required
        />
        <SelectInput
          label="District"
          value={formData.district}
          onChange={e => handleChange('district', e.target.value)}
          onBlur={() => handleBlur('district')}
          error={touched.district ? errors.district : ''}
          required
          placeholder="Select district"
        >
          {DISTRICTS.map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </SelectInput>
        <FormInput
          label="Venue"
          placeholder="Camp venue"
          value={formData.venue}
          onChange={e => handleChange('venue', e.target.value)}
          onBlur={() => handleBlur('venue')}
          error={touched.venue ? errors.venue : ''}
          required
          className="sm:col-span-2"
        />
        <DateInput
          label="Camp Date"
          value={formData.date}
          onChange={e => handleChange('date', e.target.value)}
          onBlur={() => handleBlur('date')}
          error={touched.date ? errors.date : ''}
          required
        />
        <SelectInput
          label="Status"
          value={formData.status}
          onChange={e => handleChange('status', e.target.value)}
          onBlur={() => handleBlur('status')}
          error={touched.status ? errors.status : ''}
          required
        >
          {CAMP_STATUSES.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
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

export default CampForm;
