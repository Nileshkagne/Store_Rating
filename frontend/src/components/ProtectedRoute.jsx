import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading"><div className="spinner"></div> Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard
    switch (user.role) {
      case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
      case 'NORMAL_USER': return <Navigate to="/user/stores" replace />;
      case 'STORE_OWNER': return <Navigate to="/owner/dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
}
