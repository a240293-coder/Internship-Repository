import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  FileText,
  Calendar,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar({ role, userName, userEmail, isCollapsed, onToggle }) {
  const router = useRouter();

  // Auto-collapse on smaller desktop screens if desired, or persist to localStorage
  // For now, simple state.

  const roleLinks = {
    student: [
      { href: '/student/dashboard', label: 'Dashboard', icon: Home },
      { href: '/student/form?mode=new', label: 'Interest Form', icon: FileText },
      { href: '/student/sessions', label: 'Upcoming Sessions', icon: Calendar },
      { href: '/student/update_interest_form', label: 'Update Interest Form', icon: FileText }
    ],
    mentor: [
      { href: '/mentor/dashboard', label: 'Dashboard' },
      { href: '/mentor/students', label: 'My Students' },
      { href: '/mentor/session', label: 'Schedule a Session' },
      { href: '/mentor/sessions', label: 'Scheduled Sessions' },
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Overview' },
      { href: '/admin/live-sessions', label: 'Live Sessions' },
      { href: '/admin/history', label: 'Admin History' },
      { href: '/admin/mentors', label: 'Mentors' },
      { href: '/admin/mentor-assign', label: 'Mentor Assignment' }
      // 'Reports' removed universally
    ]
  };

  const links = roleLinks[role] || [];
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';

  // Calculate initials from userName or default to 'N'
  const initials = userName
    ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'S';

  return (
    <aside
      className={`${styles['dashboard-sidebar']} ${isCollapsed ? styles['collapsed'] : ''}`}
      aria-label={`${roleLabel} navigation`}
    >
      {/* ===== Toggle Button ===== */}
      <button
        className={styles['sidebar-toggle']}
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* ===== User Profile (TOP) ===== */}
      <div className={styles['sidebar-header']}>
        <div className={styles['profile-avatar']}>{initials}</div>

        <div className={`${styles['profile-info']} ${isCollapsed ? styles['hidden'] : ''}`}>
          <p className={styles['profile-name']}>{userName || 'User'}</p>
          <span className={styles['profile-email']}>
            {userEmail || ''}
          </span>
        </div>
      </div>

      <div className={styles['sidebar-section']}>
        {!isCollapsed && <p className={styles['sidebar-label']}>Navigation</p>}

        <nav>
          <ul>
            {links.map((link) => {
              const isActive =
                router?.pathname === link.href.split('?')[0] ||
                router?.pathname?.startsWith(link.href.split('?')[0] + '/');
              const handleClick = (e) => {
                try { e.preventDefault(); } catch { }
                try {
                  router.push(link.href, undefined, { scroll: false });
                } catch {
                  window.location.href = link.href;
                }
                try {
                  e.currentTarget?.blur();
                } catch { }
              };

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles['sidebar-link']} ${isActive ? styles['active'] : ''
                      }`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={handleClick}
                    title={isCollapsed ? link.label : ''}
                  >
                    {link.icon ? <link.icon size={20} /> : null}
                    {!isCollapsed && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

    </aside>
  );
}