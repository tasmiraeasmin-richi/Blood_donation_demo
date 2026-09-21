import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiSlash, FiCheckCircle, FiShield, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { listUsers, setUserStatus, setUserRole, deleteUser } from '../../api/users';
import { DISTRICTS, USER_ROLES } from '../../utils/constants';
import SearchBar from '../../components/ui/data/SearchBar';
import FilterPanel from '../../components/ui/data/FilterPanel';
import SortSelect from '../../components/ui/data/SortSelect';
import Pagination, { PaginationInfo } from '../../components/ui/data/Pagination';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import AvailabilityBadge from '../../components/ui/badges/AvailabilityBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import Modal from '../../components/ui/modals/Modal';
import ConfirmationModal from '../../components/ui/modals/ConfirmationModal';
import SelectInput from '../../components/forms/SelectInput';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';
import SecondaryButton from '../../components/ui/buttons/SecondaryButton';

const ITEMS_PER_PAGE = 9;

const filterConfig = [
  {
    name: 'role',
    label: 'Role',
    options: USER_ROLES.map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })),
  },
  {
    name: 'status',
    label: 'Status',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'blocked', label: 'Blocked' },
    ],
  },
  {
    name: 'district',
    label: 'District',
    options: DISTRICTS.map(d => ({ value: d, label: d })),
  },
];

const sortOptions = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'email_asc', label: 'Email (A-Z)' },
  { value: 'email_desc', label: 'Email (Z-A)' },
];

