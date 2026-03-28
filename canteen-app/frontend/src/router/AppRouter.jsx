import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Student/Teacher pages
import HomePage from '../pages/dashboard/HomePage';
import MenuPage from '../pages/dashboard/MenuPage';
import CheckoutPage from '../pages/dashboard/CheckoutPage';
import OrderHistoryPage from '../pages/dashboard/OrderHistoryPage';
import OrderDetailPage from '../pages/dashboard/OrderDetailPage';
import ActiveOrdersPage from '../pages/dashboard/ActiveOrdersPage';
import ProfilePage from '../pages/dashboard/ProfilePage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminMenuPage from '../pages/admin/AdminMenuPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminCouponsPage from '../pages/admin/AdminCouponsPage';

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes - require auth */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Student/Teacher routes */}
          <Route element={<RoleRoute allowedRoles={['student', 'teacher']} />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/dashboard/menu" element={<MenuPage />} />
            <Route path="/dashboard/checkout" element={<CheckoutPage />} />
            <Route path="/dashboard/orders" element={<OrderHistoryPage />} />
            <Route path="/dashboard/orders/:id" element={<OrderDetailPage />} />
            <Route path="/dashboard/active-orders" element={<ActiveOrdersPage />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/menu" element={<AdminMenuPage />} />
            <Route path="/admin/orders" element={<AdminOrdersPage />} />
            <Route path="/admin/coupons" element={<AdminCouponsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <p className="text-gray-500 mt-2">Page not found</p>
          <a href="/login" className="mt-4 text-canteen-600 hover:underline">Go to login</a>
        </div>
      } />
    </Routes>
  );
}
