import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiBell, FiSearch, FiLogOut, FiUser, FiSettings, FiChevronDown } from 'react-icons/fi';
import DashboardSidebar from './DashboardSidebar';
import styles from './DashboardLayout.module.css';

export default function DashboardLayout({ children, title, role, onLogout }) {
  const [isMobile, setIsMobile] = useState(false);
  const [userName, setUserName] = useState('Member');
  const [userEmail, setUserEmail] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobile]);

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
              <h1 className={styles['welcome-title']}>Welcome, {userName || 'User'}</h1>
              <p className={styles['welcome-subtitle']}>Here's an overview of your progress and upcoming tasks.</p>
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