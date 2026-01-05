const getBaseUrl = () => {
  // Prefer explicit API URL env var for Next.js
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    if (process.env.NEXT_PUBLIC_API_HOST) return process.env.NEXT_PUBLIC_API_HOST.replace(/\/$/, '');
  }
  // No backend configured — frontend will use mock responses for certain endpoints
  return null;
};

export const API_HOST = getBaseUrl();

// In-memory mock user store used when no real API is configured
const _mockStore = {
  students: {},
  mentors: {}
};
_mockStore.forms = {};

const _makeId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

const callFetch = async (method, path, data) => {
  const base = getBaseUrl();
  // If a base is configured, call it directly
  if (base) {
    const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
    const opts = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    // If data is FormData, let the browser set the Content-Type (multipart boundary)
    const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
    if (isFormData) {
      delete opts.headers['Content-Type'];
      opts.body = data;
    } else if (data) {
      opts.body = JSON.stringify(data);
    }

    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      const err = new Error(text || `Request failed with status ${res.status}`);
      err.response = { status: res.status, data: text };
      throw err;
    }
    const json = await res.json().catch(() => null);
    return { data: json };
  }

  // No external base configured — try Next API proxy first
  try {
    const proxyUrl = path.startsWith('/') ? `/api/proxy${path}` : `/api/proxy/${path}`;
    const opts = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
    if (isFormData) {
      // Let fetch send FormData and omit Content-Type so boundary is set
      delete opts.headers['Content-Type'];
      opts.body = data;
    } else if (data) {
      opts.body = JSON.stringify(data);
    }

    const res = await fetch(proxyUrl, opts);
    if (!res.ok) {
      const text = await res.text();
      // If proxy returns 502 (no backend), fall back to mocks
      if (res.status === 502) return mockResponse(method, path, data);
      const err = new Error(text || `Proxy request failed with status ${res.status}`);
      err.response = { status: res.status, data: text };
      throw err;
    }
    const json = await res.json().catch(() => null);
    return { data: json };
  } catch (err) {
    // If proxy failed (e.g. Next API route not available), try calling backend directly
    try {
      const directBase = 'http://localhost:5000';
      const url = path.startsWith('http') ? path : `${directBase}${path.startsWith('/') ? '' : '/'}${path}`;
      const directOpts = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (data) directOpts.body = JSON.stringify(data);
      const directRes = await fetch(url, directOpts);
      if (!directRes.ok) {
        const text = await directRes.text();
        const err2 = new Error(text || `Direct request failed with status ${directRes.status}`);
        err2.response = { status: directRes.status, data: text };
        throw err2;
      }
      const json = await directRes.json().catch(() => null);
      return { data: json };
    } catch (err2) {
      // If direct backend call also fails, fall back to mocks
      return mockResponse(method, path, data);
    }
  }
};

