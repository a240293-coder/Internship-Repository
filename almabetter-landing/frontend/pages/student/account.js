import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import RoleGuard from '../../components/auth/RoleGuard';
import DashboardLayout from '../../components/DashboardLayout';
import styles from './account.module.css';
import api from '../../lib/api';

export default function StudentAccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('userName_student') || '';
    const email = localStorage.getItem('userEmail_student') || '';
    setUserData({ name, email });
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwords.new.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/student/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      setPasswordMessage('Password changed successfully');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotMessage('Password reset email sent to ' + userData.email);
  };

  return (
    <RoleGuard allowedRole="student">
      <DashboardLayout role="student">
        <div className={styles.accountContainer}>
          <h1 className={styles.pageTitle}>My Account</h1>

          <div className={styles.cardsRow}>
            <div className={styles.leftColumn}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Profile Information</h2>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Name:</span>
                  <span className={styles.value}>{userData.name}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Email:</span>
                  <span className={styles.value}>{userData.email}</span>
                </div>
              </div>

              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Forgot Password?</h2>
                <p className={styles.cardText}>
                  Click the button below to receive a password reset link via email.
                </p>
                {forgotMessage && <div className={styles.successMessage}>{forgotMessage}</div>}
                <button onClick={handleForgotPassword} className={styles.btnSecondary}>
                  Send Reset Email
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Change Password</h2>
              <form onSubmit={handlePasswordChange} className={styles.form}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Current Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>New Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Confirm New Password</label>
                  <input
                    type="password"
                    className={styles.formInput}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    required
                  />
                </div>
                {passwordMessage && <div className={styles.successMessage}>{passwordMessage}</div>}
                {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
                <button type="submit" className={styles.btnPrimary} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </RoleGuard>
  );
}
