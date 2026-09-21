import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiUsers } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { listDonors } from '../../api/donors';
import { BLOOD_GROUPS, DISTRICTS } from '../../utils/constants';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import DonorCard from '../../components/cards/DonorCard';
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
    name: 'district',
    label: 'District',
    options: DISTRICTS.map(d => ({ value: d, label: d })),
  },
];

export default function Donors() {
  const { isAuthenticated } = useAuth();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ blood_group: '', district: '' });
  const [currentPage, setCurrentPage] = useState(1);

  // Blood group + district are filtered server-side (backend contract).
  const loadDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDonors({ blood_group: filters.blood_group, district: filters.district });
      setDonors(data);
    } catch (err) {
      setError(err?.message || 'Failed to load donors.');
    } finally {
      setLoading(false);
    }
  }, [filters.blood_group, filters.district]);

  useEffect(() => {
    listDonors({ blood_group: filters.blood_group, district: filters.district }).then(
      data => { setDonors(data); setError(null); setLoading(false); },
      err => { setError(err?.message || 'Failed to load donors.'); setLoading(false); }
    );
  }, [filters.blood_group, filters.district]);

  // Text search stays client-side
  const filteredDonors = useMemo(() => {
    let result = [...donors];

    // Text search (name or district)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        d =>
          d.name.toLowerCase().includes(q) ||
          d.district.toLowerCase().includes(q)
      );
    }

    return result;
  }, [donors, search]);

  // Pagination
  const totalPages = Math.ceil(filteredDonors.length / ITEMS_PER_PAGE);
  const paginatedDonors = filteredDonors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters/search change
  const handleSearch = useCallback(val => {
    setSearch(val);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((name, val) => {
    setFilters(prev => ({ ...prev, [name]: val }));
    setCurrentPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({ blood_group: '', district: '' });
    setSearch('');
    setCurrentPage(1);
  }, []);

  // ── Loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donor Directory</h1>
          <p className="text-[var(--color-text-muted)]">Finding available donors for you...</p>
        </div>
        <LoadingState message="Loading donors..." />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donor Directory</h1>
          <p className="text-[var(--color-text-muted)]">Browse available blood donors.</p>
        </div>
        <ErrorState
          title="Failed to load donors"
          message={error}
          onRetry={loadDonors}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Donor Directory</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Find verified blood donors by blood group and district. Log in to view
          donor contact numbers.
        </p>
      </div>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by name or district..."
            className="flex-1"
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
          {filteredDonors.length === 0
            ? 'No donors found'
            : `Showing ${paginatedDonors.length} of ${filteredDonors.length} donor${filteredDonors.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filteredDonors.length === 0 && (
        <EmptyState
          title="No donors found"
          message="Try adjusting your search or filters to find donors."
          icon={FiUsers}
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

      {/* ── Donor grid ─────────────────────────────────────────── */}
      {filteredDonors.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {paginatedDonors.map(donor => (
              <DonorCard key={donor.id} donor={donor} showPhone={isAuthenticated} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDonors.length}
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
