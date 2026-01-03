import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../api';
import Link from 'next/link';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const MentorRegister = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/mentor/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'mentor');
      localStorage.setItem('userId', response.data.mentor.id);
      if (response.data.mentor.email) localStorage.setItem('userEmail', response.data.mentor.email);
      if (response.data.mentor.name) localStorage.setItem('userName', response.data.mentor.name);
      router.push('/mentor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-with-nav">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Mentor impact"
          title="Shape careers with intent"
          description="Lead weekly critiques, host live sessions, and coach cohorts eager for your product experience."
          quote="“Mentoring here feels like collaborating with mini product teams every week.”"
          author="Sarah Iyer"
          authorRole="Product Lead, ex-Flipkart"
          stats={[
            { value: '250+', label: 'Mentor community' },
            { value: '12 hrs', label: 'Avg. monthly time' }
          ]}
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Mentor</span> Registration</h2>
            <p className="auth-subtitle">Join our mentor community</p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Jane Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
            <div className="auth-link">
              <p>Already have an account?</p>
              <Link href="/mentor/login">Login to Mentor Portal</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MentorRegister;
