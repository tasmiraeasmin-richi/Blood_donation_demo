import { Link, Outlet } from 'react-router-dom';
import { FiDroplet } from 'react-icons/fi';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-2)] flex flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-[var(--color-primary)] mb-8 no-underline">
        <FiDroplet className="w-6 h-6" />
        RaktoSetu
      </Link>
      <Outlet />
    </div>
  );
}
