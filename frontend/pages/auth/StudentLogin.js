import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../api';
import Link from 'next/link';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const StudentLogin = () => {
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
      const response = await api.post('/student/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userId', response.data.student.id);
      // store email/name when available so forms can be associated
      if (response.data.student.email) localStorage.setItem('userEmail', response.data.student.email);
      if (response.data.student.name) localStorage.setItem('userName', response.data.student.name);
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChanged'));
      
      router.push('/student/dashboard');
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
