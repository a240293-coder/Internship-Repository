import React, { useState, useEffect } from 'react';
// Navbar is provided globally via _app.js (MainNavbar). Removed local import to avoid duplication.
import { useRouter } from 'next/router';
import api from '../api';
import Link from 'next/link';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const StudentRegister = () => {
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
      const response = await api.post('/student/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', 'student');
      localStorage.setItem('userId', response.data.student.id);
      if (response.data.student.email) localStorage.setItem('userEmail', response.data.student.email);
      if (response.data.student.name) localStorage.setItem('userName', response.data.student.name);
      router.push('/student/dashboard');
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
          eyebrow="Student success stories"
          title="Launch your next role"
          description="Hands-on projects, mentor feedback, and a focused learning path to make your next career move confident and visible."
          quote="“I landed interviews within weeks because mentors reviewed every project like a real sprint.”"
          author="Aditi Verma"
          authorRole="Product Analyst, Cohort ‘24"
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Student</span> Registration</h2>
            <p className="auth-subtitle">Join LearnBetter and grow your career</p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
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
              <Link href="/student/login">Login to Student Portal</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default StudentRegister;
