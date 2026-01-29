// Admin dashboard main page, navigation only


import DashboardLayout from '../../components/DashboardLayout';
import RoleGuard from '../../components/auth/RoleGuard';
import AdminStatsCards from '../../components/AdminStatsCards';
import AdminKPIDashboard from '../../components/AdminKPIDashboard';
import { useEffect, useState } from 'react';
import api from '../../lib/api';


export default function AdminDashboard() {
	const [stats, setStats] = useState({ mentors: 0, studentForms: 0, students: 0 });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let mounted = true;
		async function fetchStats() {
			setLoading(true);
			setError(null);
			try {
				// Get main stats
				const { data } = await api.get('/admin/dashboard');
				// Get student forms count
				const { data: formsData } = await api.get('/admin/forms');
				if (mounted) {
					setStats({
						mentors: data.mentors || 0,
						students: data.students || 0,
						studentForms: Array.isArray(formsData) ? formsData.length : 0
					});
				}
			} catch (err) {
				setError('Failed to load stats');
			} finally {
				if (mounted) setLoading(false);
			}
		}
		fetchStats();
		return () => { mounted = false; };
	}, []);

	return (
		<RoleGuard allowedRole="admin">
			<DashboardLayout title="Admin Dashboard" role="admin">
				{/* Admin KPI Dashboard */}
				<AdminKPIDashboard />
			</DashboardLayout>
		</RoleGuard>
	);
}
