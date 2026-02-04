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
  const [scrolled, setScrolled] = useState(false);

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
    const storedName = localStorage.getItem(roleKey) || localStorage.getItem('userName') || 'Member';
    setUserName(storedName);

    const token = localStorage.getItem('token');
    if (!token) router.replace('/auth/login');
  }, [normalizedRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        // Only close if it's not the hamburger button
        if (!event.target.closest(`.${styles['mobile-menu-trigger']}`)) {
          setMobileMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      sessionStorage.clear();
      router.push('/auth/login');
    }
  };

  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';

  return (
    <div className={styles['dashboard-container']}>
      {/* Sidebar for Desktop */}
      {!isMobile && <DashboardSidebar role={role} />}

      <div className={styles['dashboard-main']}>
        {/* Header */}
        <header className={`${styles['header']} ${scrolled ? styles['header-scrolled'] : ''}`}>
          <div className={styles['header-left']}>
            {isMobile && (
              <button
                className={styles['mobile-menu-trigger']}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

            <button className={styles['notification-btn']}>
              <FiBell />
              <span className={styles['notification-dot']} />
            </button>

            <div className={styles['profile-section']} ref={profileRef}>
              <button
                className={styles['profile-trigger']}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className={styles['avatar']}>{initials}</div>
                {!isMobile && (
                  <>
                    <div className={styles['profile-info']}>
                      <span className={styles['profile-name']}>{userName}</span>
                      <span className={styles['profile-role']}>{roleLabel}</span>
                    </div>
                    <FiChevronDown className={`${styles['chevron']} ${profileOpen ? styles['chevron-rotate'] : ''}`} />
                  </>
                )}
              </button>

              {profileOpen && (
                <div className={styles['profile-dropdown']}>
                  <Link href={`/${normalizedRole}/profile`} className={styles['dropdown-item']}>
                    <FiUser /> Profile
                  </Link>
                  <Link href={`/${normalizedRole}/settings`} className={styles['dropdown-item']}>
                    <FiSettings /> Settings
                  </Link>
                  <div className={styles['dropdown-divider']} />
                  <button onClick={handleLogout} className={`${styles['dropdown-item']} ${styles['logout-item']}`}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobile && mobileMenuOpen && (
          <div className={styles['mobile-drawer-overlay']} onClick={() => setMobileMenuOpen(false)}>
            <div
              className={styles['mobile-drawer']}
              ref={mobileMenuRef}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles['drawer-header']}>
                <div className={styles['drawer-logo']}>LearnBetter</div>
                <button onClick={() => setMobileMenuOpen(false)}><FiX /></button>
              </div>
              <DashboardSidebar role={role} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={styles['content-area']}>
          <div className={styles['content-header']}>
            <h1 className={styles['page-title']}>{title}</h1>
            <p className={styles['page-subtitle']}>Welcome back, {userName}!</p>
          </div>
          <div className={styles['page-content']}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}