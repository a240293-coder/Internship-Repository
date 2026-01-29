(async () => {
  const base = 'http://localhost:5000';
  const email = `test.user+${Date.now()}@example.com`;
  const password = 'Password123!';
  const name = 'Test User';
  const fetch = global.fetch || (await import('node-fetch')).default;

  console.log('Registering test student:', email);
  try {
    const r = await fetch(`${base}/student/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const j = await r.json().catch(() => null);
    console.log('/student/auth/register', r.status, j);
  } catch (e) { console.error('register error', e.message); }

  console.log('Logging in...');
  const loginRes = await fetch(`${base}/student/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginJson = await loginRes.json().catch(() => null);
  console.log('/student/auth/login', loginRes.status, loginJson);
  if (!loginJson || !loginJson.token) {
    console.error('Login failed; aborting');
    process.exit(1);
  }
  const token = loginJson.token;
  const studentId = loginJson.student && loginJson.student.id;

  const formBody = {
    interests: ['Web Development','AI'],
    desiredDomain: 'Web Development',
    goals: 'Get an internship',
    studentId,
    studentEmail: email,
    studentName: name
  };

  console.log('Submitting first form...');
  const submit1 = await fetch(`${base}/forms/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formBody)
  });
  const s1j = await submit1.json().catch(() => null);
  console.log('/forms/submit (1)', submit1.status, s1j);

  console.log('Submitting second form (should 409)...');
  const submit2 = await fetch(`${base}/forms/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formBody)
  });
  const s2j = await submit2.json().catch(() => null);
  console.log('/forms/submit (2)', submit2.status, s2j);

  console.log('Fetching my form...');
  const myForm = await fetch(`${base}/forms/my-form?userId=${studentId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const mfj = await myForm.json().catch(() => null);
  console.log('/forms/my-form', myForm.status, mfj);

  process.exit(0);
})();
