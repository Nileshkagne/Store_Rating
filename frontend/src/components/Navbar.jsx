import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        ⭐ <span>Store</span>Rating
      </div>
      <div className="navbar-links">
        {user.role === 'ADMIN' && (
          <>
            <Link to="/admin/dashboard" className={isActive('/admin/dashboard')}>Dashboard</Link>
            <Link to="/admin/users" className={isActive('/admin/users')}>Users</Link>
            <Link to="/admin/stores" className={isActive('/admin/stores')}>Stores</Link>
          </>
        )}
        {user.role === 'NORMAL_USER' && (
          <>
            <Link to="/user/stores" className={isActive('/user/stores')}>Stores</Link>
            <Link to="/user/change-password" className={isActive('/user/change-password')}>Password</Link>
          </>
        )}
        {user.role === 'STORE_OWNER' && (
          <>
            <Link to="/owner/dashboard" className={isActive('/owner/dashboard')}>Dashboard</Link>
            <Link to="/owner/change-password" className={isActive('/owner/change-password')}>Password</Link>
          </>
        )}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
}
