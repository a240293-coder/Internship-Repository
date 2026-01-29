import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
// Auth.css is imported globally from pages/_app.js
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';








import PopupMessage from '../../components/shared/PopupMessage';
import usePopupMessage from '../../components/shared/usePopupMessage';

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [popup, showPopup] = usePopupMessage();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clear all previous auth state for safety
      localStorage.clear();
      const res = await api.post('/admin/login', form);
      // Save the real JWT token
      if (res.data.token && res.data.token !== 'mock-jwt-token') {
        localStorage.setItem('token', res.data.token);
      } else {
        showPopup('Login failed: Invalid token received.');
        setLoading(false);
        return;
      }
      localStorage.setItem('userRole', 'admin');
      // role-scoped storage to avoid cross-role overwrites
      localStorage.setItem('userEmail_admin', res.data.admin.email);
      localStorage.setItem('userName_admin', res.data.admin.name);
      // Debug: log token after setting
      console.log('[ADMIN LOGIN DEBUG] Token set in localStorage:', localStorage.getItem('token'));
      showPopup('Login successful! Redirecting...');
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (err) {
      showPopup(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <PopupMessage message={popup} />
      <div className="auth-form-card">
        <h2>Admin Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
