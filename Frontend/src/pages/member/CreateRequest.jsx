import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlusCircle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { createRequest } from '../../api/requests';
import RequestForm from '../../components/forms/RequestForm';
import { toast } from 'react-hot-toast';

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async formData => {
    setSubmitting(true);
    try {
      await createRequest(formData);
      toast.success('Blood request created successfully');
      navigate('/dashboard/requests');
    } catch (err) {
      toast.error(err?.message || 'Failed to create request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/dashboard/requests');

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Blood Request</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Submit a new blood donation request for a patient in need. All fields are required.
        </p>
      </div>

      <div className="max-w-3xl">
        <div className="card-rs p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-lt)] flex items-center justify-center">
              <FiPlusCircle className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">New Blood Request</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                Submit as {user?.name || 'Member'}
              </p>
            </div>
          </div>

          <RequestForm
            onSubmit={handleSubmit}
            submitting={submitting}
            submitLabel="Create Request"
            cancelLabel="Cancel"
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
