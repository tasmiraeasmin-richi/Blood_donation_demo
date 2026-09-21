// Blood groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Bangladesh districts (partial list — expand as needed)
export const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal',
  'Sylhet', 'Rangpur', 'Mymensingh', 'Comilla', 'Gazipur',
  'Narayanganj', 'Tangail', 'Bogra', 'Jessore', 'Dinajpur',
];

// Request urgency levels
export const URGENCY_LEVELS = ['normal', 'urgent', 'critical'];

// Request statuses
export const REQUEST_STATUSES = ['pending', 'approved', 'rejected', 'fulfilled'];

// Offer statuses
export const OFFER_STATUSES = ['offered', 'accepted', 'declined'];

// User roles
export const USER_ROLES = ['member', 'admin'];

// Donor eligibility window (days)
export const DONATION_ELIGIBILITY_DAYS = 90;

// API base URL (set via .env)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
