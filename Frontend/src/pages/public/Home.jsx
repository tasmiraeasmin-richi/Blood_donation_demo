import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiSearch, FiUserPlus, FiDroplet, FiFileText, FiHeart,
  FiCalendar, FiShield, FiCheckCircle, FiArrowRight,
  FiUsers, FiLock, FiPhone, FiActivity, FiTarget
} from 'react-icons/fi';
import { listPublicRequests } from '../../api/requests';
import { listCamps } from '../../api/camps';
import { listDonors } from '../../api/donors';
import RequestCard from '../../components/cards/RequestCard';
import CampCard from '../../components/cards/CampCard';
import DonorCard from '../../components/cards/DonorCard';
import StatCard from '../../components/cards/StatCard';
import { useAuth } from '../../contexts/AuthContext';

const quickActions = [
  {
    to: '/requests',
    icon: FiFileText,
    title: 'Blood Requests',
    desc: 'Browse active blood donation requests in your area.',
    color: 'danger',
  },
  {
    to: '/donors',
    icon: FiSearch,
    title: 'Find Donors',
    desc: 'Search for available donors by blood group and district.',
    color: 'info',
  },
  {
    to: '/camps',
    icon: FiCalendar,
    title: 'Blood Camps',
    desc: 'Find upcoming blood donation camps near you.',
    color: 'success',
  },
];

const howItWorks = [
  { icon: FiFileText, title: 'Request', desc: 'Patient or representative submits a blood request with details.' },
  { icon: FiHeart, title: 'Donor Offer', desc: 'Eligible donors see the request and offer to donate.' },
  { icon: FiCheckCircle, title: 'Accept', desc: 'Requester reviews offers and accepts a matching donor.' },
  { icon: FiTarget, title: 'Fulfill', desc: 'Donation happens at the hospital. Request marked fulfilled.' },
];

const trustItems = [
  {
    icon: FiShield,
    title: 'Verified Requests',
    desc: 'Every blood request goes through admin review before appearing publicly. This helps ensure that requests are genuine and patients are real.',
  },
  {
    icon: FiLock,
    title: 'Privacy Protection',
    desc: 'Donor phone numbers and personal details are only revealed after a donation offer is accepted. Public pages never expose sensitive contact information.',
  },
  {
    icon: FiCheckCircle,
    title: 'Responsible Donation',
    desc: 'We enforce a 90-day minimum gap between donations for donor safety. Eligible donors are clearly indicated so requests go to available people.',
  },
];

const colorMap = {
  danger: { bg: 'bg-[var(--color-danger-bg)]', icon: 'text-[var(--color-danger)]' },
  info: { bg: 'bg-[var(--color-info-bg)]', icon: 'text-[var(--color-info)]' },
  success: { bg: 'bg-[var(--color-success-bg)]', icon: 'text-[var(--color-success)]' },
};

