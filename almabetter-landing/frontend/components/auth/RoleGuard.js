// RoleGuard.js
// Lightweight, non-invasive route guard for role isolation
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

/**
 * Usage: Wrap any page export with <RoleGuard allowedRole="admin|mentor|student">...</RoleGuard>
 * If role does not match, will show 403 or redirect to /auth/login if not authenticated.
 */
export default function RoleGuard({ allowedRole, children }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'unauth' | 'forbidden'

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    if (!token) {
      setStatus('unauth');
      return;
    }
    let role = storedRole ? String(storedRole).toLowerCase() : null;
    // Try to decode role from JWT if present
    try {
      const parts = token.split('.');
      if (parts[1]) {
        let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (payload.length % 4) payload += '=';
        const decoded = atob(payload);
        const parsed = JSON.parse(decoded);
        if (parsed.role) role = String(parsed.role).toLowerCase();
      }
    } catch (e) {}
    if (!role) {
      setStatus('unauth');
      return;
    }
    // allow `allowedRole` to be a string or an array of strings
    const allowed = Array.isArray(allowedRole) ? allowedRole.map(r => String(r).toLowerCase()) : [String(allowedRole).toLowerCase()];
    if (!allowed.includes(role)) {
      setStatus('forbidden');
      return;
    }
    setStatus('ok');
  }, [allowedRole]);

  if (status === 'checking') return null;
  if (status === 'unauth') {
    if (typeof window !== 'undefined') router.replace('/auth/login');
    return null;
  }
  if (status === 'forbidden') {
    return (
      <div style={{padding:'4rem',textAlign:'center'}}>
        <h1>403 Forbidden</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }
  return children;
}
