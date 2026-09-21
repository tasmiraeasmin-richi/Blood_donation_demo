import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiUsers, FiClock, FiCheckCircle, FiHeart, FiCalendar,
  FiFileText, FiArrowRight,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getAdminStats } from '../../api/stats';
import { listAllRequests } from '../../api/adminRequests';
import { listUsers } from '../../api/users';
import { listCamps } from '../../api/camps';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/ui/badges/StatusBadge';
import BloodGroupBadge from '../../components/ui/badges/BloodGroupBadge';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';

function SectionHeader({ title, to, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      <Link
        to={to}
        className="inline-flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        {linkLabel}
        <FiArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [camps, setCamps] = useState([]);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, requestsData, usersData, campsData] = await Promise.all([
        getAdminStats(),
        listAllRequests(),
        listUsers(),
        listCamps(),
      ]);
      setStats(statsData);
      setRequests(requestsData);
      setUsers(usersData);
      setCamps(campsData);
    } catch (err) {
      setError(err?.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadDashboard();
  }, []);

  const kpis = [
    { label: 'Total Users', value: stats ? stats.users.total : null, icon: FiUsers, color: 'primary' },
    { label: 'Pending Requests', value: stats ? stats.requests.pending : null, icon: FiClock, color: 'warning' },
    { label: 'Approved Requests', value: stats ? stats.requests.approved : null, icon: FiCheckCircle, color: 'success' },
    { label: 'Donations', value: stats ? stats.donations.total : null, icon: FiHeart, color: 'danger' },
    { label: 'Blood Camps', value: stats ? stats.camps.total : null, icon: FiCalendar, color: 'info' },
  ];

  const pendingRequests = requests.filter(r => r.status === 'pending').slice(0, 5);
  const recentUsers = users.slice(0, 5);
  const recentCamps = [...camps].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">Loading platform overview...</p>
        </div>
        <LoadingState message="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">Platform overview and management.</p>
        </div>
        <ErrorState title="Failed to load dashboard" message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Welcome back, {user?.name || 'Admin'}</h1>
        <p className="text-[var(--color-text-muted)] max-w-2xl">
          Platform overview at a glance. Review pending requests, monitor users, donations, and camps.
        </p>
      </div>

      {/* ── KPI cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mb-8">
        {kpis.map(kpi => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ── Content sections ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent pending requests */}
        <section aria-labelledby="pending-requests-heading" className="card-rs p-6">
          <SectionHeader title="Recent Pending Requests" to="/admin/requests" linkLabel="Manage requests" />
          <h2 id="pending-requests-heading" className="sr-only">Recent pending requests</h2>
          {pendingRequests.length === 0 ? (
            <EmptyState title="No pending requests" message="All blood requests have been reviewed." icon={FiFileText} />
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(request => (
                <div key={request.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <BloodGroupBadge bloodGroup={request.blood_group} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)]">{request.patient_name}</span>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {request.request_code} · {request.units} unit{request.units !== 1 ? 's' : ''} · {request.hospital} · Required {formatDate(request.required_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent users */}
        <section aria-labelledby="recent-users-heading" className="card-rs p-6">
          <SectionHeader title="Recent Users" to="/admin/users" linkLabel="Manage users" />
          <h2 id="recent-users-heading" className="sr-only">Recent users</h2>
          {recentUsers.length === 0 ? (
            <EmptyState title="No users found" message="No user records to display." icon={FiUsers} />
          ) : (
            <div className="space-y-3">
              {recentUsers.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary-lt)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[var(--color-primary)]">
                      {(member.name || '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)] truncate">{member.name}</span>
                      <RoleBadge role={member.role} />
                      <StatusBadge status={member.status} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {member.email} · {member.district}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Donation overview (the API exposes donation totals, not a record list) */}
        <section aria-labelledby="recent-donations-heading" className="card-rs p-6">
          <SectionHeader title="Donation Overview" to="/admin/donations" linkLabel="Manage donations" />
          <h2 id="recent-donations-heading" className="sr-only">Donation overview</h2>
          {!stats ? (
            <EmptyState title="No donation data" message="Donation statistics are not available yet." icon={FiHeart} />
          ) : (
            <div className="space-y-3">
              {[
                { label: 'Total Donations', value: stats.donations.total },
                { label: 'Total Units Donated', value: stats.donations.total_units },
                { label: 'Unique Donors', value: stats.donations.unique_donors },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-danger-bg)] flex items-center justify-center flex-shrink-0">
                    <FiHeart className="w-4 h-4 text-[var(--color-danger)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--color-text-muted)]">{row.label}</p>
                    <p className="text-lg font-bold text-[var(--color-text)]">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent camps */}
        <section aria-labelledby="recent-camps-heading" className="card-rs p-6">
          <SectionHeader title="Recent Camps" to="/admin/camps" linkLabel="Manage camps" />
          <h2 id="recent-camps-heading" className="sr-only">Recent camps</h2>
          {recentCamps.length === 0 ? (
            <EmptyState title="No camps found" message="No camp records to display." icon={FiCalendar} />
          ) : (
            <div className="space-y-3">
              {recentCamps.map(camp => (
                <div key={camp.id} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-surface-2)]">
                  <div className="w-9 h-9 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center flex-shrink-0">
                    <FiCalendar className="w-4 h-4 text-[var(--color-info)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[var(--color-text)] truncate">{camp.title}</span>
                      <StatusBadge status={camp.status} />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">
                      {camp.organizer} · {camp.district} · {formatDate(camp.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ── Quick management actions ───────────────────────── */}
      <section aria-labelledby="quick-actions-heading" className="card-rs p-6">
        <h2 id="quick-actions-heading" className="text-lg font-semibold text-[var(--color-text)] mb-4">
          Quick Management Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/requests" className="card-rs p-5 hover:shadow-md transition-shadow block text-center group border border-[var(--color-surface-3)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-warning-bg)] flex items-center justify-center mx-auto mb-3">
              <FiFileText className="w-6 h-6 text-[var(--color-warning)]" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Review Requests</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Approve or reject pending blood requests</p>
          </Link>
          <Link to="/admin/users" className="card-rs p-5 hover:shadow-md transition-shadow block text-center group border border-[var(--color-surface-3)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-lt)] flex items-center justify-center mx-auto mb-3">
              <FiUsers className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Manage Users</h3>
            <p className="text-xs text-[var(--color-text-muted)]">View, block, or manage platform users</p>
          </Link>
          <Link to="/admin/donations" className="card-rs p-5 hover:shadow-md transition-shadow block text-center group border border-[var(--color-surface-3)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-danger-bg)] flex items-center justify-center mx-auto mb-3">
              <FiHeart className="w-6 h-6 text-[var(--color-danger)]" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Track Donations</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Monitor donation records and history</p>
          </Link>
          <Link to="/admin/camps" className="card-rs p-5 hover:shadow-md transition-shadow block text-center group border border-[var(--color-surface-3)]">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-info-bg)] flex items-center justify-center mx-auto mb-3">
              <FiCalendar className="w-6 h-6 text-[var(--color-info)]" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--color-text)] mb-1">Organize Camps</h3>
            <p className="text-xs text-[var(--color-text-muted)]">Create and manage blood donation camps</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