export default function Home() {
  const { isAuthenticated, isMember, isAdmin } = useAuth();
  const [requests, setRequests] = useState(null);
  const [camps, setCamps] = useState(null);
  const [donors, setDonors] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [reqData, campData, donorData] = await Promise.all([
          listPublicRequests(),
          listCamps(),
          listDonors(),
        ]);
        if (!cancelled) {
          setRequests(reqData);
          setCamps(campData);
          setDonors(donorData);
        }
      } catch {
        if (!cancelled) {
          setRequests([]);
          setCamps([]);
          setDonors([]);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const upcomingCamps = (camps || []).filter(c => c.status === 'upcoming');
  const activeRequests = requests || [];
  const availableDonors = donors || [];

  // Home previews show live API data only (max 3 each). Empty lists render a
  // simple empty state below — no demo/fallback data is used anywhere.
  const loaded = requests !== null && camps !== null && donors !== null;
  const shownCamps = upcomingCamps.slice(0, 3);
  const shownRequests = activeRequests.slice(0, 3);
  const shownDonors = availableDonors.slice(0, 3);

  return (
    <div>
      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-dk)] to-[#7a0c18] text-white overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.06]" aria-hidden="true">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="page-container relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <FiDroplet className="w-4 h-4" />
              Blood Donation &amp; Emergency Assistance
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Every Drop Counts.
              <br />
              <span className="text-[var(--color-primary-lt)]">Every Life Matters.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-8 max-w-2xl mx-auto">
              RaktoSetu connects blood donors with patients in need across Bangladesh.
              Find emergency blood, offer to donate, or organize a blood camp — all in one trusted platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/requests"
                className="flex items-center gap-2 btn bg-white text-[var(--color-primary)] hover:bg-white/90 border-0 font-semibold px-6"
              >
                <FiSearch className="w-4 h-4" />
                Find Blood
              </Link>
              {/* Become a Donor: guests -> login (returns to /become-donor),
                  members -> donor availability page. Hidden for admins. */}
              {!isAdmin && (
                <Link
                  to={isAuthenticated && isMember ? '/become-donor' : isAuthenticated ? '/dashboard' : '/login'}
                  state={isAuthenticated ? undefined : { from: { pathname: '/become-donor' } }}
                  className="flex items-center gap-2 btn btn-outline border-white/40 text-white hover:bg-white/10 hover:border-white/60 px-6"
                >
                  <FiUserPlus className="w-4 h-4" />
                  Become a Donor
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-8 sm:h-12 lg:h-16">
            <path d="M0 60L60 52C120 44 240 28 360 22C480 16 600 20 720 26C840 32 960 40 1080 42C1200 44 1320 40 1380 38L1440 36V60H0Z" fill="var(--color-surface-2)" />
          </svg>
        </div>
      </section>

      {/* ─── QUICK ACTION SECTION ──────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-[var(--color-surface-2)]">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">What Do You Need?</h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
              Quick access to the most important features of RaktoSetu.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {quickActions.map(action => {
              const c = colorMap[action.color];
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="card-rs p-6 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center mb-4`}>
                    <action.icon className={`w-6 h-6 ${c.icon}`} />
                  </div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    {action.desc}
                  </p>
                  <div className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] mt-3 group-hover:gap-2 transition-all">
                    Explore <FiArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW RAKTOSETU WORKS ───────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">How RaktoSetu Works</h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
              A simple four-step process from request to fulfillment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, idx) => (
              <div key={step.title} className="relative text-center">
                {/* Connector line (hidden on mobile, visible lg+) */}
                {idx < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-[2px] bg-[var(--color-surface-3)]" aria-hidden="true" />
                )}

                <div className="relative z-10 w-16 h-16 rounded-full bg-[var(--color-primary-lt)] flex items-center justify-center mx-auto mb-4 border-4 border-white">
                  <step.icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <span className="inline-block text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-lt)] rounded-full px-2 py-0.5 mb-2">
                  Step {idx + 1}
                </span>
                <h3 className="font-semibold text-[var(--color-text)] mb-1">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-[220px] mx-auto">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── IMPACT / STATISTICS ───────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-[var(--color-surface-2)]">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Our Impact</h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
              Numbers that reflect the growing community of donors and lives touched.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <StatCard
              label="Available Donors"
              value={donors == null ? null : donors.length.toLocaleString()}
              icon={FiUsers}
              color="primary"
            />
            <StatCard
              label="Active Requests"
              value={requests == null ? null : requests.length}
              icon={FiActivity}
              color="danger"
            />
            <StatCard
              label="Blood Camps"
              value={camps == null ? null : camps.length}
              icon={FiCalendar}
              color="info"
            />
          </div>
        </div>
      </section>

      {/* ─── AVAILABLE DONORS ─────────────────────────────────────── */}
      {loaded && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Available Donors</h2>
                <p className="text-[var(--color-text-muted)]">
                  Meet some of the donors ready to help.
                </p>
              </div>
              <Link
                to="/donors"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all"
              >
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {shownDonors.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No donors found.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shownDonors.map(donor => (
                <DonorCard key={donor.id} donor={donor} showPhone={isAuthenticated} />
              ))}
            </div>
            )}

            <div className="sm:hidden mt-6 text-center">
              <Link
                to="/donors"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]"
              >
                View All Donors <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── UPCOMING BLOOD CAMPS ──────────────────────────────────── */}
      {loaded && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Upcoming Blood Camps</h2>
                <p className="text-[var(--color-text-muted)]">
                  Join a blood donation camp near you.
                </p>
              </div>
              <Link
                to="/camps"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all"
              >
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {shownCamps.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No blood camps available.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shownCamps.map(camp => (
                <CampCard key={camp.id} camp={camp} />
              ))}
            </div>
            )}

            <div className="sm:hidden mt-6 text-center">
              <Link
                to="/camps"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]"
              >
                View All Camps <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── RECENT / ACTIVE BLOOD REQUESTS ────────────────────────── */}
      {loaded && (
        <section className="py-12 sm:py-16 bg-[var(--color-surface-2)]">
          <div className="page-container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-1">Active Blood Requests</h2>
                <p className="text-[var(--color-text-muted)]">
                  These patients need your help right now.
                </p>
              </div>
              <Link
                to="/requests"
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:gap-2 transition-all"
              >
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {shownRequests.length === 0 ? (
              <p className="text-[var(--color-text-muted)]">No blood requests found.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {shownRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
            )}

            <div className="sm:hidden mt-6 text-center">
              <Link
                to="/requests"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]"
              >
                View All Requests <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── TRUST AND SAFETY ──────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Trust &amp; Safety</h2>
            <p className="text-[var(--color-text-muted)] max-w-lg mx-auto">
              Built on principles of verification, privacy, and responsible donation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustItems.map(item => (
              <div key={item.title} className="card-rs p-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-lt)] flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[var(--color-primary)]" />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EMERGENCY BANNER ──────────────────────────────────────── */}
      <section className="py-10 sm:py-12 bg-[var(--color-primary-lt)]">
        <div className="page-container text-center">
          <div className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold text-lg mb-2">
            <FiPhone className="w-5 h-5" />
            Emergency Blood Helpline
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)] mb-2">16401</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
            For life-threatening emergencies, contact the National Blood Bank
            or your nearest hospital blood bank directly.
          </p>
        </div>
      </section>
    </div>
  );
}
