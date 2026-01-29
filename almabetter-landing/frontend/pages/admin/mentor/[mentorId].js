import React from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../../components/DashboardLayout';
import MentorActivityDetails from '../../../components/MentorActivityDetails';

export default function MentorActivityPage() {
  const router = useRouter();
  const { mentorId } = router.query;

  return (
    <DashboardLayout title="Mentor Activity" role="admin">
      <MentorActivityDetails mentorId={mentorId} />
    </DashboardLayout>
  );
}
