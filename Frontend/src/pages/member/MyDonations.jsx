import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiArrowRight } from 'react-icons/fi';
import { listMyDonations } from '../../api/donations';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import { formatDate } from '../../utils/helpers';

const ITEMS_PER_PAGE = 9;

const sortOptions = [
  { value: 'date_desc', label: 'Date (Latest)' },
  { value: 'date_asc', label: 'Date (Earliest)' },
];

export default function MyDonations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ hospital: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadDonations = async () => {
    setLoading(true);
    setError(null);
    try {
      setDonations(await listMyDonations());
    } catch (err) {
      setError(err?.message || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadDonations();
  }, []);

  let filteredDonations = [...donations];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredDonations = filteredDonations.filter(d => d.hospital.toLowerCase().includes(q));
  }
  if (filters.hospital) filteredDonations = filteredDonations.filter(d => d.hospital === filters.hospital);
  filteredDonations.sort((a, b) => {
    if (sort === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sort === 'date_asc') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ hospital: '' }); setSearch(''); setSort(''); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const handleViewRequest = (requestId) => {
    if (requestId) navigate(`/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donation History</h1>
          <p className="text-[var(--color-text-muted)]">Loading your donations...</p>
        </div>
        <LoadingState message="Loading donations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donation History</h1>
          <p className="text-[var(--color-text-muted)]">View your past donation records.</p>
        </div>
        <ErrorState title="Failed to load donations" message={error} onRetry={loadDonations} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Donation History</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          View your past donation records and track your contribution to the community.
        </p>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search by hospital..." className="flex-1" />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-48" />
        </div>
        <FilterPanel filters={[{ name: 'hospital', label: 'Hospital', options: [...new Set(donations.map(d => d.hospital))].sort().map(h => ({ value: h, label: h }))}]} values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredDonations.length === 0 ? 'No donations found' : `Showing ${paginatedDonations.length} of ${filteredDonations.length} donation${filteredDonations.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filteredDonations.length === 0 && (
        <EmptyState
          title="No donations yet"
          message="Your donation history will appear here once you've donated."
          icon={FiHeart}
          action={
            <PrimaryButton onClick={() => navigate('/dashboard/requests')}>
              <FiHeart className="w-4 h-4" />
              Create a Request
            </PrimaryButton>
          }
        />
      )}

      {filteredDonations.length > 0 && (
        <>
          <div className="space-y-3">
            {paginatedDonations.map(donation => (
              <div key={donation.id} className="card-rs p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center flex-shrink-0">
                      <FiHeart className="w-5 h-5 text-[var(--color-danger)]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-[var(--color-text)]">{donation.units} unit{donation.units !== 1 ? 's' : ''}</span>
                        {donation.request_id && (
                          <span className="text-xs text-[var(--color-text-muted)] font-mono">Request #{donation.request_id}</span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {donation.hospital} · {formatDate(donation.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {donation.request_id && (
                      <button
                        onClick={() => handleViewRequest(donation.request_id)}
                        className="btn btn-sm btn-ghost text-[var(--color-primary)] hover:underline flex items-center gap-1"
                      >
                        View Request <FiArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredDonations.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
