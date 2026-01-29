import React, { useEffect } from 'react';
import Link from 'next/link';
// Auth.css is imported globally from pages/_app.js
import AuthVisualPanel from '../../../components/auth/AuthVisualPanel';

export default function AdminSignup() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('auth-page-active');
    return () => document.body.classList.remove('auth-page-active');
  }, []);

  return (
    <main className="auth-page">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Restricted access"
          title="Admin onboarding is invite-only"
          description="We provision administrator accounts only after security review. Reach out to the ops team to request elevated access."
          quote="“Centralized admin tools keep our playbooks consistent across every cohort launch.”"
          author="Operations Team"
          authorRole="LearnBetter"
          stats={[
            { value: 'Zero', label: 'Shadow accounts' },
            { value: '24/7', label: 'Monitoring' }
          ]}
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
          <h2><span className="auth-heading-accent">Admin</span> Signup</h2>
          <p className="auth-subtitle">Administrator accounts are restricted.</p>
          <p>If you need an admin account, please contact the site owner.</p>
          <div className="auth-link">
            <Link href="/admin/login">Go to Admin Login</Link>
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}