function RoleBadge({ role }) {
  const style =
    role === 'admin'
      ? 'bg-[var(--color-primary-lt)] text-[var(--color-primary)] border border-red-200'
      : 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}>
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : '—'}
    </span>
  );
}

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadUsers();
  }, []);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ role: '', status: '', district: '' });
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [blockTarget, setBlockTarget] = useState(null);
  const [unblockTarget, setUnblockTarget] = useState(null);
  const [roleTarget, setRoleTarget] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isSelf = row => row.id === user?.id || row.email === user?.email;

  let filteredUsers = [...users];
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredUsers = filteredUsers.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
    );
  }
  if (filters.role) filteredUsers = filteredUsers.filter(u => u.role === filters.role);
  if (filters.status) filteredUsers = filteredUsers.filter(u => u.status === filters.status);
  if (filters.district) filteredUsers = filteredUsers.filter(u => u.district === filters.district);
  if (sort === 'name_asc') filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'name_desc') filteredUsers.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === 'email_asc') filteredUsers.sort((a, b) => a.email.localeCompare(b.email));
  if (sort === 'email_desc') filteredUsers.sort((a, b) => b.email.localeCompare(a.email));

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = val => { setSearch(val); setCurrentPage(1); };
  const handleFilterChange = (name, val) => { setFilters(prev => ({ ...prev, [name]: val })); setCurrentPage(1); };
  const handleResetFilters = () => { setFilters({ role: '', status: '', district: '' }); setSearch(''); setSort(''); setCurrentPage(1); };
  const handleSort = val => { setSort(val); setCurrentPage(1); };

  const handleConfirmBlock = async () => {
    if (!blockTarget || isSelf(blockTarget)) return;
    setActionLoading(true);
    try {
      await setUserStatus(blockTarget.id, 'blocked');
      toast.success(`${blockTarget.name} has been blocked`);
      setBlockTarget(null);
      await loadUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmUnblock = async () => {
    if (!unblockTarget || isSelf(unblockTarget)) return;
    setActionLoading(true);
    try {
      await setUserStatus(unblockTarget.id, 'active');
      toast.success(`${unblockTarget.name} has been unblocked`);
      setUnblockTarget(null);
      await loadUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmRole = async () => {
    if (!roleTarget || !newRole || isSelf(roleTarget)) return;
    setActionLoading(true);
    try {
      await setUserRole(roleTarget.id, newRole);
      toast.success(`${roleTarget.name} is now ${newRole === 'admin' ? 'an admin' : 'a member'}`);
      setRoleTarget(null);
      setNewRole('');
      await loadUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to change user role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isSelf(deleteTarget)) return;
    setActionLoading(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`${deleteTarget.name} has been deleted`);
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = row => {
    setRoleTarget(row);
    setNewRole(row.role === 'admin' ? 'member' : 'admin');
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-[var(--color-text-muted)]">Loading users...</p>
        </div>
        <LoadingState message="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-[var(--color-text-muted)]">Manage platform users and roles.</p>
        </div>
        <ErrorState title="Failed to load users" message={error} onRetry={loadUsers} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Manage platform users: block or unblock accounts, change roles, or remove users. Your own admin account is protected from these actions.
        </p>
      </div>

      <div className="card-rs p-4 sm:p-5 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email, or phone..."
            className="flex-1"
          />
          <SortSelect options={sortOptions} value={sort} onChange={handleSort} className="sm:w-48" />
        </div>
        <FilterPanel filters={filterConfig} values={filters} onChange={handleFilterChange} onReset={handleResetFilters} />
      </div>

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {filteredUsers.length === 0
            ? 'No users found'
            : `Showing ${paginatedUsers.length} of ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {filteredUsers.length === 0 && (
        <EmptyState
          title="No users found"
          message="Try adjusting your search or filters to find users."
          icon={FiUsers}
        />
      )}

      {filteredUsers.length > 0 && (
        <>
          {/* ── Desktop table ─────────────────────────────── */}
          <div className="hidden lg:block card-rs overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="table w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-[var(--color-text-muted)] border-b border-[var(--color-surface-3)]">
                    <th className="text-left font-medium px-4 py-3">User</th>
                    <th className="text-left font-medium px-4 py-3">Phone</th>
                    <th className="text-left font-medium px-4 py-3">Role</th>
                    <th className="text-left font-medium px-4 py-3">Blood</th>
                    <th className="text-left font-medium px-4 py-3">District</th>
                    <th className="text-left font-medium px-4 py-3">Availability</th>
                    <th className="text-left font-medium px-4 py-3">Status</th>
                    <th className="text-right font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map(row => {
                    const self = isSelf(row);
                    return (
                      <tr key={row.id} className="border-b border-[var(--color-surface-3)] last:border-0 hover:bg-[var(--color-surface-2)]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-lt)] flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-[var(--color-primary)]">
                                {(row.name || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[var(--color-text)] truncate">
                                {row.name}{self && <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">(you)</span>}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)] truncate">{row.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-text)] whitespace-nowrap">{row.phone || '—'}</td>
                        <td className="px-4 py-3"><RoleBadge role={row.role} /></td>
                        <td className="px-4 py-3"><BloodGroupBadge bloodGroup={row.blood_group} size="sm" /></td>
                        <td className="px-4 py-3 text-[var(--color-text-muted)]">{row.district}</td>
                        <td className="px-4 py-3"><AvailabilityBadge available={row.is_available} /></td>
                        <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {row.status === 'active' ? (
                              <button
                                onClick={() => setBlockTarget(row)}
                                disabled={self}
                                className="btn btn-sm btn-ghost text-[var(--color-warning)] disabled:opacity-30 disabled:cursor-not-allowed"
                                title={self ? 'You cannot block your own account' : 'Block user'}
                                aria-label={`Block ${row.name}`}
                              >
                                <FiSlash className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => setUnblockTarget(row)}
                                disabled={self}
                                className="btn btn-sm btn-ghost text-[var(--color-success)] disabled:opacity-30 disabled:cursor-not-allowed"
                                title={self ? 'You cannot unblock your own account' : 'Unblock user'}
                                aria-label={`Unblock ${row.name}`}
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => openRoleModal(row)}
                              disabled={self}
                              className="btn btn-sm btn-ghost text-[var(--color-text-muted)] hover:text-[var(--color-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
                              title={self ? 'You cannot change your own role' : 'Change role'}
                              aria-label={`Change role of ${row.name}`}
                            >
                              <FiShield className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(row)}
                              disabled={self}
                              className="btn btn-sm btn-ghost text-[var(--color-danger)] disabled:opacity-30 disabled:cursor-not-allowed"
                              title={self ? 'You cannot delete your own account' : 'Delete user'}
                              aria-label={`Delete ${row.name}`}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Mobile cards ──────────────────────────────── */}
          <div className="lg:hidden space-y-3 mb-6">
            {paginatedUsers.map(row => {
              const self = isSelf(row);
              return (
                <div key={row.id} className="card-rs p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary-lt)] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[var(--color-primary)]">
                        {(row.name || '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[var(--color-text)] truncate">
                        {row.name}{self && <span className="ml-1.5 text-xs font-normal text-[var(--color-text-muted)]">(you)</span>}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{row.email} · {row.phone}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <RoleBadge role={row.role} />
                    <StatusBadge status={row.status} />
                    <AvailabilityBadge available={row.is_available} />
                    <BloodGroupBadge bloodGroup={row.blood_group} size="sm" />
                    <span className="text-xs text-[var(--color-text-muted)]">{row.district}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {row.status === 'active' ? (
                      <button onClick={() => setBlockTarget(row)} disabled={self} className="btn btn-sm btn-ghost gap-1 text-[var(--color-warning)] disabled:opacity-30" aria-label={`Block ${row.name}`}>
                        <FiSlash className="w-4 h-4" /> Block
                      </button>
                    ) : (
                      <button onClick={() => setUnblockTarget(row)} disabled={self} className="btn btn-sm btn-ghost gap-1 text-[var(--color-success)] disabled:opacity-30" aria-label={`Unblock ${row.name}`}>
                        <FiCheckCircle className="w-4 h-4" /> Unblock
                      </button>
                    )}
                    <button onClick={() => openRoleModal(row)} disabled={self} className="btn btn-sm btn-ghost gap-1 text-[var(--color-text-muted)] disabled:opacity-30" aria-label={`Change role of ${row.name}`}>
                      <FiShield className="w-4 h-4" /> Role
                    </button>
                    <button onClick={() => setDeleteTarget(row)} disabled={self} className="btn btn-sm btn-ghost gap-1 text-[var(--color-danger)] disabled:opacity-30" aria-label={`Delete ${row.name}`}>
                      <FiTrash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-2 flex flex-col items-center gap-3">
              <PaginationInfo currentPage={currentPage} totalPages={totalPages} totalItems={filteredUsers.length} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}

      {/* ── Block confirmation (destructive) ─────────────── */}
      <ConfirmationModal
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={handleConfirmBlock}
        title="Block User"
        message={blockTarget ? `Block ${blockTarget.name} (${blockTarget.email})? They will no longer be able to use the platform.` : ''}
        confirmLabel="Block"
        variant="warning"
        loading={actionLoading}
      />

      {/* ── Unblock confirmation ─────────────────────────── */}
      <Modal open={!!unblockTarget} onClose={() => setUnblockTarget(null)} title="Unblock User" size="sm">
        {unblockTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Unblock <span className="font-medium text-[var(--color-text)]">{unblockTarget.name}</span> ({unblockTarget.email})? They will regain access to the platform.
            </p>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => setUnblockTarget(null)} fullWidth disabled={actionLoading}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleConfirmUnblock} fullWidth loading={actionLoading}>
                Unblock
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Change role ──────────────────────────────────── */}
      <Modal open={!!roleTarget} onClose={() => { setRoleTarget(null); setNewRole(''); }} title="Change User Role" size="sm">
        {roleTarget && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              Change role for <span className="font-medium text-[var(--color-text)]">{roleTarget.name}</span> (currently <RoleBadge role={roleTarget.role} />).
            </p>
            <SelectInput
              label="New Role"
              required
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
            >
              {USER_ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </SelectInput>
            <div className="flex gap-3">
              <SecondaryButton onClick={() => { setRoleTarget(null); setNewRole(''); }} fullWidth disabled={actionLoading}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleConfirmRole} fullWidth loading={actionLoading} disabled={!newRole || newRole === roleTarget.role}>
                Save Role
              </PrimaryButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete confirmation (destructive) ────────────── */}
      <ConfirmationModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={deleteTarget ? `Permanently delete ${deleteTarget.name} (${deleteTarget.email})? This action cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        loading={actionLoading}
      />
    </div>
  );
}
