import api from './frontend/pages/api.js';

const run = async () => {
  try {
    console.log('Registering a student...');
    const stuRes = await api.post('/student/auth/register', { name: 'Test Student', email: 'stu@example.com', password: 'pass' });
    const student = stuRes.data.student;
    console.log('Student:', student);

    console.log('Registering mentor A...');
    const menA = await api.post('/mentor/auth/register', { name: 'Mentor A', email: 'mena@example.com', password: 'pass' });
    const mentorA = menA.data.mentor;
    console.log('Mentor A:', mentorA);

    console.log('Registering mentor B...');
    const menB = await api.post('/mentor/auth/register', { name: 'Mentor B', email: 'menb@example.com', password: 'pass' });
    const mentorB = menB.data.mentor;
    console.log('Mentor B:', mentorB);

    console.log('Submitting student form...');
    const formRes = await api.post('/forms/submit', {
      studentId: student.id,
      studentEmail: student.email,
      studentName: student.name,
      interests: ['JS','React'],
      desiredDomain: 'Frontend'
    });
    const form = formRes.data.form;
    console.log('Form created:', form.id);

    console.log('Attempt unauthorized status update as Mentor B (should fail)...');
    try {
      await api.put(`/mentor/students/${form.id}/status?mentorId=${mentorB.id}`, { status: 'in_progress' });
      console.error('ERROR: Mentor B should not have been allowed to update status');
    } catch (err) {
      console.log('Expected error (unauthorized):', err.response?.data || err.message);
    }

    console.log('Assigning Mentor A via admin mock endpoint...');
    const assign = await api.put(`/admin/forms/${form.id}/assign-mentor`, { mentorId: mentorA.id, mentorName: mentorA.name });
    console.log('Assign response:', assign.data.message);

    console.log('Attempt status update as Mentor B again (should still fail)...');
    try {
      await api.put(`/mentor/students/${form.id}/status?mentorId=${mentorB.id}`, { status: 'in_progress' });
      console.error('ERROR: Mentor B should not have been allowed to update status after assignment to A');
    } catch (err) {
      console.log('Expected error (unauthorized):', err.response?.data || err.message);
    }

    console.log('Attempt status update as Mentor A (should succeed)...');
    const ok = await api.put(`/mentor/students/${form.id}/status?mentorId=${mentorA.id}`, { status: 'in_progress' });
    console.log('Update response:', ok.data.message, 'New status:', ok.data.form.status);

    console.log('Test complete');
  } catch (err) {
    console.error('Test script error:', err.response?.data || err.message || err);
  }
};

run();
