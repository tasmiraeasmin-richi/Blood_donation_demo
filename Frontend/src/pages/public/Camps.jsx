import { useState, useEffect, useMemo, useCallback } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { listCamps } from '../../api/camps';
import { DISTRICTS } from '../../utils/constants';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import CampCard from '../../components/cards/CampCard';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'district',
    label: 'District',
    options: DISTRICTS.map(d => ({ value: d, label: d })),
  },
];

const sortOptions = [
  { value: 'date_asc', label: 'Date (Earliest)' },
  { value: 'date_desc', label: 'Date (Latest)' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
];

function sortCamps(camps, sortValue) {
  if (!sortValue) return camps;

  const [field, order] = sortValue.split('_').reduce(
    (acc, part, i, arr) => {
      if (i === 0) return [part, ''];
      if (i === arr.length - 1) return [acc[0], part];
      return [acc[0] + '_' + part, acc[1]];
    },
    ['', '']
  );

  const sorted = [...camps];
  sorted.sort((a, b) => {
    let comparison = 0;

    if (field === 'date') {
      comparison = new Date(a.date) - new Date(b.date);
    } else if (field === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

const TABS = [
  { value: 'all', label: 'All Camps' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
];

export default function Camps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ district: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusTab, setStatusTab] = useState('all');

  const loadCamps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCamps(await listCamps());
    } catch (err) {
      setError(err?.message || 'Failed to load camps.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    listCamps().then(
      data => { setCamps(data); setError(null); setLoading(false); },
      err => { setError(err?.message || 'Failed to load camps.'); setLoading(false); }
    );
  }, []);

  const filteredCamps = useMemo(() => {
    let result = [...camps];

    // Status tab filter
    if (statusTab !== 'all') {
      result = result.filter(c => c.status === statusTab);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.organizer.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.venue.toLowerCase().includes(q)
      );
    }

    if (filters.district) {
      result = result.filter(c => c.district === filters.district);
    }

    result = sortCamps(result, sort);

    return result;
  }, [camps, search, filters, sort, statusTab]);

  const totalPages = Math.ceil(filteredCamps.length / ITEMS_PER_PAGE);
  const paginatedCamps = filteredCamps.slice(
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
    setFilters({ district: '' });
    setSearch('');
    setSort('');
    setStatusTab('all');
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback(val => {
    setSort(val);
    setCurrentPage(1);
  }, []);

  const handleTabChange = useCallback(tab => {
    setStatusTab(tab);
    setCurrentPage(1);
  }, []);

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blood Camps</h1>
          <p className="text-[var(--color-text-muted)]">Finding upcoming blood donation camps...</p>
        </div>
        <LoadingState message="Loading camps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blood Camps</h1>
          <p className="text-[var(--color-text-muted)]">Browse blood donation camps near you.</p>
        </div>
        <ErrorState
          title="Failed to load camps"
          message={error}
          onRetry={loadCamps}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blood Camps</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Find upcoming blood donation camps organized by trusted organizations across Bangladesh.
          Donate blood and help save lives in your community.
        </p>
      </div>

      {/* ── Status Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1 border-b border-[var(--color-surface-3)] mb-6">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              statusTab === tab.value
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Search & Filters ───────────────────────────────────── */}
      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by camp name, organizer, venue, or district..."
            className="flex-1"
          />
          <SortSelect
            options={sortOptions}
            value={sort}
            onChange={handleSort}
            className="sm:w-48"
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
          {filteredCamps.length === 0
            ? 'No camps found'
            : `Showing ${paginatedCamps.length} of ${filteredCamps.length} camp${filteredCamps.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Empty state ────────────────────────────────────────── */}
      {filteredCamps.length === 0 && (
        <EmptyState
          title="No blood camps found"
          message="Try adjusting your search or filters to find blood donation camps."
          icon={FiCalendar}
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

      {/* ── Camp grid ──────────────────────────────────────────── */}
      {filteredCamps.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {paginatedCamps.map(camp => (
              <CampCard key={camp.id} camp={camp} />
            ))}
          </div>

          {/* ── Pagination ──────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCamps.length}
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
