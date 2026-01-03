import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function DashboardSidebar({ role }) {
  const router = useRouter();
  const roleLinks = {
    student: [
      { href: '/student/form', label: 'Interest Form' }
    ],
    mentor: [
      { href: '/mentor/dashboard', label: 'Home' },
      { href: '/mentor/profile', label: 'Profile' }
    ],
    admin: [
      { href: '/admin/dashboard', label: 'Overview' },
      { href: '/admin/mentors', label: 'Mentors' },
      { href: '/admin/forms', label: 'Forms' }
    ]
  };

  const links = roleLinks[role] || [];
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Member';

  return (
    <aside className="dashboard-sidebar" aria-label={`${roleLabel} navigation`}>
      <div className="sidebar-section">
        <p className="sidebar-label">Navigation</p>
        <nav>
          <ul>
            {links.map((link) => {
              const isActive = router?.pathname?.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link href={link.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                    {link.label}
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
