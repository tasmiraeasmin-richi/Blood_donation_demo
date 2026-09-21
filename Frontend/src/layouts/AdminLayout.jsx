import { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { FiMenu, FiDroplet } from 'react-icons/fi';
import AdminSidebar from '../components/layout/AdminSidebar';

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">
      {/* Desktop sidebar — fixed, always visible md+ */}
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-64">
        <AdminSidebar />
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <AdminSidebar onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      {/* Main content area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[var(--color-text)] border-b border-white/10 px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg text-white/60 hover:bg-white/10"
            aria-label="Open menu"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold text-white no-underline">
            <FiDroplet className="w-5 h-5 text-[var(--color-primary)]" />
            <span>RaktoSetu</span>
            <span className="text-[10px] font-normal bg-[var(--color-primary)] text-white px-1.5 py-0.5 rounded">
              ADMIN
            </span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
