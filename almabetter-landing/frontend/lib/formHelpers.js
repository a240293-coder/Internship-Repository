export const getFormId = (form) => form._id || form.id || form.formId || form._formId || null;

export const getStudentName = (form) => {
  return (
    form.studentName ||
    form.student?.name ||
    form.student?.fullName ||
    form.name ||
    form.student_name ||
    ((form.firstName || '') + (form.lastName ? ' ' + form.lastName : '')) ||
    '--'
  );
};

export const getStudentEmail = (form) => {
  return (
    form.studentEmail ||
    form.student?.email ||
    form.email ||
    form.student_email ||
    '--'
  );
};

export const getDomain = (form) => {
  const candidates = ['desiredDomain', 'desired_domain', 'desired', 'domain', 'course', 'track', 'programme', 'program', 'area'];

  // quick checks for common fields
  for (const key of candidates) {
    if (form[key]) return form[key];
    if (form.student && form.student[key]) return form.student[key];
    if (form.profile && form.profile[key]) return form.profile[key];
  }

  // deep search helper
  const deepFind = (obj, keys, depth = 3) => {
    if (!obj || depth <= 0) return null;
    if (typeof obj !== 'object') return null;
    for (const k of Object.keys(obj)) {
      if (keys.includes(k)) return obj[k];
    }
    for (const k of Object.keys(obj)) {
      const val = obj[k];
      if (Array.isArray(val)) {
        for (const it of val) {
          if (typeof it === 'object') {
            const found = deepFind(it, keys, depth - 1);
            if (found) return found;
          }
        }
      } else if (typeof val === 'object') {
        const found = deepFind(val, keys, depth - 1);
        if (found) return found;
      }
    }
    return null;
  };

  // search object tree
  const found = deepFind(form, candidates, 4);
  if (found) return found;

  // if form contains answers array like [{question, answer}] or [{name, value}]
  if (Array.isArray(form.answers)) {
    for (const a of form.answers) {
      if (!a) continue;
      const text = (a.question || a.name || '').toString().toLowerCase();
      if (text.includes('domain') || text.includes('course') || text.includes('track') || text.includes('area')) {
        if (a.answer) return a.answer;
        if (a.value) return a.value;
      }
    }
  }

  // fallback: look for any string value that looks like a domain keyword
  const flatValues = Object.values(form).filter(v => typeof v === 'string');
  for (const v of flatValues) {
    const s = v.toLowerCase();
    if (s === 'data' || s === 'web' || s === 'science' || s === 'cloud' || s === 'arts') return v;
  }

  return '--';
};

export const getSubmittedDate = (form) => {
  const d = form.createdAt || form.submittedAt || form.created_at || form.submitted_at || form.timestamp;
  if (!d) return '--';
  const parsed = new Date(d);
  return isNaN(parsed) ? String(d) : parsed.toLocaleDateString();
};

export default {
  getFormId,
  getStudentName,
  getStudentEmail,
  getDomain,
  getSubmittedDate,
};
