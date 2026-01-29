import MentorDashboard from '../../pages/auth/MentorDashboard';
import RoleGuard from '../../components/auth/RoleGuard';

export default function MentorDashboardPage() {
	return (
		<RoleGuard allowedRole="mentor">
			<MentorDashboard />
		</RoleGuard>
	);
}
