import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DashboardSidebar from './DashboardSidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children, title, role, onLogout }) {
  // Track window width for responsive rendering
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userName, setUserName] = useState('Member');
  const profileRef = useRef(null);
  const router = useRouter();

  // Close mobile menu after route change completes (prevents blank header/content)
  useEffect(() => {
    const handleRouteChange = () => setProfileOpen(false);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  const normalizedRole = role ? String(role).toLowerCase() : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Prefer role-scoped userName to avoid overwriting names across roles
    const roleKey = normalizedRole ? `userName_${normalizedRole}` : 'userName';
    const storedName = localStorage.getItem(roleKey) || localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Member';
    setUserName(storedName);
  }, [normalizedRole]);

  useEffect(() => {
    // Only check for authentication, not role. Role enforcement is handled by per-route guards.
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/auth/login');
    }
  }, []);

  useEffect(() => {
    if (!profileOpen) {
      document.body.classList.remove('mobile-menu-open');
      return;
    }
    // Lock background scroll on mobile when menu is open
    if (isMobile) {
      document.body.classList.add('mobile-menu-open');
    }
    const handleClickOutside = (event) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('mobile-menu-open');
    };
  }, [profileOpen, isMobile]);

  const roleLabel = normalizedRole ? normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1) : 'Member';
  
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MB';

  const handleProfileClick = () => {
    setProfileOpen(false);
    if (normalizedRole === 'mentor') {
      router.push('/mentor/profile');
    } else if (normalizedRole === 'admin') {
      router.push('/admin/profile');
    }
  };

  const handleSettingsClick = () => {
    setProfileOpen(false);
    const targetRole = normalizedRole || 'student';
    router.push(`/${targetRole}/settings`);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Remove generic and role-scoped keys
      try {
        const storedRole = localStorage.getItem('userRole');
        const storedRoleNorm = storedRole ? String(storedRole).toLowerCase() : null;
        if (storedRoleNorm) {
          localStorage.removeItem(`userName_${storedRoleNorm}`);
          localStorage.removeItem(`userEmail_${storedRoleNorm}`);
          localStorage.removeItem(`userId_${storedRoleNorm}`);
        }
      } catch (e) {}
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      router.push('/auth/login');
    }
  };

  return (
    <div className={styles['dashboard-bg']} style={{ overflowX: 'hidden' }}>
      <div className={styles['dashboard-shell']}>
        {/* Sidebar hidden on mobile, navigation moved to profile menu */}
        <DashboardSidebar role={role} />
        <div className={styles['dashboard-main']} role="main">
          <div className={styles['dashboard-page-header']}>
            {/* For mobile, render hamburger at the very top left, outside the hero card */}
            {isMobile ? (
              <>
                <div className={styles['mobile-hamburger-row']}>
                  <button
                    type="button"
                    className={styles['hamburger-trigger']}
                    aria-label={profileOpen ? 'Close menu' : 'Open menu'}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen ? 'true' : 'false'}
                    onClick={() => setProfileOpen((prev) => !prev)}
                  >
                    <span className={styles['hamburger-icon']} aria-hidden="true">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </button>
                </div>
                <div className="dashboard-hero">
                  <div className="hero-content">
                    <p className={styles['page-eyebrow']}>Your {roleLabel} Workspace</p>
                    {title && <h1 className={styles['dashboard-title']}>{title}</h1>}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles['dashboard-header-row']}>
                <div className={styles['dashboard-header-title']}>
                  <p className={styles['page-eyebrow']}>Your {roleLabel} Workspace</p>
                  {title && <h1 className={styles['dashboard-title']}>{title}</h1>}
                </div>
              </div>
            )}
            {/* Mobile nav menu overlay */}
            {profileOpen && (
              <>
                <div className={styles['mobile-nav-backdrop']} onClick={() => setProfileOpen(false)} tabIndex={-1} aria-hidden="true" />
                <nav className={styles['mobile-nav-menu']} role="menu" aria-label="Dashboard navigation">
                   <div className={styles['mobile-nav-header']}>
                     <span className={styles['mobile-nav-role']}>{roleLabel}</span>
                     <button className={styles['mobile-nav-close']} aria-label="Close menu" onClick={() => setProfileOpen(false)}>&times;</button>
                   </div>
                   {/* Avatar below hamburger in drawer */}
                   <div className={styles['mobile-nav-avatar-row']}>
                     <span className={styles['mobile-nav-avatar']} aria-label="User avatar">{initials}</span>
                     <span className={styles['mobile-nav-avatar-name']}>{userName}</span>
                   </div>
                   <div className={styles['mobile-divider-blue']} />
                   <div className={styles['mobile-nav-links']} style={{ display: 'block' }}>
                    {(normalizedRole === 'student' || normalizedRole === 'mentor' || normalizedRole === 'admin') && (
                      <>
                        {normalizedRole === 'student' && (
                          <>
                            <a href="/student/dashboard" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/student/dashboard', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Dashboard</a>
                            <a href="/student/form?mode=new" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/student/form?mode=new', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Interest Form</a>
                            <a href="/student/update_interest_form" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/student/update_interest_form', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Update interest form</a>
                          </>
                        )}
                        {normalizedRole === 'mentor' && (
                          <>
                            <a href="/mentor/dashboard" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/mentor/dashboard', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Dashboard</a>
                            <a href="/mentor/students" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/mentor/students', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>My Students</a>
                            <a href="/mentor/session" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/mentor/session', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Schedule a Session</a>
                            <a href="/mentor/sessions" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/mentor/sessions', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Scheduled Sessions</a>
                          </>
                        )}
                         {normalizedRole === 'admin' && (
                           <>
                             <a href="/admin/dashboard" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/admin/dashboard', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Overview</a>
                             {/* Student Forms page removed; link intentionally omitted */}
                             <a href="/admin/live-sessions" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/admin/live-sessions', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Live Sessions</a>
                             <a href="/admin/history" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/admin/history', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Admin History</a>
                             <a href="/admin/mentors" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/admin/mentors', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Mentors</a>
                             <a href="/admin/mentor-assign" className={styles['sidebar-link']} onClick={(e) => { e.preventDefault(); router.push('/admin/mentor-assign', undefined, { scroll: false }); try{ e.currentTarget.blur(); }catch{} }}>Mentor Assignment</a>
                           </>
                         )}
                      </>
                    )}
                  </div>
                  <div className={styles['mobile-divider']} />
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    role="menuitem"
                    className={styles['logout-button']}
                  >
                    Logout
                  </button>
                </nav>
              </>
            )}
          </div>

          {/* Always render children below the header, regardless of device */}
          <div className={styles['dashboard-content-wrapper']}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}