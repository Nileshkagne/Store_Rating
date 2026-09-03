import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (form.name.trim().length < 20) return 'Name must be at least 20 characters.';
    if (form.name.trim().length > 60) return 'Name must be at most 60 characters.';
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Invalid email format.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password.length > 16) return 'Password must be at most 16 characters.';
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) return 'Password must contain at least one special character.';
    if (form.address && form.address.trim().length > 400) return 'Address must be at most 400 characters.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const { token, user } = res.data.data;
      login(user, token);
      navigate('/user/stores');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Register for Store Rating Platform</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name (20-60 characters)</label>
            <input id="name" name="name" type="text" placeholder="Enter your full name" value={form.name} onChange={handleChange} required minLength={20} maxLength={60} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" type="text" placeholder="Your address" value={form.address} onChange={handleChange} maxLength={400} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password (8-16 chars, uppercase + special char)</label>
            <input id="password" name="password" type="password" placeholder="Create a password" value={form.password} onChange={handleChange} required minLength={8} maxLength={16} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
