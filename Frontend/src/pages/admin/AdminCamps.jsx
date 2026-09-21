import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { listCamps, createCamp, updateCamp, deleteCamp } from '../../api/camps';
import { DISTRICTS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import Modal from '../../components/ui/modals/Modal';
import ConfirmationModal from '../../components/ui/modals/ConfirmationModal';
import CampForm from '../../components/forms/CampForm';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'status',
    label: 'Status',
    options: [
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'completed', label: 'Completed' },
    ],
  },
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

export default function AdminCamps() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCamps = async () => {
    setLoading(true);
    setError(null);
    try {
      setCamps(await listCamps());
    } catch (err) {
      setError(err?.message || 'Failed to load camps.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadCamps();
  }, []);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', district: '' });
  const [sort, setSort] = useState('date_asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  let filteredCamps = [...camps];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredCamps = filteredCamps.filter(
      c =>
        c.title.toLowerCase().includes(q) ||
        c.organizer.toLowerCase().includes(q) ||
        c.venue.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q)
    );
  }
  if (filters.status) filteredCamps = filteredCamps.filter(c => c.status === filters.status);
  if (filters.district) filteredCamps = filteredCamps.filter(c => c.district === filters.district);
  filteredCamps.sort((a, b) => {
    if (sort === 'date_desc') return new Date(b.date) - new Date(a.date);
    if (sort === 'title_asc') return a.title.localeCompare(b.title);
    if (sort === 'title_desc') return b.title.localeCompare(a.title);
    return new Date(a.date) - new Date(b.date);
  });

  const totalPages = Math.ceil(filteredCamps.length / ITEMS_PER_PAGE);
  const paginatedCamps = filteredCamps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ status: '', district: '' }); setSearch(''); setSort('date_asc'); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const closeFormModals = () => {
    setShowAdd(false);
    setEditing(null);
  };

  const handleAdd = async formData => {
    setFormSubmitting(true);
    try {
      await createCamp(formData);
      toast.success('Blood camp added');
      closeFormModals();
      setCurrentPage(1);
      await loadCamps();
    } catch (err) {
      toast.error(err?.message || 'Failed to add camp');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = async formData => {
    if (!editing) return;
    setFormSubmitting(true);
    try {
      await updateCamp(editing.id, formData);
      toast.success('Blood camp updated');
      closeFormModals();
      await loadCamps();
    } catch (err) {
      toast.error(err?.message || 'Failed to update camp');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      await deleteCamp(deleteTarget.id);
      toast.success('Blood camp deleted');
      setDeleteTarget(null);
      await loadCamps();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete camp');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Camp Management</h1>
          <p className="text-[var(--color-text-muted)]">Loading blood camps...</p>
        </div>
        <LoadingState message="Loading camps..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Camp Management</h1>
          <p className="text-[var(--color-text-muted)]">Create and manage blood donation camps.</p>
        </div>
        <ErrorState title="Failed to load camps" message={error} onRetry={loadCamps} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Camp Management</h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            Create and manage blood donation camps: title, organizer, district, venue, date, and status.
          </p>
        </div>
        <PrimaryButton onClick={() => setShowAdd(true)} className="gap-2 sm:flex-shrink-0">
          <FiPlus className="w-4 h-4" /> Add Camp
        </PrimaryButton>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by title, organizer, venue, or district..."
            className="flex-1"
          />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-48" />
        </div>
        <FilterPanel filters={filterConfig} values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredCamps.length === 0
            ? 'No camps found'
            : `Showing ${paginatedCamps.length} of ${filteredCamps.length} camp${filteredCamps.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filteredCamps.length === 0 && (
        <EmptyState
          title="No camps found"
          message="Try adjusting your search or filters, or add a new blood camp."
          icon={FiCalendar}
        />
      )}

      {filteredCamps.length > 0 && (
        <>
          {/* ── Desktop table ─────────────────────────────── */}
          <div className="hidden lg:block card-rs overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="table w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-surface-3)]">
                    <th className="text-left font-medium px-4 py-3">Title</th>
                    <th className="text-left font-medium px-4 py-3">Organizer</th>
                    <th className="text-left font-medium px-4 py-3">District</th>
                    <th className="text-left font-medium px-4 py-3">Venue</th>
                    <th className="text-left font-medium px-4 py-3">Date</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-right font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCamps.map(camp => (
                    <tr key={camp.id} className="border-b border-[var(--color-surface-3)] last:border-0 hover:bg-[var(--color-surface-2)]">
                      <td className="px-4 py-3 font-medium text-[var(--color-text)]">{camp.title}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{camp.organizer}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{camp.district}</td>
                      <td className="px-4 py-3 text-[var(--color-text-muted)]">{camp.venue}</td>
                      <td className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">{formatDate(camp.date)}</td>
                      <td className="px-4 py-3"><StatusBadge status={camp.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(camp)} className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-primary)]" title="Edit" aria-label={`Edit camp ${camp.title}`}>
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(camp)} className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" title="Delete" aria-label={`Delete camp ${camp.title}`}>
                            <FiTrash2 className="w-4 h-4" />
                          </button>
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
            {paginatedCamps.map(camp => (
              <div key={camp.id} className="card-rs p-4">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[var(--color-text)]">{camp.title}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{camp.organizer}</p>
                  </div>
                  <StatusBadge status={camp.status} />
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mb-3">
                  {camp.venue} · {camp.district} · {formatDate(camp.date)}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(camp)} className="btn btn-sm btn-ghost gap-1 text-[var(--color-text-muted)]" aria-label={`Edit camp ${camp.title}`}>
                    <FiEdit2 className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => setDeleteTarget(camp)} className="btn btn-sm btn-ghost gap-1 text-[var(--color-danger)]" aria-label={`Delete camp ${camp.title}`}>
                    <FiTrash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredCamps.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}

      {/* ── Add modal ──────────────────────────────────── */}
      <Modal open={showAdd} onClose={closeFormModals} title="Add Blood Camp" size="lg">
        <CampForm
          key="camp-new"
          onSubmit={handleAdd}
          submitting={formSubmitting}
          submitLabel="Add Camp"
          onCancel={closeFormModals}
        />
      </Modal>

      {/* ── Edit modal ─────────────────────────────────── */}
      <Modal open={!!editing} onClose={closeFormModals} title={editing ? 'Edit Blood Camp' : 'Edit Blood Camp'} size="lg">
        {editing && (
          <CampForm
            key={`camp-${editing.id}`}
            initialData={editing}
            onSubmit={handleEdit}
            submitting={formSubmitting}
            submitLabel="Save Changes"
            onCancel={closeFormModals}
          />
        )}
      </Modal>

      {/* ── Delete confirmation ────────────────────────── */}
      <ConfirmationModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Blood Camp"
        message={deleteTarget ? `Delete "${deleteTarget.title}" organized by ${deleteTarget.organizer}? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
