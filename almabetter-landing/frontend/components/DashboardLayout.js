import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiBell, FiSearch, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi';
import DashboardSidebar from './DashboardSidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children, title, role, onLogout }) {
  const [isMobile, setIsMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Member');
  const [userEmail, setUserEmail] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      setProfileOpen(false);
      setMobileMenuOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router]);

  const normalizedRole = role ? String(role).toLowerCase() : null;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const roleKey = normalizedRole ? `userName_${normalizedRole}` : 'userName';
    const emailKey = normalizedRole ? `userEmail_${normalizedRole}` : 'userEmail';

    const storedName = localStorage.getItem(roleKey) || localStorage.getItem('userName') || sessionStorage.getItem('userName') || 'Member';
    const storedEmail = localStorage.getItem(emailKey) || localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || '';

    setUserName(storedName);
    setUserEmail(storedEmail);

    const token = localStorage.getItem('token');
    if (!token) router.replace('/auth/login');
  }, [normalizedRole]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        if (!event.target.closest(`.${styles['mobile-menu-trigger']}`)) {
          setMobileMenuOpen(false);
        }
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

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      try {
        const storedRole = localStorage.getItem('userRole');
        const storedRoleNorm = storedRole ? String(storedRole).toLowerCase() : null;
        if (storedRoleNorm) {
          localStorage.removeItem(`userName_${storedRoleNorm}`);
          localStorage.removeItem(`userEmail_${storedRoleNorm}`);
          localStorage.removeItem(`userId_${storedRoleNorm}`);
        }
      } catch (e) { }
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      router.push('/auth/login');
    }
  };

  return (
    <div className={styles['dashboard-container']}>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <DashboardSidebar
          role={role}
          userName={userName}
          userEmail={userEmail}
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      )}

      <div
        className={styles['dashboard-main']}
        style={{
          marginLeft: isMobile ? '0' : (isSidebarCollapsed ? '80px' : '260px'),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Header */}
        <header className={`${styles['header']} ${scrolled ? styles['header-scrolled'] : ''}`}>
          <div className={styles['header-left']}>
            {isMobile && (
              <button
                className={styles['mobile-menu-trigger']}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <FiX /> : <FiMenu />}
              </button>
            )}
            <div className={styles['breadcrumb']}>
              <span className={styles['breadcrumb-role']}>{roleLabel}</span>
              <span className={styles['breadcrumb-separator']}>/</span>
              <span className={styles['breadcrumb-page']}>{title || 'Dashboard'}</span>
            </div>
          </div>

          <div className={styles['header-right']}>
            <div className={styles['header-search']}>
              <FiSearch className={styles['search-icon']} />
              <input type="text" placeholder="Search..." className={styles['search-input']} />
            </div>

            <button className={styles['notification-btn']} aria-label="Notifications">
              <FiBell />
              <span className={styles['notification-dot']} />
            </button>

            <div className={styles['profile-section']} ref={profileRef}>
              <button
                className={styles['profile-trigger']}
                onClick={() => setProfileOpen(!profileOpen)}
                aria-expanded={profileOpen}
              >
                <div className={styles['avatar']}>{initials}</div>
                {!isMobile && (
                  <>
                    <div className={styles['profile-meta']}>
                      <span className={styles['profile-name']}>{userName}</span>
                      <span className={styles['profile-role']}>{roleLabel}</span>
                    </div>
                    <FiChevronDown className={`${styles['chevron']} ${profileOpen ? styles['chevron-rotate'] : ''}`} />
                  </>
                )}
              </button>

              {profileOpen && (
                <div className={styles['profile-dropdown']} role="menu">
                  <Link href={`/${normalizedRole}/profile`} className={styles['dropdown-item']} role="menuitem">
                    <FiUser /> Profile
                  </Link>
                  <Link href={`/${normalizedRole}/settings`} className={styles['dropdown-item']} role="menuitem">
                    <FiSettings /> Settings
                  </Link>
                  <div className={styles['dropdown-divider']} />
                  <button onClick={handleLogout} className={`${styles['dropdown-item']} ${styles['logout-item']}`} role="menuitem">
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobile && (
          <div
            className={`${styles['mobile-drawer-overlay']} ${mobileMenuOpen ? styles['active'] : ''}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ display: mobileMenuOpen ? 'flex' : 'none' }}
          >
            <div
              className={styles['mobile-drawer']}
              ref={mobileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles['mobile-nav-header']}>
                <div className={styles['drawer-logo']}>LearnBetter</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close Menu"
                  className={styles['mobile-close-btn']}
                >
                  <FiX />
                </button>
              </div>

              <div className={styles['mobile-nav-avatar-row']}>
                <div className={styles['mobile-nav-avatar']}>{initials}</div>
                <div className={styles['mobile-nav-avatar-name']}>{userName}</div>
              </div>

              <div className={styles['mobile-divider-blue']} />

              <DashboardSidebar
                role={role}
                userName={userName}
                userEmail={userEmail}
                isCollapsed={false}
              />

              <div className={styles['dropdown-divider']} />
              <button
                onClick={handleLogout}
                className={styles['logout-button']}
                style={{ marginTop: 'auto' }}
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className={styles['content-area']}>
          {/* Welcome Banner - Top of content area */}
          <div className={styles['welcome-banner']}>
            <div className={styles['welcome-text']}>
              <h1 className={styles['welcome-title']}>Welcome, {userName || 'User'} 👋</h1>
              <p className={styles['welcome-subtitle']}>Here's an overview of your progress and upcoming tasks.</p>
            </div>
            <div className={styles['welcome-avatar']}>
              <div style={{
                width: isMobile ? '48px' : '64px',
                height: isMobile ? '48px' : '64px',
                borderRadius: '50%',
                background: '#fff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                border: isMobile ? 'none' : '4px solid rgba(255,255,255,0.3)'
              }}>
                {userName
                  ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'S'}
              </div>
            </div>
          </div>

          <div className={styles['dashboard-content-wrapper']}>
            {children}
          </div>
        </main>
      </div >
    </div >
  );
}