const mockResponse = (method, path, data) => {
  // Basic mocked responses used by the frontend forms during local development
  if (method.toLowerCase() === 'post' && path === '/student/auth/register') {
    const { email, password, name } = data || {};
    const id = _makeId('student');
    _mockStore.students[email] = { id, email, password, name };
    return Promise.resolve({ data: { token: `mock-student-token-${id}`, student: { id, email, name } } });
  }
  if (method.toLowerCase() === 'post' && path === '/mentor/auth/register') {
    const { email, password, name } = data || {};
    const id = _makeId('mentor');
    _mockStore.mentors[email] = { id, email, password, name };
    return Promise.resolve({ data: { token: `mock-mentor-token-${id}`, mentor: { id, email, name } } });
  }
  if (method.toLowerCase() === 'post' && path.includes('/auth/login')) {
    const { email, password } = data || {};
    // Student login
    if (path.includes('/student/auth/login') || path.includes('/student/auth')) {
      const user = _mockStore.students[email];
      if (!user || user.password !== password) {
        const err = new Error('Incorrect email or password');
        err.response = { status: 401, data: { message: 'Incorrect email or password' } };
        return Promise.reject(err);
      }
      return Promise.resolve({ data: { token: `mock-student-token-${user.id}`, student: { id: user.id, email: user.email, name: user.name } } });
    }
    // Mentor login
    if (path.includes('/mentor/auth/login') || path.includes('/mentor/auth')) {
      const user = _mockStore.mentors[email];
      if (!user || user.password !== password) {
        const err = new Error('Incorrect email or password');
        err.response = { status: 401, data: { message: 'Incorrect email or password' } };
        return Promise.reject(err);
      }
      return Promise.resolve({ data: { token: `mock-mentor-token-${user.id}`, mentor: { id: user.id, email: user.email, name: user.name } } });
    }
    // Generic user
    return Promise.reject(new Error('No mock available for this login endpoint'));
  }

  // Mock mentor students list
  if (method.toLowerCase() === 'get' && path.startsWith('/mentor/students')) {
    const parts = path.split('?');
    const params = new URLSearchParams(parts[1] || '');
    const mentorId = params.get('mentorId');
    let list = Object.values(_mockStore.forms).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
    if (mentorId) {
      list = list.filter(f => f.mentorId === mentorId || String(f.mentorId) === String(mentorId));
    }
    return Promise.resolve({ data: list });
  }

  // Mock forms submission
  if (method.toLowerCase() === 'post' && path === '/forms/submit') {
    const { studentId, studentEmail, studentName } = data || {};
    const id = _makeId('form');
    const now = new Date().toISOString();
    const form = {
      id,
      studentId: studentId || null,
      studentEmail: studentEmail || null,
      studentName: studentName || 'Anonymous',
      interests: data.interests || [],
      desiredDomain: data.desiredDomain || '',
      experience: data.experience || '',
      goals: data.goals || '',
      status: 'assigned',
      createdAt: now
    };
    _mockStore.forms[id] = form;
    return Promise.resolve({ data: { message: 'Interest form submitted successfully', form } });
  }

  // Mock get my-form: support query ?userId= or ?email=
  if (method.toLowerCase() === 'get' && path.startsWith('/forms/my-form')) {
    const parts = path.split('?');
    const params = new URLSearchParams(parts[1] || '');
    const userId = params.get('userId');
    const email = params.get('email');
    const list = Object.values(_mockStore.forms).sort((a,b) => (a.createdAt < b.createdAt ? 1 : -1));
    let filtered = list;
    if (userId) filtered = list.filter(f => f.studentId === userId || String(f.studentId) === String(userId));
    else if (email) filtered = list.filter(f => f.studentEmail === email);
    if (filtered.length === 0) {
      const err = new Error('No form found');
      err.response = { status: 404, data: { message: 'No form found' } };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: filtered[0] });
  }

  // Mock admin assign mentor: PUT /admin/forms/:formId/assign-mentor
  if (method.toLowerCase() === 'put' && path.includes('/admin/forms/') && path.includes('assign-mentor')) {
    const pathParts = path.split('?')[0].split('/');
    const formId = pathParts[pathParts.length - 2] === 'forms' ? pathParts[pathParts.length - 1] : pathParts[pathParts.length - 2];
    const form = _mockStore.forms[formId] || Object.values(_mockStore.forms).find(f => f.id === formId || f.id === formId);
    if (!form) {
      const err = new Error('Form not found');
      err.response = { status: 404, data: { message: 'Form not found' } };
      return Promise.reject(err);
    }
    const { mentorId, mentorName } = data || {};
    if (!mentorId) {
      const err = new Error('mentorId is required');
      err.response = { status: 400, data: { message: 'mentorId is required' } };
      return Promise.reject(err);
    }
    form.mentorId = mentorId;
    form.mentorName = mentorName || form.mentorName || null;
    form.status = 'assigned';
    return Promise.resolve({ data: { message: 'Mentor assigned successfully', form } });
  }

  // Mock mentor update status endpoint: PUT /mentor/students/:formId/status?mentorId=...
  if (method.toLowerCase() === 'put' && path.includes('/mentor/students/') && path.endsWith('/status')) {
    const pathParts = path.split('?')[0].split('/');
    const formId = pathParts[pathParts.length - 2] === 'students' ? pathParts[pathParts.length - 1] : pathParts[pathParts.length - 2];
    const params = new URLSearchParams((path.split('?')[1] || ''));
    const mentorId = params.get('mentorId');
    const form = _mockStore.forms[formId] || Object.values(_mockStore.forms).find(f => f.id === formId || f.id === formId);
    if (!form) {
      const err = new Error('Form not found');
      err.response = { status: 404, data: { message: 'Form not found' } };
      return Promise.reject(err);
    }
    if (!mentorId || String(form.mentorId) !== String(mentorId)) {
      const err = new Error('Not authorized to update this student');
      err.response = { status: 403, data: { message: 'Not authorized to update this student' } };
      return Promise.reject(err);
    }
    // apply status
    if (data && data.status) form.status = data.status;
    return Promise.resolve({ data: { message: 'Status updated', form } });
  }

  return Promise.reject(new Error('No API configured and no mock available for this endpoint'));
};

export default {
  get: (path) => callFetch('get', path),
  post: (path, data) => callFetch('post', path, data),
  put: (path, data) => callFetch('put', path, data),
  delete: (path) => callFetch('delete', path)
};
