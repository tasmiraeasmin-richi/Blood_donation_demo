import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppRouter from './routes/AppRouter';
import LoadingSpinner from './components/ui/feedback/LoadingSpinner';

function AppContent() {
  const { loading } = useAuth();

  // Show full-screen loader while auth state is being resolved
  // (prevents flash of protected content or redirect loops)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-2)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <AppRouter />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '0.5rem',
            background: '#111318',
            color: '#fff',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: '#1A7F4B',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#C0152A',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
