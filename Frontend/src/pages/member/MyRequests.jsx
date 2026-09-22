import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiEye, FiEdit3, FiTrash2 } from 'react-icons/fi';
import { listMyRequests, deleteRequest } from '../../api/requests';
import { REQUEST_STATUSES } from '../../utils/constants';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import ConfirmationModal from '../../components/ui/modals/ConfirmationModal';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import { toast } from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'status',
    label: 'Status',
    options: REQUEST_STATUSES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) })),
  },
  {
    name: 'urgency',
    label: 'Urgency',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'urgent', label: 'Urgent' },
      { value: 'normal', label: 'Normal' },
    ],
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
  const [field, order] = sortValue.split('_').reduce(
    (acc, part, i, arr) => {
      if (i === 0) return [part, ''];
      if (i === arr.length - 1) return [acc[0] + '_' + part, acc[1]];
      return [acc[0] + '_' + part, acc[1]];
    },
    ['', '']
  );
  const sorted = [...requests];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (field === 'required_date') comparison = new Date(a.required_date) - new Date(b.required_date);
    else if (field === 'urgency') comparison = (urgencyOrder[a.urgency] || 0) - (urgencyOrder[b.urgency] || 0);
    return order === 'desc' ? -comparison : comparison;
  });
  return sorted;
}

export default function MyRequests() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', urgency: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await listMyRequests());
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
  if (filters.urgency) filteredRequests = filteredRequests.filter(r => r.urgency === filters.urgency);
  filteredRequests = sortRequests(filteredRequests, sort);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ status: '', urgency: '' }); setSearch(''); setSort(''); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const handleView = (id) => navigate(`/requests/${id}`);

  const handleDeleteClick = (request) => setDeleteTarget(request);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRequest(deleteTarget.id);
      toast.success('Request deleted successfully');
      setDeleteTarget(null);
      setCurrentPage(1);
      await loadRequests();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete request');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseDeleteModal = () => setDeleteTarget(null);

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Requests</h1>
          <p className="text-[var(--color-text-muted)]">Loading your blood requests...</p>
        </div>
        <LoadingState message="Loading requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Requests</h1>
          <p className="text-[var(--color-text-muted)]">Manage your blood donation requests.</p>
        </div>
        <ErrorState title="Failed to load requests" message={error} onRetry={loadRequests} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Requests</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Track and manage your blood donation requests. Review status, edit pending requests, or create new ones.
        </p>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by request code, patient, hospital, or district..."
            className="flex-1"
          />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-48" />
        </div>
        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
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
          message="Try adjusting your search or filters, or create a new blood request."
          icon={FiFileText}
          action={
            <PrimaryButton onClick={() => navigate('/dashboard/requests/create')}>
              <FiFileText className="w-4 h-4" />
              Create Request
            </PrimaryButton>
          }
        />
      )}

      {filteredRequests.length > 0 && (
        <>
          <div className="space-y-3">
            {paginatedRequests.map(request => (
              <div key={request.id} className="card-rs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BloodGroupBadge bloodGroup={request.blood_group} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[var(--color-text)] text-sm">{request.patient_name}</span>
                        <StatusBadge status={request.status} />
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {request.request_code} · {request.units} unit{request.units !== 1 ? 's' : ''} · {request.hospital} · {request.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleView(request.id)}
                      className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                      title="View"
                      aria-label={`View request ${request.request_code}`}
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => navigate(`/dashboard/requests/${request.id}/edit`)}
                          className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
                          title="Edit"
                          aria-label={`Edit request ${request.request_code}`}
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(request)}
                          className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                          title="Delete"
                          aria-label={`Delete request ${request.request_code}`}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredRequests.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}

      <ConfirmationModal
        open={!!deleteTarget}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Delete Request"
        message={`Are you sure you want to delete request ${deleteTarget?.request_code || ''} for ${deleteTarget?.patient_name || ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
      />
    </div>
  );
}
