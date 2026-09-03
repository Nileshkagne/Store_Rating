import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ sortBy: 'created_at', sortOrder: 'desc' });
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { ...sort };
      if (filters.name) params.name = filters.name;
      if (filters.email) params.email = filters.email;
      if (filters.address) params.address = filters.address;
      if (filters.role) params.role = filters.role;

      const res = await adminAPI.getUsers(params);
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [sort]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchUsers();
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
    if (newUser.name.trim().length < 20) return 'Name must be at least 20 characters.';
    if (newUser.name.trim().length > 60) return 'Name must be at most 60 characters.';
    if (!newUser.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email format.';
    if (newUser.password.length < 8) return 'Password must be at least 8 characters.';
    if (newUser.password.length > 16) return 'Password must be at most 16 characters.';
    if (!/[A-Z]/.test(newUser.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newUser.password)) return 'Password must contain at least one special character.';
    if (newUser.address && newUser.address.trim().length > 400) return 'Address must be at most 400 characters.';
    return null;
  };

  const handleCreateUser = async (e) => {
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
      await adminAPI.createUser(newUser);
      setFormSuccess('User created successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
      fetchUsers();
      setTimeout(() => { setShowModal(false); setFormSuccess(''); }, 1500);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleBadge = (role) => {
    const cls = role === 'ADMIN' ? 'badge-admin' : role === 'STORE_OWNER' ? 'badge-owner' : 'badge-user';
    return <span className={`badge ${cls}`}>{role}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); setFormSuccess(''); }}>
          + Add User
        </button>
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
        <div className="form-group">
          <label>Role</label>
          <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>
        <button type="submit" className="btn btn-secondary btn-sm">Apply</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">👤</div>No users found.</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')}>Name<span className="sort-indicator">{getSortIndicator('name')}</span></th>
                <th onClick={() => handleSort('email')}>Email<span className="sort-indicator">{getSortIndicator('email')}</span></th>
                <th onClick={() => handleSort('address')}>Address<span className="sort-indicator">{getSortIndicator('address')}</span></th>
                <th onClick={() => handleSort('role')}>Role<span className="sort-indicator">{getSortIndicator('role')}</span></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><Link to={`/admin/users/${user.id}`} className="td-link">{user.name}</Link></td>
                  <td>{user.email}</td>
                  <td>{user.address || '—'}</td>
                  <td>{roleBadge(user.role)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New User</h2>
            {formError && <div className="alert alert-error">{formError}</div>}
            {formSuccess && <div className="alert alert-success">{formSuccess}</div>}
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Name (20-60 characters)</label>
                <input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} required minLength={20} maxLength={60} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} maxLength={400} />
              </div>
              <div className="form-group">
                <label>Password (8-16 chars, uppercase + special)</label>
                <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required minLength={8} maxLength={16} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="NORMAL_USER">Normal User</option>
                  <option value="ADMIN">Admin</option>
                  <option value="STORE_OWNER">Store Owner</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
