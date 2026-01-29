import React, { useState, useEffect } from 'react';
import PopupMessage from '../../components/shared/PopupMessage';
import usePopupMessage from '../../components/shared/usePopupMessage';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Link from 'next/link';
// Auth.css is imported globally from pages/_app.js
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const StudentLogin = () => {
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
      const response = await api.post('/student/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'student');
      // store role-scoped values to avoid clobbering other roles in same browser
      localStorage.setItem('userId_student', response.data.student.id);
      // store email/name when available so forms can be associated
      const stud = response.data.student || {};
      const sEmail = stud.email || stud.student_email || stud.userEmail || '';
      const sName = stud.name || stud.full_name || stud.fullName || stud.student_name || '';
      if (sEmail) {
        localStorage.setItem('userEmail_student', sEmail);
      }
      if (sName) {
        localStorage.setItem('userName_student', sName);
      }
      // Trigger auth change event
      window.dispatchEvent(new Event('authChanged'));
      showPopup('Login successful!');
      setTimeout(() => router.push('/student/dashboard'), 1200);
    } catch (err) {
      // Support multiple error shapes (fetch error, custom object, mock error)
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
                href: '/student/register',
                style: {
                  background: '#2563eb',
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
        // Fallback: if the error object indicates auth failure, show popup as well
        if (err?.isAuthError) {
          showPopup(
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: 8 } },
              React.createElement('span', null, 'No account found for this email.'),
              React.createElement(
                'a',
                {
                  href: '/student/register',
                  style: {
                    background: '#2563eb',
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
          eyebrow="Daily progress rituals"
          title="Stay on track with mentors"
          description="Short standups, async reviews, and curated job drops keep your interviews moving."
          quote="“The structured feedback loop made my portfolio feel intentional and ready for hiring managers.”"
          author="Rahul Menon"
          authorRole="UX Designer, Bangalore"
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Student</span> Portal</h2>
            <p className="auth-subtitle">Access your mentorship account</p>
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
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <div className="auth-link">
              <p>Don&apos;t have an account?</p>
              <Link href="/student/register">Register as Student</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default StudentLogin;
