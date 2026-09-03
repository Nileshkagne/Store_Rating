import { useState, useEffect } from 'react';
import { storeAPI } from '../services/api';

export default function UserStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [ratingMessage, setRatingMessage] = useState({ storeId: null, type: '', text: '' });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = { ...sort };
      if (search.name) params.name = search.name;
      if (search.address) params.address = search.address;

      const res = await storeAPI.getStores(params);
      setStores(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleSort = (field) => {
    setSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleRate = async (storeId, rating, isModify) => {
    try {
      if (isModify) {
        await storeAPI.modifyRating(storeId, { rating });
      } else {
        await storeAPI.submitRating(storeId, { rating });
      }
      setRatingMessage({ storeId, type: 'success', text: isModify ? 'Rating updated!' : 'Rating submitted!' });
      fetchStores();
      setTimeout(() => setRatingMessage({ storeId: null, type: '', text: '' }), 2000);
    } catch (err) {
      // If submit fails because rating exists, try modify
      if (!isModify && err.response?.status === 409) {
        try {
          await storeAPI.modifyRating(storeId, { rating });
          setRatingMessage({ storeId, type: 'success', text: 'Rating updated!' });
          fetchStores();
          setTimeout(() => setRatingMessage({ storeId: null, type: '', text: '' }), 2000);
          return;
        } catch (modErr) {
          setRatingMessage({ storeId, type: 'error', text: modErr.response?.data?.message || 'Failed.' });
        }
      } else {
        setRatingMessage({ storeId, type: 'error', text: err.response?.data?.message || 'Failed to submit rating.' });
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Browse Stores</h1>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Sort:
          <button className="btn btn-sm btn-secondary" onClick={() => handleSort('name')}>
            Name {sort.sortBy === 'name' ? (sort.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleSort('rating')}>
            Rating {sort.sortBy === 'rating' ? (sort.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
          <button className="btn btn-sm btn-secondary" onClick={() => handleSort('address')}>
            Address {sort.sortBy === 'address' ? (sort.sortOrder === 'asc' ? '↑' : '↓') : ''}
          </button>
        </div>
      </div>

      <form className="filters-bar" onSubmit={handleSearch}>
        <div className="form-group">
          <label>Search by Name</label>
          <input placeholder="Store name..." value={search.name} onChange={(e) => setSearch({ ...search, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Search by Address</label>
          <input placeholder="Store address..." value={search.address} onChange={(e) => setSearch({ ...search, address: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-secondary btn-sm">Search</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏪</div>No stores found.</div>
      ) : (
        <div className="stores-grid">
          {stores.map(store => (
            <div className="store-card" key={store.id}>
              <h3>{store.name}</h3>
              <div className="store-address">📍 {store.address || 'No address'}</div>

              <div className="rating-row">
                <span className="rating-label">Overall Rating</span>
                <span className={`rating-value ${store.averageRating !== null ? 'gold' : 'muted'}`}>
                  {store.averageRating !== null ? `⭐ ${store.averageRating}` : 'No ratings yet'}
                </span>
              </div>

              <div className="rating-row">
                <span className="rating-label">Your Rating</span>
                <span className={`rating-value ${store.userRating ? 'gold' : 'muted'}`}>
                  {store.userRating ? `⭐ ${store.userRating}` : 'Not submitted'}
                </span>
              </div>

              {ratingMessage.storeId === store.id && (
                <div className={`alert ${ratingMessage.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: '0.5rem' }}>
                  {ratingMessage.text}
                </div>
              )}

              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(val => (
                  <button
                    key={val}
                    className={`star ${store.userRating === val ? 'active' : ''}`}
                    onClick={() => handleRate(store.id, val, store.userRating !== null)}
                    title={`Rate ${val}`}
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                {store.userRating ? 'Click a number to modify your rating' : 'Click a number to submit your rating'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
