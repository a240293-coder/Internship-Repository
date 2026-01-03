import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Removed auth-page-active class addition to allow Navbar and Footer to show
  // useEffect(() => {
  //   if (typeof document === 'undefined') return;
  //   document.body.classList.add('auth-page-active');
  //   return () => document.body.classList.remove('auth-page-active');
  // }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/admin/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userId', response.data.admin.id);
      if (response.data.admin.email) localStorage.setItem('userEmail', response.data.admin.email);
      if (response.data.admin.name) localStorage.setItem('userName', response.data.admin.name);
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChanged'));
      
      router.push('/admin/dashboard');
    } catch (err) {
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
