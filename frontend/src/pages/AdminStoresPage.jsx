import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

export default function AdminStoresPage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ sortBy: 'name', sortOrder: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [storeOwners, setStoreOwners] = useState([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = { ...sort };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;

      const res = await adminAPI.getStores(params);
      setStores(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stores.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const res = await adminAPI.getUsers({ role: 'STORE_OWNER' });
      setStoreOwners(res.data.data);
    } catch (err) {
      console.error('Failed to load store owners.');
    }
  };

  useEffect(() => { fetchStores(); }, [sort]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleSort = (field) => {
    setSort(prev => ({
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIndicator = (field) => {
    if (sort.sortBy !== field) return '';
    return sort.sortOrder === 'asc' ? ' ↑' : ' ↓';
  };

  const validate = () => {
    if (newStore.name.trim().length < 20) return 'Store name must be at least 20 characters.';
    if (newStore.name.trim().length > 60) return 'Store name must be at most 60 characters.';
    if (newStore.email && !newStore.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email format.';
    if (newStore.address && newStore.address.trim().length > 400) return 'Address must be at most 400 characters.';
    if (!newStore.ownerId) return 'Please select a store owner.';
    return null;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await adminAPI.createStore(newStore);
      setFormSuccess('Store created successfully!');
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create store.');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setFormError('');
    setFormSuccess('');
    fetchOwners();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Stores</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Add Store</button>
      </div>

      <form className="filters-bar" onSubmit={handleFilter}>
        <div className="form-group">
          <label>Name</label>
          <input placeholder="Filter by name" value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input placeholder="Filter by email" value={filters.email} onChange={(e) => setFilters({ ...filters, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Address</label>
          <input placeholder="Filter by address" value={filters.address} onChange={(e) => setFilters({ ...filters, address: e.target.value })} />
        </div>
        <button type="submit" className="btn btn-secondary btn-sm">Apply</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading stores...</div>
      ) : stores.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">🏪</div>No stores found.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name<span className="sort-indicator">{getSortIndicator('name')}</span></th>
                <th onClick={() => handleSort('email')}>Email<span className="sort-indicator">{getSortIndicator('email')}</span></th>
                <th onClick={() => handleSort('address')}>Address<span className="sort-indicator">{getSortIndicator('address')}</span></th>
                <th onClick={() => handleSort('rating')}>Rating<span className="sort-indicator">{getSortIndicator('rating')}</span></th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => (
                <tr key={store.id}>
                  <td>{store.name}</td>
                  <td>{store.email || '—'}</td>
                  <td>{store.address || '—'}</td>
                  <td style={{ color: store.averageRating !== null ? 'var(--accent)' : 'var(--text-dim)', fontWeight: store.averageRating !== null ? 700 : 400 }}>
                    {store.averageRating !== null ? `⭐ ${store.averageRating}` : 'No ratings yet'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Store</h2>
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleCreateStore}>
              <div className="form-group">
                <label>Store Name (20-60 characters)</label>
                <input value={newStore.name} onChange={(e) => setNewStore({ ...newStore, name: e.target.value })} required minLength={20} maxLength={60} />
              </div>
              <div className="form-group">
                <label>Store Email</label>
                <input type="email" value={newStore.email} onChange={(e) => setNewStore({ ...newStore, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Store Address</label>
                <input value={newStore.address} onChange={(e) => setNewStore({ ...newStore, address: e.target.value })} maxLength={400} />
              </div>
              <div className="form-group">
                <label>Assign Store Owner</label>
                <select value={newStore.ownerId} onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })} required>
                  <option value="">Select a Store Owner</option>
                  {storeOwners.map(owner => (
                    <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
