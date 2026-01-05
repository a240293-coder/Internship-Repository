import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import DashboardSidebar from './DashboardSidebar';

export default function DashboardLayout({ children, title, role, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Member');
  const profileRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (event) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'LB';

  return (
    <div className="dashboard-bg">
        <div className="dashboard-shell">
          <DashboardSidebar role={role} />
          <div className="dashboard-main" role="main">
            <div className="dashboard-page-header">
              <div>
                <p className="page-eyebrow">Your {roleLabel} workspace</p>
                {title && <h1 className="dashboard-title">{title}</h1>}
              </div>
              <div className="dashboard-profile-menu" ref={profileRef}>
                <button
                  type="button"
                  className="profile-trigger"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen ? 'true' : 'false'}
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <span className="profile-avatar" aria-hidden="true">{initials}</span>
                  <span className="profile-meta">
                    <span className="profile-name">{userName}</span>
                    <span className="profile-role">{roleLabel}</span>
                  </span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {profileOpen && (
                  <div className="profile-dropdown" role="menu">
                    {role === 'student' && (
                      <Link href="/student/form" className="mobile-only-menu-item profile-menu-link" onClick={() => setProfileOpen(false)}>
                        Interest Form
                      </Link>
                    )}
                    {role !== 'student' && (
                      <>
                        <button type="button" onClick={() => setProfileOpen(false)}>Profile</button>
                        <button type="button" onClick={() => setProfileOpen(false)}>Settings</button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onLogout?.();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
  );
}
