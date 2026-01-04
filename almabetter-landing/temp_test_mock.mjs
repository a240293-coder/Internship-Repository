// Standalone test that mimics the mock behavior added to frontend/pages/api.js
const _mockStore = { students: {}, mentors: {} };
const _makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const mockRegister = async (type, { email, password, name }) => {
  const id = _makeId(type === 'student' ? 'student' : 'mentor');
  if (type === 'student') _mockStore.students[email] = { id, email, password, name };
  else _mockStore.mentors[email] = { id, email, password, name };
  return { data: { token: `${type}-token-${id}`, [type]: { id } } };
};

const mockLogin = async (type, { email, password }) => {
  const user = type === 'student' ? _mockStore.students[email] : _mockStore.mentors[email];
  if (!user || user.password !== password) {
    const err = new Error('Incorrect email or password');
    err.response = { status: 401, data: { message: 'Incorrect email or password' } };
    throw err;
  }
  return { data: { token: `${type}-token-${user.id}`, [type]: { id: user.id } } };
};

(async () => {
  try {
    console.log('Registering student...');
    const reg = await mockRegister('student', { email: 'foo@example.com', password: 'pass', name: 'Foo' });
    console.log('Register response:', reg);

    try {
      console.log('\nAttempt login with unregistered email...');
      await mockLogin('student', { email: 'bar@example.com', password: 'pass' });
    } catch (e) {
      console.log('Expected failure (unregistered):', e.response?.data || e.message);
    }

    try {
      console.log('\nAttempt login with wrong password...');
      await mockLogin('student', { email: 'foo@example.com', password: 'wrong' });
    } catch (e) {
      console.log('Expected failure (wrong password):', e.response?.data || e.message);
    }

    console.log('\nAttempt login with correct credentials...');
    const login = await mockLogin('student', { email: 'foo@example.com', password: 'pass' });
    console.log('Login success:', login);
  } catch (err) {
    console.error('Test script error:', err);
  }
  process.exit(0);
})();
