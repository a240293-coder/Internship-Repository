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
  // Debug: log token for every API call
  if (typeof window !== 'undefined') {
    const debugToken = window.localStorage.getItem('token');
    console.log('[API DEBUG] Token in localStorage (callFetch):', debugToken);
  }
  const base = getBaseUrl();
  // If a base is configured, call it directly
  let url = path;
  if (base) {
    url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  console.log('[API DEBUG] Final URL:', url); // Debug log for final URL
  const opts = {
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json'
    }
  };
  // Always add Authorization header if token exists
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token');
    console.log('[API DEBUG] Token in localStorage:', token);
    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  // If data is FormData, let the browser set the Content-Type (multipart boundary)
  const isFormData = (typeof FormData !== 'undefined') && (data instanceof FormData);
  if (isFormData) {
    delete opts.headers['Content-Type'];
    opts.body = data;
  } else if (data) {
    opts.body = JSON.stringify(data);
  }

  // If an explicit external API base is configured, call it directly.
  if (base) {
    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch (e) { parsed = null; }

      // Gracefully handle auth errors
      if (res.status === 401 || res.status === 403) {
        return Promise.reject({
          isAuthError: true,
          status: res.status,
          message: (parsed && parsed.message) || 'Unauthorized'
        });
      }

      const errMsg = (parsed && parsed.message) || text || `Request failed with status ${res.status}`;
      const err = new Error(errMsg);
      err.response = { status: res.status, data: parsed || text };
      throw err;
    }
    const json = await res.json().catch(() => null);
    return { data: json };
  }

  // No external base configured — prefer the Next proxy, then direct backend, then mocks.
  try {
    const proxyUrl = path.startsWith('/') ? `/api/proxy${path}` : `/api/proxy/${path}`;
    const proxyOpts = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const isFormData2 = (typeof FormData !== 'undefined') && (data instanceof FormData);
    if (isFormData2) {
      delete proxyOpts.headers['Content-Type'];
      proxyOpts.body = data;
    } else if (data) {
      proxyOpts.body = JSON.stringify(data);
    }

    const resProxy = await fetch(proxyUrl, proxyOpts);
    if (!resProxy.ok) {
      const text = await resProxy.text();
      let parsed = null;
      try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
      // If proxy returns 502 (no backend), fall back to direct
      if (resProxy.status === 502) {
        throw { __tryDirect: true };
      }
      const errMsg = (parsed && parsed.message) || text || `Proxy request failed with status ${resProxy.status}`;
      const err = new Error(errMsg);
      err.response = { status: resProxy.status, data: parsed || text };
      throw err;
    }
    const jsonProxy = await resProxy.json().catch(() => null);
    return { data: jsonProxy };
  } catch (err) {
    // If proxy not available or explicitly signalled, try direct backend next
    try {
      const directBase = 'http://localhost:5000';
      const directUrl = path.startsWith('http') ? path : `${directBase}${path.startsWith('/') ? '' : '/'}${path}`;
      const directOpts = {
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('token');
        if (token) directOpts.headers['Authorization'] = `Bearer ${token}`;
      }
      const isFormData3 = (typeof FormData !== 'undefined') && (data instanceof FormData);
      if (isFormData3) {
        delete directOpts.headers['Content-Type'];
        directOpts.body = data;
      } else if (data) {
        directOpts.body = JSON.stringify(data);
      }
      const directRes = await fetch(directUrl, directOpts);
      if (!directRes.ok) {
        const text = await directRes.text();
        let parsed = null;
        try { parsed = JSON.parse(text); } catch (e) { parsed = null; }
        const err2 = new Error((parsed && parsed.message) || text || `Direct request failed with status ${directRes.status}`);
        err2.response = { status: directRes.status, data: parsed || text };
        throw err2;
      }
      const jsonDirect = await directRes.json().catch(() => null);
      return { data: jsonDirect };
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
    const { email, password, name, expertise } = data || {};
    const id = _makeId('mentor');
    _mockStore.mentors[email] = { id, email, password, name, expertise: Array.isArray(expertise) ? expertise.join(',') : (expertise || '') };
    return Promise.resolve({ data: { token: `mock-mentor-token-${id}`, mentor: { id, email, name, expertise: _mockStore.mentors[email].expertise } } });
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


  // Mock mentor list for /mentor/all
  if (method.toLowerCase() === 'get' && path === '/mentor/all') {
    return Promise.resolve({ data: Object.values(_mockStore.mentors) });
  }

  // Mock update mentor profile endpoint: PUT /mentor/dashboard/:id
  if (method.toLowerCase() === 'put' && path.startsWith('/mentor/dashboard/')) {
    const parts = path.split('/');
    const id = parts[parts.length - 1];
    const mentorsArr = Object.values(_mockStore.mentors || {});
    const mentor = mentorsArr.find(m => String(m.id) === String(id));
    if (!mentor) {
      const err = new Error('Mentor not found');
      err.response = { status: 404, data: { message: 'Mentor not found' } };
      return Promise.reject(err);
    }
    const { expertise, bio, experience_years } = data || {};
    if (Array.isArray(expertise)) mentor.expertise = expertise.join(',');
    else if (typeof expertise === 'string') mentor.expertise = expertise;
    if (bio) mentor.bio = bio;
    if (typeof experience_years !== 'undefined') mentor.experience_years = experience_years;
    return Promise.resolve({ data: mentor });
  }

  // Mock admin mentor detail: GET /admin/mentors/:id
  if (method.toLowerCase() === 'get' && path.startsWith('/admin/mentors/')) {
    const parts = path.split('/');
    const id = parts[parts.length - 1];
    const mentor = Object.values(_mockStore.mentors || {}).find(m => String(m.id) === String(id) || m.email === id);
    if (!mentor) {
      const err = new Error('Mentor not found');
      err.response = { status: 404, data: { message: 'Mentor not found' } };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: { data: mentor } });
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

  // Mock mentor sessions: create and list
  if (method.toLowerCase() === 'post' && path === '/mentor/sessions') {
    const id = _makeId('session');
    const session = {
      id,
      mentorId: (typeof data.mentorId !== 'undefined') ? data.mentorId : null,
      studentId: data.studentId,
      agenda: data.agenda,
      description: data.description || null,
      timing: data.timing,
      meeting_link: data.meetingLink || data.meeting_link || '' ,
      createdAt: new Date().toISOString()
    };
    _mockStore.sessions = _mockStore.sessions || {};
    _mockStore.sessions[id] = session;
    return Promise.resolve({ data: { message: 'Session created', id } });
  }

  if (method.toLowerCase() === 'get' && path === '/mentor/sessions') {
    const list = Object.values(_mockStore.sessions || {}).filter(s => String(s.mentorId) === String((new URLSearchParams(path.split('?')[1] || '')).get('mentorId')) || true);
    return Promise.resolve({ data: list });
  }

  if (method.toLowerCase() === 'get' && path.startsWith('/student/sessions')) {
    const parts = path.split('?');
    const params = new URLSearchParams(parts[1] || '');
    const userId = params.get('userId') || null;
    const sessions = Object.values(_mockStore.sessions || {}).filter(s => (userId ? String(s.studentId) === String(userId) : true));
    return Promise.resolve({ data: sessions });
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


const api = {
  get: (path) => callFetch('get', path),
  post: (path, data) => callFetch('post', path, data),
  put: (path, data) => callFetch('put', path, data),
  delete: (path) => callFetch('delete', path)
};

export default api;
