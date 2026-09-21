import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiEdit3, FiArrowLeft } from 'react-icons/fi';
import { getRequest, updateRequest } from '../../api/requests';
import RequestForm from '../../components/forms/RequestForm';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMember } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequest(await getRequest(id));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    getRequest(id).then(
      data => { setRequest(data); setError(null); setLoading(false); },
      err => { setError(err); setLoading(false); }
    );
  }, [id]);

  const notFound = !loading && (!request || error?.status === 404);

  const handleSubmit = async formData => {
    setSubmitting(true);
    try {
      await updateRequest(id, formData);
      toast.success('Request updated successfully');
      navigate('/dashboard/requests');
    } catch (err) {
      toast.error(err?.message || 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/dashboard/requests');

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to My Requests
          </button>
        </div>
        <LoadingState message="Loading request..." />
      </div>
    );
  }

  if (error && !notFound) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to My Requests
          </button>
        </div>
        <ErrorState
          title="Failed to load request"
          message={error?.message}
          onRetry={loadRequest}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page-container py-10">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to My Requests
          </button>
        </div>
        <div className="card-rs p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-3)] flex items-center justify-center mx-auto mb-4">
            <FiEdit3 className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">Request Not Found</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            The request you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/dashboard/requests')}
            className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Browse All Requests
          </button>
        </div>
      </div>
    );
  }

  const canEdit = request.status === 'pending' && isMember;

  return (
    <div className="page-container py-10">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/requests')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          Back to My Requests
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Request</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Update the details for request {request.request_code}. Only pending requests can be edited.
        </p>
      </div>

      {!canEdit && (
        <div className="card-rs p-6 mb-6 border-l-4 border-l-[var(--color-warning)] bg-[var(--color-warning-bg)]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-warning)] flex items-center justify-center flex-shrink-0 mt-0.5">
              <FiEdit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--color-warning)] mb-1">Edit Not Allowed</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                Only pending requests can be edited. This request has a status of <strong>{request.status}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl">
        <div className="card-rs p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-lt)] flex items-center justify-center">
              <FiEdit3 className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text)]">Edit Blood Request</h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                {request.request_code} · {request.patient_name} · Status: {request.status}
              </p>
            </div>
          </div>

          {canEdit ? (
            <RequestForm
              key={request.id}
              initialData={request}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitLabel="Update Request"
              cancelLabel="Cancel"
              onCancel={handleCancel}
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Patient Name', value: request.patient_name },
                  { label: 'Blood Group', value: request.blood_group },
                  { label: 'Units', value: `${request.units}` },
                  { label: 'Hospital', value: request.hospital },
                  { label: 'District', value: request.district },
                  { label: 'Contact Phone', value: request.contact_phone || '—' },
                  { label: 'Required Date', value: request.required_date },
                  { label: 'Urgency', value: request.urgency },
                  { label: 'Status', value: request.status },
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm text-[var(--color-text)]">{item.value}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/dashboard/requests')}
                className="btn btn-sm bg-[var(--color-primary)] text-white border-0 gap-2"
              >
                Back to Requests
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}