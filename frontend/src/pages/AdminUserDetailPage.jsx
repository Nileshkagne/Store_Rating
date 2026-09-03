import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await adminAPI.getUserById(id);
        setUser(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <div className="loading"><div className="spinner"></div> Loading user...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!user) return <div className="alert alert-error">User not found.</div>;

  const roleBadge = (role) => {
    const cls = role === 'ADMIN' ? 'badge-admin' : role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user';
    return <span className={`badge ${cls}`}>{role}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>User Details</h1>
        <Link to="/admin/users" className="btn btn-secondary">← Back to Users</Link>
      </div>

      <div className="detail-card">
        <div className="detail-row">
          <div className="detail-label">Name</div>
          <div className="detail-value">{user.name}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Email</div>
          <div className="detail-value">{user.email}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Address</div>
          <div className="detail-value">{user.address || '—'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Role</div>
          <div className="detail-value">{roleBadge(user.role)}</div>
        </div>

        {user.role === 'STORE_OWNER' && user.store && (
          <>
            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
            <h3 style={{ marginBottom: '0.75rem' }}>Store Information</h3>
            <div className="detail-row">
              <div className="detail-label">Store Name</div>
              <div className="detail-value">{user.store.name}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Store Email</div>
              <div className="detail-value">{user.store.email || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Store Address</div>
              <div className="detail-value">{user.store.address || '—'}</div>
            </div>
            <div className="detail-row">
              <div className="detail-label">Average Rating</div>
              <div className="detail-value" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                {user.store.averageRating !== null ? `⭐ ${user.store.averageRating} (${user.store.totalRatings} ratings)` : 'No ratings yet'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
