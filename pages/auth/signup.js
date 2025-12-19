import { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Auth.module.css';
import AuthLayout from '../../components/AuthLayout';

export default function SignUp() {
  // State for toggling visibility of the email sign-up form
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Handler to show email form in Sign Up mode
  const handleEmailSignupClick = (e) => {
    e.preventDefault();
    setShowEmailForm(true);
  };

  const title = "Welcome to LearnBetter ✨";
  const subtitle = "Sign up today to kickstart your learning and land your dream job!";
  const googleButtonText = "Continue with Gmail";

  return (
    <AuthLayout title="Sign Up">
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      {/* Google Button - Always visible */}
      <button className={styles.googleButton}>
        <div className={styles.googleIconWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        </div>
        <span className={styles.googleButtonText}>{googleButtonText}</span>
      </button>

      {/* SIGN UP FLOW */}
      {!showEmailForm ? (
        /* Initial Sign Up State: Link to show form */
        <div className={styles.emailSignupLinkWrapper}>
          <a href="#" onClick={handleEmailSignupClick} className={styles.emailSignupLink}>
            Don’t have Gmail? <strong>Sign up with Email</strong>
          </a>
        </div>
      ) : (
        /* Expanded Sign Up State: Form visible */
        <div className={styles.fadeDown}>
          <div className={styles.divider}>or</div>
          <div className={styles.inputGroup}>
            <input 
              type="email" 
              placeholder="Email Address" 
              className={styles.input} 
            />
          </div>
          <div className={styles.inputGroup}>
            <input 
              type="password" 
              placeholder="Password" 
              className={styles.input} 
            />
          </div>
          <button className={styles.primaryButton}>
            Sign Up
          </button>
        </div>
      )}

      {/* Bottom Toggle Text */}
      <div className={styles.bottomText}>
        <span><strong>Already have an account?</strong></span>
        {/* Sign In opens in a NEW TAB now */}
        <a 
          href="/auth/signin" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.outlineButton}
        >
          Sign In
        </a>
      </div>
    </AuthLayout>
  );
}
