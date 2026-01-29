import React, { useState } from 'react';
import PopupMessage from '../components/shared/PopupMessage';
import usePopupMessage from '../components/shared/usePopupMessage';
import { useRouter } from 'next/router';
import api from '../lib/api';
import './auth/Auth.css';
import AuthVisualPanel from '../components/auth/AuthVisualPanel';

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, showPopup, closePopup] = usePopupMessage();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('[ADMIN LOGIN DEBUG] Submitting credentials:', formData);
    try {
      const response = await api.post('/api/admin/auth/login', formData);
      console.log('[ADMIN LOGIN DEBUG] API response:', response);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userId_admin', response.data.admin.id);
      if (response.data.admin.email) localStorage.setItem('userEmail_admin', response.data.admin.email);
      if (response.data.admin.name) localStorage.setItem('userName_admin', response.data.admin.name);
      window.dispatchEvent(new Event('authChanged'));
      showPopup('Login successful!');
      setTimeout(() => router.push('/admin/dashboard'), 1200);
    } catch (err) {
      console.log('[ADMIN LOGIN DEBUG] API error:', err);
      setError(err.response?.data?.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-with-nav">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Secure command center"
          title="Stay close to every cohort"
          description="Track learner pipelines, approve mentors, and audit submissions from one focused console."
          quote="“Having a clean view of every cohort keeps ops calm even on launch weeks.”"
          author="Neha Kapoor"
          authorRole="Program Ops, LearnBetter"
          stats={[
            { value: '15+', label: 'Active cohorts' },
            { value: '98%', label: 'SLA adherence' }
          ]}
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Admin</span> Portal</h2>
            <p className="admin-note">Administrator Login</p>
            {error && <div className="error-message">{error}</div>}
            <PopupMessage message={popup} onClose={closePopup} />
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Authenticating...' : 'Admin Login'}
              </button>
            </form>
            <div className="auth-link">
              <p>This portal is restricted to administrators only</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AdminLogin;
