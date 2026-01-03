import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../../lib/api';
import Link from 'next/link';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const MentorLogin = () => {
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
      const response = await api.post('/mentor/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'mentor');
      localStorage.setItem('userId', response.data.mentor.id);
      if (response.data.mentor.email) localStorage.setItem('userEmail', response.data.mentor.email);
      if (response.data.mentor.name) localStorage.setItem('userName', response.data.mentor.name);
      
      // Trigger auth change event
      window.dispatchEvent(new Event('authChanged'));
      
      router.push('/mentor/dashboard');
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
                {loading ? '🔄 Logging in...' : '✓ Login'}
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
