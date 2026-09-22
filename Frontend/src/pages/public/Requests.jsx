import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiPlus } from 'react-icons/fi';
import { listPublicRequests } from '../../api/requests';
import { useAuth } from '../../contexts/AuthContext';
import { BLOOD_GROUPS, URGENCY_LEVELS } from '../../utils/constants';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import RequestCard from '../../components/cards/RequestCard';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
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
];

const sortOptions = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'urgency_desc', label: 'Most Urgent' },
  { value: 'units_desc', label: 'Most Units Needed' },
  { value: 'required_date_asc', label: 'Required Date (Earliest)' },
  { value: 'required_date_desc', label: 'Required Date (Latest)' },
];

const urgencyOrder = { critical: 3, urgent: 2, normal: 1 };

function sortRequests(requests, sortValue) {
  if (!sortValue) return requests;

  // 'latest'/'oldest' sort by id: ids auto-increment, so higher id = newer.
  if (sortValue === 'latest') return [...requests].sort((a, b) => b.id - a.id);
  if (sortValue === 'oldest') return [...requests].sort((a, b) => a.id - b.id);
  if (sortValue === 'units_desc') return [...requests].sort((a, b) => (b.units || 0) - (a.units || 0));

  const [field, order] = sortValue.split('_').reduce(
    (acc, part, i, arr) => {
      if (i === 0) return [part, ''];
      if (i === arr.length - 1) return [acc[0], part];
      return [acc[0] + '_' + part, acc[1]];
    },
    ['', '']
  );

  const sorted = [...requests];
  sorted.sort((a, b) => {
    let comparison = 0;

    if (field === 'required_date') {
      const dateA = new Date(a.required_date);
      const dateB = new Date(b.required_date);
      comparison = dateA - dateB;
    } else if (field === 'urgency') {
      comparison = (urgencyOrder[a.urgency] || 0) - (urgencyOrder[b.urgency] || 0);
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

export default function Requests() {
  const { isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ blood_group: '', urgency: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Backend lists approved requests only; remaining filters stay client-side.
  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRequests(await listPublicRequests());
    } catch (err) {
      setError(err?.message || 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        r =>
          r.request_code.toLowerCase().includes(q) ||
          r.patient_name.toLowerCase().includes(q) ||
          r.hospital.toLowerCase().includes(q) ||
          r.district.toLowerCase().includes(q)
      );
    }

    if (filters.blood_group) {
      result = result.filter(r => r.blood_group === filters.blood_group);
    }

    if (filters.urgency) {
      result = result.filter(r => r.urgency === filters.urgency);
    }

    result = sortRequests(result, sort);

    return result;
  }, [requests, search, filters, sort]);

  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = useCallback(val => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((name, val) => {
    setFilters(prev => ({ ...prev, [name]: val }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ blood_group: '', urgency: '' });
    setSearch('');
    setSort('');
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(val => {
    setSort(val);
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blood Requests</h1>
          <p className="text-[var(--color-text-muted)]">Finding active blood requests...</p>
        </div>
        <LoadingState message="Loading requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blood Requests</h1>
          <p className="text-[var(--color-text-muted)]">Browse active blood donation requests.</p>
        </div>
        <ErrorState
          title="Failed to load requests"
          message={error}
          onRetry={loadRequests}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blood Requests</h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            Find and support people who need blood. Browse approved blood donation
            requests by blood group, urgency, or location.
          </p>
        </div>
        {!isAdmin && (
          <Link
            to="/dashboard/requests/create"
            className="btn bg-[var(--color-primary)] text-white border-0 gap-2 shrink-0 w-full sm:w-auto"
          >
            <FiPlus className="w-4 h-4" />
            Request Blood
          </Link>
        )}
      </div>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by request code, patient, hospital, or district..."
            className="flex-1"
          />
          <SortSelect
            options={sortOptions}
            value={sort}
            onChange={handleSort}
            className="sm:w-52"
          />
        </div>
        <FilterPanel
          filters={filterConfig}
          values={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* ── Results summary ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredRequests.length === 0
            ? 'No requests found'
            : `Showing ${paginatedRequests.length} of ${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filteredRequests.length === 0 && (
        <EmptyState
          title="No blood requests found"
          message="Try adjusting your search or filters to find blood requests."
          icon={FiFileText}
          action={
            <button
              onClick={handleResetFilters}
              className="btn btn-sm bg-[var(--color-primary)] text-white border-0"
            >
              Clear Filters
            </button>
          }
        />
      )}

      {/* ── Request grid ───────────────────────────────────────── */}
      {filteredRequests.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {paginatedRequests.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredRequests.length}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
