import { useState, useEffect } from 'react';
import { ownerAPI } from '../services/api';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ownerAPI.getDashboard();
        setData(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div> Loading dashboard...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  if (!data.store) {
    return (
      <div>
        <h1 style={{ marginBottom: '1.5rem' }}>Store Owner Dashboard</h1>
        <div className="alert alert-info">{data.message || 'No store assigned to your account yet.'}</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Store Owner Dashboard</h1>

      <div className="owner-store-info">
        <h2>{data.store.name}</h2>
        <p style={{ color: 'var(--text-muted)' }}>📍 {data.store.address || 'No address'}</p>
        {data.store.email && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>✉️ {data.store.email}</p>}

        <div className="owner-avg-rating">
          <div className="big-rating">
            {data.averageRating !== null ? `⭐ ${data.averageRating}` : '—'}
          </div>
          <div className="rating-info">
            {data.averageRating !== null
              ? `Average Rating (${data.totalRatings} ${data.totalRatings === 1 ? 'rating' : 'ratings'})`
              : 'No ratings yet'}
          </div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Rating Submissions</h2>

      {data.ratings.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📝</div>No ratings submitted yet.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {data.ratings.map(r => (
                <tr key={r.id}>
                  <td>{r.userName}</td>
                  <td>{r.userEmail}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 700 }}>⭐ {r.rating}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
