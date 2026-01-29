import StudentDashboard from '../../pages/auth/StudentDashboard';
import RoleGuard from '../../components/auth/RoleGuard';

export default function StudentDashboardPage() {
	return (
		<RoleGuard allowedRole="student">
			<StudentDashboard />
		</RoleGuard>
	);
}
