import React, { useState, useEffect } from 'react';
import PopupMessage from '../../components/shared/PopupMessage';
import usePopupMessage from '../../components/shared/usePopupMessage';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Link from 'next/link';
// Auth.css is imported globally from pages/_app.js
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const MentorLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, showPopup, closePopup] = usePopupMessage();

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
      // Clear all previous auth state for safety
      localStorage.clear();
      const response = await api.post('/mentor/auth/login', formData);
      // Save the real JWT token
      if (response.data.token && response.data.token !== 'mock-jwt-token') {
        localStorage.setItem('token', response.data.token);
      } else {
        setError('Login failed: Invalid token received.');
        setLoading(false);
        return;
      }
      localStorage.setItem('userRole', 'mentor');
      localStorage.setItem('userId_mentor', response.data.mentor.id);
      const ment = response.data.mentor || {};
      const mEmail = ment.email || ment.mentor_email || ment.userEmail || '';
      const mName = ment.name || ment.full_name || ment.fullName || ment.mentor_name || '';
      if (mEmail) {
        localStorage.setItem('userEmail_mentor', mEmail);
      }
      if (mName) {
        localStorage.setItem('userName_mentor', mName);
      }
      // Trigger auth change event
      window.dispatchEvent(new Event('authChanged'));
      showPopup('Login successful!');
      setTimeout(() => router.push('/mentor/dashboard'), 1200);
    } catch (err) {
      const status = err?.response?.status ?? err?.status ?? (err?.isAuthError ? err.status : undefined);
      const serverMsg = err?.response?.data?.message ?? err?.response?.data ?? err?.message;
      if (status === 401) {
        showPopup(
          React.createElement(
            'div',
            { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement('span', null, 'No account found for this email.'),
            React.createElement(
              'a',
              {
                href: '/mentor/register',
                style: {
                  background: '#0b7a5f',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontWeight: 700,
                  marginLeft: 8
                }
              },
              'Register'
            )
          )
        );
        setError(serverMsg || 'Incorrect email or password');
      } else {
        if (err?.isAuthError) {
          showPopup(
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              React.createElement('span', null, 'No account found for this email.'),
              React.createElement(
                'a',
                {
                  href: '/mentor/register',
                  style: {
                    background: '#0b7a5f',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                    fontWeight: 700,
                    marginLeft: 8
                  }
                },
                'Register'
              )
            )
          );
        }
        setError(serverMsg || 'Incorrect email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-with-nav">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Coach live sprints"
          title="Mentor with purpose"
          description="Run structured critiques, unblock mentees quickly, and watch your industry experience shape new careers."
          quote="“Structured briefs mean I can focus purely on feedback that actually moves careers forward.”"
          author="Nilesh Rao"
          authorRole="Design Lead, Headout"
          stats={[
            { value: '4.9/5', label: 'Mentor satisfaction' },
            { value: '2 hrs', label: 'Weekly cadence' }
          ]}
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Mentor</span> Portal</h2>
            <p className="auth-subtitle">Manage your mentee relationships</p>
            {error && <div className="error-message">{error}</div>}
            <PopupMessage message={popup} onClose={closePopup} />
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
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
                {loading ? '🔄 Logging in...' : 'Login'}
              </button>
            </form>
            <div className="auth-link">
              <p>Don&apos;t have an account?</p>
              <Link href="/mentor/register">Register as Mentor</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MentorLogin;
