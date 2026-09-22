import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import { listMyOffers } from '../../api/offers';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { value: 'offered', label: 'Offered' },
      { value: 'accepted', label: 'Accepted' },
      { value: 'declined', label: 'Declined' },
    ],
  },
];

const sortOptions = [
  { value: 'required_date_desc', label: 'Required Date (Latest)' },
  { value: 'required_date_asc', label: 'Required Date (Earliest)' },
];

function sortOffers(offers, sortValue) {
  if (!sortValue) return offers;
  const order = sortValue.endsWith('_desc') ? 'desc' : 'asc';
  const sorted = [...offers];
  sorted.sort((a, b) => {
    const comparison = new Date(a.required_date) - new Date(b.required_date);
    return order === 'desc' ? -comparison : comparison;
  });
  return sorted;
}

export default function MyOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await listMyOffers());
    } catch (err) {
      setError(err?.message || 'Failed to load offers.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadOffers();
  }, []);

  let filteredOffers = [...offers];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredOffers = filteredOffers.filter(
      o =>
        o.request_code.toLowerCase().includes(q) ||
        (o.hospital || '').toLowerCase().includes(q) ||
        o.blood_group.toLowerCase().includes(q)
    );
  }
  if (filters.status) filteredOffers = filteredOffers.filter(o => o.status === filters.status);
  filteredOffers = sortOffers(filteredOffers, sort);

  const totalPages = Math.ceil(filteredOffers.length / ITEMS_PER_PAGE);
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ status: '' }); setSearch(''); setSort(''); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const handleNavigateToDetail = (requestId) => {
    navigate(`/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Offers</h1>
          <p className="text-[var(--color-text-muted)]">Loading your offers...</p>
        </div>
        <LoadingState message="Loading offers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Offers</h1>
          <p className="text-[var(--color-text-muted)]">Track the status of your blood donation offers.</p>
        </div>
        <ErrorState title="Failed to load offers" message={error} onRetry={loadOffers} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Offers</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Track the status of your blood donation offers on various requests.
        </p>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by request code, hospital, or blood group..." className="flex-1" />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-48" />
        </div>
        <FilterPanel filters={filterConfig} values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredOffers.length === 0 ? 'No offers found' : `Showing ${paginatedOffers.length} of ${filteredOffers.length} offer${filteredOffers.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filteredOffers.length === 0 && (
        <EmptyState
          title="No offers found"
          message="Try adjusting your search or filters, or make a new offer on a request."
          icon={FiFileText}
          action={
            <PrimaryButton onClick={() => navigate('/requests')}>
              <FiFileText className="w-4 h-4" />
              Browse Requests
            </PrimaryButton>
          }
        />
      )}

      {filteredOffers.length > 0 && (
        <>
          <div className="space-y-3">
            {paginatedOffers.map(offer => (
              <div key={offer.id} className="card-rs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BloodGroupBadge bloodGroup={offer.blood_group} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[var(--color-text)] text-sm font-mono">{offer.request_code}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          offer.status === 'accepted' ? 'bg-[var(--color-success-bg)] text-[var(--color-success)] border-emerald-200' :
                          offer.status === 'offered' ? 'bg-[var(--color-info-bg)] text-[var(--color-info)] border-blue-200' :
                          'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border-slate-200'
                        }`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {offer.units} unit{offer.units !== 1 ? 's' : ''} · {offer.hospital} · Required {formatDate(offer.required_date)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleNavigateToDetail(offer.request_id)}
                    className="btn btn-sm btn-ghost text-[var(--color-primary)] hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    View Request
                    <FiArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredOffers.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
