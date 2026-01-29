import styles from './AdminStatsCards.module.css';
import { useEffect, useState } from 'react';
import api from '../lib/api';

const ADMIN_STATS = [
	{ key: 'mentors', label: 'Total Mentors', description: 'All mentors in the system' },
	{ key: 'studentForms', label: 'Student Forms', description: 'Forms submitted by students' },
	{ key: 'students', label: 'Registered Students', description: 'Active student registrations' },
	{ key: 'sessions', label: 'Live Sessions Booked', description: 'Total live sessions booked' },
	{ key: 'completedSessions', label: 'Sessions Completed', description: 'Sessions marked as completed' },
];

export default function AdminStatsCards() {
	const [stats, setStats] = useState({});
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
				// Get completed live sessions count
				const { data: completedSessionsData } = await api.get('/admin/history/completed-sessions');
				if (mounted) {
					setStats({
						mentors: data.mentors || 0,
						students: data.students || 0,
						sessions: data.sessions || 0,
						studentForms: Array.isArray(formsData) ? formsData.length : 0,
						completedSessions: Array.isArray(completedSessionsData?.data) ? completedSessionsData.data.length : 0,
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
		<section className={styles.stats}>
			<div className={styles.grid}>
				{loading ? (
					<div>Loading stats...</div>
				) : error ? (
					<div style={{ color: 'red' }}>{error}</div>
				) : (
					ADMIN_STATS.map((stat, i) => (
						<div key={stat.key} className={styles.statCard}>
							<div className={styles.statLabel}>{stat.label.toUpperCase()}</div>
							<div className={styles.statValue}>{stats[stat.key] ?? 0}</div>
							<div className={styles.statDesc}>{stat.description}</div>
						</div>
					))
				)}
			</div>
		</section>
	);
}
