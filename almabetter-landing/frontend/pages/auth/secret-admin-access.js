import React, { useState } from 'react';
import PopupMessage from '../../components/shared/PopupMessage';
import usePopupMessage from '../../components/shared/usePopupMessage';
import { useRouter } from 'next/router';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

const SecretAdminLogin = () => {
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

    try {
      const response = await fetch('http://localhost:3000/api/admin/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.clear();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName_admin', data.admin.name);
        localStorage.setItem('userEmail_admin', data.admin.email);
        window.dispatchEvent(new Event('authChanged'));
        showPopup('Login successful!');
        setTimeout(() => router.push('/admin/dashboard'), 1200);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page auth-page-with-nav">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Admin Access"
          title="Manage the platform"
          description="Access admin dashboard to manage students, mentors, and sessions."
          quote="Efficient admin tools make platform management seamless."
          author="Admin Team"
          authorRole="Platform Management"
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
            <h2><span className="auth-heading-accent">Admin</span> Portal</h2>
            <p className="auth-subtitle">Secure admin access</p>
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
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
};

export default SecretAdminLogin;
