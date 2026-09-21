import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiFileText, FiEye, FiCheck, FiX } from 'react-icons/fi';
import { listAllRequests, approveRequest, rejectRequest } from '../../api/adminRequests';
import { BLOOD_GROUPS, DISTRICTS, REQUEST_STATUSES, URGENCY_LEVELS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import UrgencyBadge from '../../components/ui/badges/UrgencyBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import Modal from '../../components/ui/modals/Modal';
import TextArea from '../../components/forms/TextArea';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import DangerButton from '../../components/ui/buttons/DangerButton';
import SecondaryButton from '../../components/ui/buttons/SecondaryButton';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'status',
    label: 'Status',
    options: REQUEST_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
  },
  {
    name: 'blood_group',
    label: 'Blood Group',
    options: BLOOD_GROUPS.map(g => ({ value: g, label: g })),
  },
  {
    name: 'urgency',
    label: 'Urgency',
    options: URGENCY_LEVELS.map(u => ({ value: u, label: u.charAt(0).toUpperCase() + u.slice(1) })),
  },
  {
    name: 'district',
    label: 'District',
    options: DISTRICTS.map(d => ({ value: d, label: d })),
  },
];

const sortOptions = [
  { value: 'required_date_asc', label: 'Required Date (Earliest)' },
  { value: 'required_date_desc', label: 'Required Date (Latest)' },
  { value: 'urgency_desc', label: 'Urgency (Highest First)' },
  { value: 'urgency_asc', label: 'Urgency (Lowest First)' },
];

const urgencyOrder = { critical: 3, urgent: 2, normal: 1 };

function sortRequests(requests, sortValue) {
  if (!sortValue) return requests;
  const sorted = [...requests];
  sorted.sort((a, b) => {
    if (sortValue === 'required_date_asc') return new Date(a.required_date) - new Date(b.required_date);
    if (sortValue === 'required_date_desc') return new Date(b.required_date) - new Date(a.required_date);
    if (sortValue === 'urgency_desc') return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
    if (sortValue === 'urgency_asc') return (urgencyOrder[a.urgency] || 0) - (urgencyOrder[b.urgency] || 0);
    return 0;
  });
  return sorted;
}

