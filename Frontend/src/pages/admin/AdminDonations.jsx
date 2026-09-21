import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiHeart, FiPlus } from 'react-icons/fi';
import { getAdminStats } from '../../api/stats';
import { listUsers } from '../../api/users';
import { listAllRequests } from '../../api/adminRequests';
import { createDonation } from '../../api/donations';
import StatCard from '../../components/cards/StatCard';
import LoadingState from '../../components/ui/feedback/LoadingState';
import ErrorState from '../../components/ui/feedback/ErrorState';
import EmptyState from '../../components/ui/feedback/EmptyState';
import Modal from '../../components/ui/modals/Modal';
import DonationForm from '../../components/forms/DonationForm';
import PrimaryButton from '../../components/ui/buttons/PrimaryButton';

export default function AdminDonations() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, usersData, requestsData] = await Promise.all([
        getAdminStats(),
        listUsers(),
        listAllRequests(),
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRequests(requestsData);
    } catch (err) {
      setError(err?.message || 'Failed to load donation data.');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react/set-state-in-effect
  useEffect(() => {
    loadData();
  }, []);

  const closeAddModal = () => setShowAdd(false);

  const handleAdd = async formData => {
    setFormSubmitting(true);
    try {
      await createDonation(formData);
      toast.success('Donation record added');
      closeAddModal();
      await loadData();
    } catch (err) {
      toast.error(err?.message || 'Failed to add donation');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donation Management</h1>
          <p className="text-[var(--color-text-muted)]">Loading donation records...</p>
        </div>
        <LoadingState message="Loading donations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Donation Management</h1>
          <p className="text-[var(--color-text-muted)]">Track and manage donation records.</p>
        </div>
        <ErrorState title="Failed to load donations" message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">Donation Management</h1>
          <p className="text-[var(--color-text-muted)] max-w-2xl">
            Platform-wide donation totals and recording new donations. Individual records live in each member&apos;s donation history.
          </p>
        </div>
        <PrimaryButton onClick={() => setShowAdd(true)} className="gap-2 sm:flex-shrink-0">
          <FiPlus className="w-4 h-4" /> Add Donation
        </PrimaryButton>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-6">
        <StatCard label="Total Donations" value={stats?.donations.total ?? null} icon={FiHeart} color="danger" />
        <StatCard label="Total Units" value={stats?.donations.total_units ?? null} icon={FiHeart} color="primary" />
        <StatCard label="Unique Donors" value={stats?.donations.unique_donors ?? null} icon={FiHeart} color="success" />
      </div>

      <div className="card-rs p-6">
        <EmptyState
          title="Donation records live with members"
          message="The API exposes donation history per member. Record new donations with the button above; members see their own history under Donation History."
          icon={FiHeart}
        />
      </div>

      {/* ── Add modal ──────────────────────────────────── */}
      <Modal open={showAdd} onClose={closeAddModal} title="Add Donation" size="lg">
        <DonationForm
          key="donation-new"
          donors={users}
          requests={requests}
          onSubmit={handleAdd}
          submitting={formSubmitting}
          submitLabel="Add Donation"
          onCancel={closeAddModal}
        />
      </Modal>
    </div>
  );
}
