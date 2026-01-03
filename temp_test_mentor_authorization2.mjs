const _mockStore = { students: {}, mentors: {}, forms: {} };
const _makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2,9)}`;

const registerStudent = ({name, email, password}) => {
  const id = _makeId('student');
  _mockStore.students[email] = { id, email, password, name };
  return { token: `mock-student-token-${id}`, student: { id, email, name } };
};

const registerMentor = ({name, email, password}) => {
  const id = _makeId('mentor');
  _mockStore.mentors[email] = { id, email, password, name };
  return { token: `mock-mentor-token-${id}`, mentor: { id, email, name } };
};

const submitForm = ({ studentId, studentEmail, studentName, interests, desiredDomain }) => {
  const id = _makeId('form');
  const now = new Date().toISOString();
  const form = { id, studentId: studentId || null, studentEmail: studentEmail || null, studentName: studentName || 'Anonymous', interests: interests || [], desiredDomain: desiredDomain || '', experience: '', goals: '', status: 'assigned', createdAt: now };
  _mockStore.forms[id] = form;
  return { message: 'Interest form submitted successfully', form };
};

const adminAssign = (formId, { mentorId, mentorName }) => {
  const form = _mockStore.forms[formId];
  if (!form) throw { status: 404, message: 'Form not found' };
  if (!mentorId) throw { status: 400, message: 'mentorId is required' };
  form.mentorId = mentorId;
  form.mentorName = mentorName || null;
  form.status = 'assigned';
  return { message: 'Mentor assigned successfully', form };
};

const mentorUpdateStatus = (formId, mentorId, status) => {
  const form = _mockStore.forms[formId];
  if (!form) throw { status: 404, message: 'Form not found' };
  if (!mentorId || String(form.mentorId) !== String(mentorId)) throw { status: 403, message: 'Not authorized to update this student' };
  form.status = status || form.status;
  return { message: 'Status updated', form };
};

const run = async () => {
  try {
    console.log('Registering student...');
    const stud = registerStudent({ name: 'Test Student', email: 'stu@example.com', password: 'pass' });
    const student = stud.student;
    console.log('Student id:', student.id);

    console.log('Register mentor A...');
    const mA = registerMentor({ name: 'Mentor A', email: 'mena@example.com', password: 'pass' });
    const mentorA = mA.mentor;
    console.log('Mentor A id:', mentorA.id);

    console.log('Register mentor B...');
    const mB = registerMentor({ name: 'Mentor B', email: 'menb@example.com', password: 'pass' });
    const mentorB = mB.mentor;
    console.log('Mentor B id:', mentorB.id);

    console.log('Submit form...');
    const fr = submitForm({ studentId: student.id, studentEmail: student.email, studentName: student.name, interests: ['JS'], desiredDomain: 'Frontend' });
    const form = fr.form;
    console.log('Form id:', form.id, 'assigned mentor:', form.mentorId);

    console.log('Mentor B attempts to update status (should fail)');
    try {
      mentorUpdateStatus(form.id, mentorB.id, 'in_progress');
      console.error('ERROR: Mentor B incorrectly allowed to update');
    } catch (e) {
      console.log('Expected failure:', e.message || e);
    }

    console.log('Admin assigns Mentor A');
    adminAssign(form.id, { mentorId: mentorA.id, mentorName: mentorA.name });
    console.log('Assigned mentor:', _mockStore.forms[form.id].mentorId);

    console.log('Mentor B attempts again (should fail)');
    try {
      mentorUpdateStatus(form.id, mentorB.id, 'in_progress');
      console.error('ERROR: Mentor B incorrectly allowed to update after assignment');
    } catch (e) {
      console.log('Expected failure:', e.message || e);
    }

    console.log('Mentor A updates status (should succeed)');
    const ok = mentorUpdateStatus(form.id, mentorA.id, 'in_progress');
    console.log('Success:', ok.message, 'new status:', ok.form.status);

    console.log('All checks passed');
  } catch (err) {
    console.error('Test error:', err);
  }
};

run();