function DetailRow({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">{label}</p>
      <p className="text-sm text-[var(--color-text)]">{value || '—'}</p>
    </div>
  );
}

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await listAllRequests());
    } catch (err) {
      setError(err?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadRequests();
  }, []);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', blood_group: '', urgency: '', district: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailRequest, setDetailRequest] = useState(null);
  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  let filteredRequests = [...requests];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredRequests = filteredRequests.filter(
      r =>
        r.request_code.toLowerCase().includes(q) ||
        r.patient_name.toLowerCase().includes(q) ||
        r.hospital.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q)
    );
  }
  if (filters.status) filteredRequests = filteredRequests.filter(r => r.status === filters.status);
  if (filters.blood_group) filteredRequests = filteredRequests.filter(r => r.blood_group === filters.blood_group);
  if (filters.urgency) filteredRequests = filteredRequests.filter(r => r.urgency === filters.urgency);
  if (filters.district) filteredRequests = filteredRequests.filter(r => r.district === filters.district);
  filteredRequests = sortRequests(filteredRequests, sort);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ status: '', blood_group: '', urgency: '', district: '' }); setSearch(''); setSort(''); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const handleApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    try {
      await approveRequest(approveTarget.id);
      toast.success(`Request ${approveTarget.request_code} approved`);
      setApproveTarget(null);
      setDetailRequest(null);
      await loadRequests();
    } catch (err) {
      toast.error(err?.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    if (rejectReason.trim().length < 5) {
      setRejectError('Please provide a rejection reason (at least 5 characters).');
      return;
    }
    setActionLoading(true);
    try {
      await rejectRequest(rejectTarget.id, rejectReason.trim());
      toast.success(`Request ${rejectTarget.request_code} rejected`);
      setRejectTarget(null);
      setRejectReason('');
      setRejectError('');
      setDetailRequest(null);
      await loadRequests();
    } catch (err) {
      toast.error(err?.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const closeReject = () => {
    setRejectTarget(null);
    setRejectReason('');
    setRejectError('');
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request Management</h1>
          <p className="text-[var(--color-text-muted)]">Loading blood requests...</p>
        </div>
        <LoadingState message="Loading requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request Management</h1>
          <p className="text-[var(--color-text-muted)]">Review and manage all blood requests.</p>
        </div>
        <ErrorState title="Failed to load requests" message={error} onRetry={loadRequests} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Request Management</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Review all blood requests across pending, approved, rejected, and fulfilled statuses. Approve valid requests or reject with a reason.
        </p>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by request code, patient, hospital, district, requester..."
            className="flex-1"
          />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-52" />
        </div>
        <FilterPanel filters={filterConfig} values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredRequests.length === 0
            ? 'No requests found'
            : `Showing ${paginatedRequests.length} of ${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filteredRequests.length === 0 && (
        <EmptyState
          title="No requests found"
          message="Try adjusting your search or filters to find blood requests."
          icon={FiFileText}
        />
      )}

      {filteredRequests.length > 0 && (
        <>
          {/* ── Desktop table ─────────────────────────────── */}
          <div className="hidden lg:block card-rs overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="table w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-surface-3)]">
                    <th className="text-left font-medium px-4 py-3">Request</th>
                    <th className="text-left font-medium px-4 py-3">Blood</th>
                    <th className="text-left font-medium px-4 py-3">Hospital / District</th>
                    <th className="text-left font-medium px-4 py-3">Required</th>
                    <th className="text-left font-medium px-4 py-3">Urgency</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-right font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRequests.map(request => (
                    <tr key={request.id} className="border-b border-[var(--color-surface-3)] last:border-0 hover:bg-[var(--color-surface-2)]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[var(--color-text)]">{request.patient_name}</p>
                        <p className="text-xs text-[var(--color-text-muted)] font-mono">{request.request_code}</p>
                      </td>
                      <td className="px-4 py-3">
                        <BloodGroupBadge bloodGroup={request.blood_group} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">
                        <p className="text-[var(--color-text)]">{request.hospital}</p>
                        <p className="text-xs">{request.district} · {request.units} unit{request.units !== 1 ? 's' : ''}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">{formatDate(request.required_date)}</td>
                      <td className="px-4 py-3"><UrgencyBadge urgency={request.urgency} /></td>
                      <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setDetailRequest(request)} className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-primary)]" title="View details" aria-label={`View ${request.request_code}`}>
                            <FiEye className="w-4 h-4" />
                          </button>
                          {request.status === 'pending' && (
                            <>
                              <button onClick={() => setApproveTarget(request)} className="btn btn-sm btn-ghost text-[var(--color-success)]" title="Approve" aria-label={`Approve ${request.request_code}`}>
                                <FiCheck className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setRejectTarget(request); setRejectReason(''); setRejectError(''); }} className="btn btn-sm btn-ghost text-[var(--color-danger)]" title="Reject" aria-label={`Reject ${request.request_code}`}>
                                <FiX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards ──────────────────────────────── */}
          <div className="lg:hidden space-y-3 mb-6">
            {paginatedRequests.map(request => (
              <div key={request.id} className="card-rs p-4">
                <div className="flex items-center gap-3 mb-2">
                  <BloodGroupBadge bloodGroup={request.blood_group} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--color-text)] truncate">{request.patient_name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-mono">{request.request_code}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  {request.units} unit{request.units !== 1 ? 's' : ''} · {request.hospital} · {request.district} · {formatDate(request.required_date)}
                </p>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={request.urgency} />
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => setDetailRequest(request)} className="btn btn-sm btn-ghost text-[var(--color-text-muted)]" aria-label={`View ${request.request_code}`}>
                      <FiEye className="w-4 h-4" />
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button onClick={() => setApproveTarget(request)} className="btn btn-sm btn-ghost text-[var(--color-success)]" aria-label={`Approve ${request.request_code}`}>
                          <FiCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => { setRejectTarget(request); setRejectReason(''); setRejectError(''); }} className="btn btn-sm btn-ghost text-[var(--color-danger)]" aria-label={`Reject ${request.request_code}`}>
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredRequests.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}

      {/* ── Details modal ────────────────────────────────── */}
      <Modal open={!!detailRequest} onClose={() => setDetailRequest(null)} title={detailRequest ? `Request ${detailRequest.request_code}` : ''} size="lg">
        {detailRequest && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <BloodGroupBadge bloodGroup={detailRequest.blood_group} size="md" />
              <UrgencyBadge urgency={detailRequest.urgency} />
              <StatusBadge status={detailRequest.status} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DetailRow label="Patient Name" value={detailRequest.patient_name} />
              <DetailRow label="Requested By" value={`Requester #${detailRequest.requester_id}`} />
              <DetailRow label="Blood Group" value={detailRequest.blood_group} />
              <DetailRow label="Units Needed" value={`${detailRequest.units} unit${detailRequest.units !== 1 ? 's' : ''}`} />
              <DetailRow label="Hospital" value={detailRequest.hospital} />
              <DetailRow label="District" value={detailRequest.district} />
              <DetailRow label="Required Date" value={formatDate(detailRequest.required_date)} />
              <DetailRow label="Contact Phone" value={detailRequest.contact_phone} />
            </div>
            {detailRequest.status === 'rejected' && detailRequest.rejection_reason && (
              <div className="rounded-lg bg-[var(--color-danger-bg)] border border-red-200 p-4">
                <p className="text-xs font-semibold text-[var(--color-danger)] uppercase tracking-wide mb-1">Rejection Reason</p>
                <p className="text-sm text-[var(--color-text)]">{detailRequest.rejection_reason}</p>
              </div>
            )}
            {detailRequest.status === 'pending' && (
              <div className="flex flex-wrap gap-3">
                <PrimaryButton onClick={() => { setDetailRequest(null); setApproveTarget(detailRequest); }}>
                  <FiCheck className="w-4 h-4" /> Approve
                </PrimaryButton>
                <DangerButton onClick={() => { setDetailRequest(null); setRejectTarget(detailRequest); setRejectReason(''); setRejectError(''); }}>
                  <FiX className="w-4 h-4" /> Reject
                </DangerButton>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Approve confirmation ─────────────────────────── */}
      <Modal open={!!approveTarget} onClose={() => setApproveTarget(null)} title="Approve Request" size="sm">
        {approveTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Approve request <span className="font-mono font-medium text-[var(--color-text)]">{approveTarget.request_code}</span> for{' '}
              <span className="font-medium text-[var(--color-text)]">{approveTarget.patient_name}</span>? It will become visible for donor offers.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setApproveTarget(null)} fullWidth disabled={actionLoading}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleApprove} fullWidth loading={actionLoading}>
                Approve
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject with reason ───────────────────────────── */}
      <Modal open={!!rejectTarget} onClose={closeReject} title="Reject Request" size="md">
        {rejectTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Reject request <span className="font-mono font-medium text-[var(--color-text)]">{rejectTarget.request_code}</span> for{' '}
              <span className="font-medium text-[var(--color-text)]">{rejectTarget.patient_name}</span>? A reason is required and will be shown to the requester.
            </p>
            <TextArea
              label="Rejection Reason"
              required
              rows={4}
              value={rejectReason}
              onChange={e => { setRejectReason(e.target.value); setRejectError(''); }}
              error={rejectError}
              placeholder="Explain why this request is being rejected..."
            />
            <div className="flex gap-3">
              <SecondaryButton onClick={closeReject} fullWidth disabled={actionLoading}>
                Cancel
              </SecondaryButton>
              <DangerButton onClick={handleReject} fullWidth loading={actionLoading}>
                Reject Request
              </DangerButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
