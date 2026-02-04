import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './DashboardSidebar.module.css';

export default function DashboardSidebar({ role }) {
  const router = useRouter();

  const roleLinks = {
    student: [
      { href: '/student/dashboard', label: 'Dashboard' },
      { href: '/student/form?mode=new', label: 'Interest Form' },
      { href: '/student/sessions', label: 'Upcoming Sessions' }
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

  return (
    <aside className={styles['dashboard-sidebar']} aria-label={`${roleLabel} navigation`}>
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-logo']}>LearnBetter</div>
        <div className={styles['sidebar-tagline']}>{roleLabel} Portal</div>
      </div>

      <div className={styles['sidebar-section']}>
        <p className={styles['sidebar-label']}>Navigation</p>
        <nav>
          <ul>
            {links.map((link) => {
              const isActive = router?.pathname === link.href ||
                router?.pathname?.startsWith(link.href + '/');
              const handleClick = (e) => {
                try { e.preventDefault(); } catch (err) { }
                // Use router.push with scroll:false to avoid browser scroll jumps
                try {
                  router.push(link.href, undefined, { scroll: false });
                } catch (err) {
                  // fallback: normal navigation
                  window.location.href = link.href;
                }
                try { if (e.currentTarget && typeof e.currentTarget.blur === 'function') e.currentTarget.blur(); } catch (err) { }
              };
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles['sidebar-link']} ${isActive ? styles['active'] : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={handleClick}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            {role === 'student' && (
              <li key="update-form">
                <Link href="/student/update_interest_form" className={styles['sidebar-link']}>Update interest form</Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

    </aside>
  );
}