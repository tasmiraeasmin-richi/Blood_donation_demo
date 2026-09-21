import { DONATION_ELIGIBILITY_DAYS } from './constants';

/**
 * Check if a donor is eligible to donate based on last donation date.
 * Eligibility = last_donation_date + 90 days has passed.
 */
export function isDonorEligible(lastDonationDate) {
  if (!lastDonationDate) return true; // Never donated — eligible
  const last = new Date(lastDonationDate);
  const eligibleAfter = new Date(last);
  eligibleAfter.setDate(eligibleAfter.getDate() + DONATION_ELIGIBILITY_DAYS);
  return new Date() >= eligibleAfter;
}

/**
 * Format a date string into a readable format.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

/**
 * Returns urgency label color class.
 */
export function urgencyClass(urgency) {
  const map = { critical: 'badge-critical', urgent: 'badge-urgent', normal: 'badge-normal' };
  return map[urgency] || 'badge-normal';
}

/**
 * Returns status label color class.
 */
export function statusClass(status) {
  const map = {
    pending: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)] border border-amber-200',
    approved: 'bg-[var(--color-success-bg)] text-[var(--color-success)] border border-emerald-200',
    rejected: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] border border-red-200',
    fulfilled: 'bg-[var(--color-neutral-bg)] text-[var(--color-neutral)] border border-slate-200',
  };
  return map[status] || '';
}
