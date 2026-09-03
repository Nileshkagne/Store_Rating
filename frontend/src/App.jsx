import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminStoresPage from './pages/AdminStoresPage';
import UserStoresPage from './pages/UserStoresPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import OwnerDashboard from './pages/OwnerDashboard';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div> Loading...</div>;
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'NORMAL_USER': return '/user/stores';
      case 'STORE_OWNER': return '/owner/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <div className={user ? 'main-content' : ''}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} replace /> : <RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/users/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUserDetailPage /></ProtectedRoute>} />
          <Route path="/admin/stores" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminStoresPage /></ProtectedRoute>} />

          {/* Normal User Routes */}
          <Route path="/user/stores" element={<ProtectedRoute allowedRoles={['NORMAL_USER']}><UserStoresPage /></ProtectedRoute>} />
          <Route path="/user/change-password" element={<ProtectedRoute allowedRoles={['NORMAL_USER']}><ChangePasswordPage /></ProtectedRoute>} />

          {/* Store Owner Routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['STORE_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="/owner/change-password" element={<ProtectedRoute allowedRoles={['STORE_OWNER']}><ChangePasswordPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
