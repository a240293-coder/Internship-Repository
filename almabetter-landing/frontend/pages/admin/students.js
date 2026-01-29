
import { useEffect } from 'react';
import { useRouter } from 'next/router';

// This page was removed — redirect to Mentor Assignment to avoid 404.
export default function AdminStudentForms() {
  const router = useRouter();
  useEffect(() => {
    try { router.replace('/admin/mentor-assign'); } catch (e) { window.location.href = '/admin/mentor-assign'; }
  }, []);
  return null;
}
