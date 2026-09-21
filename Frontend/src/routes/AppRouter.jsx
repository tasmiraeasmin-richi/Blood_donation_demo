import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AuthLayout from '../layouts/AuthLayout';
import MemberLayout from '../layouts/MemberLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route guards
import { ProtectedRoute, RoleBasedRoute, GuestOnlyRoute } from './ProtectedRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Public pages
import Home from '../pages/public/Home';
import Donors from '../pages/public/Donors';
import Requests from '../pages/public/Requests';
import RequestDetail from '../pages/public/RequestDetail';
import Camps from '../pages/public/Camps';
import CampDetail from '../pages/public/CampDetail';

// Member pages
import Dashboard from '../pages/member/Dashboard';
import MyRequests from '../pages/member/MyRequests';
import CreateRequest from '../pages/member/CreateRequest';
import EditRequest from '../pages/member/EditRequest';
import MyOffers from '../pages/member/MyOffers';
import RequestOffers from '../pages/member/RequestOffers';
import MyDonations from '../pages/member/MyDonations';
import Profile from '../pages/member/Profile';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminRequests from '../pages/admin/AdminRequests';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminDonations from '../pages/admin/AdminDonations';
import AdminCamps from '../pages/admin/AdminCamps';

// Error / catch-all pages
import Unauthorized from '../pages/Unauthorized';

const router = createBrowserRouter([
  // ── Public routes ──────────────────────────────────────────────
  // Accessible to everyone: guest, member, admin
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/donors', element: <Donors /> },
      { path: '/requests', element: <Requests /> },
      { path: '/requests/:id', element: <RequestDetail /> },
      { path: '/camps', element: <Camps /> },
      { path: '/camps/:id', element: <CampDetail /> },
    ],
  },

  // ── Auth routes (guests only) ──────────────────────────────────
  // Only accessible when NOT authenticated
  {
    element: <GuestOnlyRoute><AuthLayout /></GuestOnlyRoute>,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password/:token', element: <ResetPassword /> },
    ],
  },

  // ── Member routes ─────────────────────────────────────────────
  // Requires authentication with 'member' role
  {
    element: (
      <ProtectedRoute>
        <RoleBasedRoute roles={['member']}>
          <MemberLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/dashboard/requests', element: <MyRequests /> },
      { path: '/dashboard/requests/create', element: <CreateRequest /> },
      { path: '/dashboard/requests/:id/edit', element: <EditRequest /> },
      { path: '/dashboard/requests/:id/offers', element: <RequestOffers /> },
      { path: '/dashboard/offers', element: <MyOffers /> },
      { path: '/dashboard/donations', element: <MyDonations /> },
      { path: '/profile', element: <Profile /> },
    ],
  },

  // ── Admin routes ───────────────────────────────────────────────
  // Requires authentication with 'admin' role
  {
    element: (
      <ProtectedRoute>
        <RoleBasedRoute roles={['admin']}>
          <AdminLayout />
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/requests', element: <AdminRequests /> },
      { path: '/admin/users', element: <AdminUsers /> },
      { path: '/admin/donations', element: <AdminDonations /> },
      { path: '/admin/camps', element: <AdminCamps /> },
    ],
  },

  // ── Error / catch-all routes ───────────────────────────────────
  {
    path: '/unauthorized',
    element: <Unauthorized />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
