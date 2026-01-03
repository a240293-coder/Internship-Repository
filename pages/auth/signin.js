import React, { useEffect } from 'react';
import Link from 'next/link';
import './Auth.css';
import AuthVisualPanel from '../../components/auth/AuthVisualPanel';

export default function SignInIndex() {
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.add('auth-page-active');
    return () => document.body.classList.remove('auth-page-active');
  }, []);

  return (
    <main className="auth-page">
      <div className="auth-container">
        <AuthVisualPanel
          eyebrow="Choose your portal"
          title="One entry point for every role"
          description="Pick the workspace that matches your journey. Each portal keeps navigation minimal so you can focus on outcomes."
          quote="“Switching between student, mentor, and admin spaces feels seamless now.”"
          author="Platform Team"
          authorRole="LearnBetter"
        />
        <section className="auth-form-wrap">
          <div className="auth-box">
          <h2>Sign In</h2>
          <p className="auth-subtitle">Choose your portal to continue</p>

          <div style={{display:'grid', gap:12}}>
            <Link href="/student/login"><button>Student Sign In</button></Link>
            <Link href="/mentor/login"><button>Mentor Sign In</button></Link>
            <Link href="/admin/login"><button>Admin Sign In</button></Link>
          </div>

          <div className="auth-link">
            <p>New here?</p>
            <Link href="/auth/signup/student">Create a student account</Link>
          </div>
        </div>
        </section>
      </div>
    </main>
  );
}
