import api from './api';
import { getFormId } from './formHelpers';

/**
 * Assign a mentor to a form/student. Adapter that supports multiple backend endpoints.
 * - Prefer: PUT /api/admin/forms/:formId/assign-mentor with { mentorId, mentorName }
 * - Fallback: POST /api/admin/assign with { studentId, mentorId }
 * Returns the api response data on success, throws on failure.
 */
export async function assignMentor(form, mentor, options = {}) {
  const mentorObj = typeof mentor === 'object' && mentor ? mentor : { id: mentor };
  const mentorId = mentorObj.id || mentorObj._id || mentorObj.mentorId || String(mentorObj);

  const formId = getFormId(form);

  // Try the formId route first
  if (formId) {
    try {
      const body = { mentorId };
      if (mentorObj.name) body.mentorName = mentorObj.name;
      const res = await api.put(`/api/admin/forms/${formId}/assign-mentor`, body);
      try { window.dispatchEvent(new CustomEvent('assignmentUpdated', { detail: { formId, mentorId } })); } catch (e) {}
      return res.data;
    } catch (err) {
      // If 404/405 or specific error, fall through to other strategy
      if (err?.response?.status && ![404, 405].includes(err.response.status)) throw err;
    }
  }

  // If we have a studentId, use the older assign endpoint
  const studentId = form.studentId || form.student_id || form.student?.id || form.student?.studentId;
  if (studentId) {
    const res = await api.post('/api/admin/assign', { studentId, mentorId });
    try { window.dispatchEvent(new CustomEvent('assignmentUpdated', { detail: { studentId, mentorId } })); } catch (e) {}
    return res.data;
  }

  // As a last resort, try to use form.id as identifier on the same form route
  if (form && (form.id || form._id)) {
    const id = form.id || form._id;
    const body = { mentorId };
    if (mentorObj.name) body.mentorName = mentorObj.name;
    const res = await api.put(`/api/admin/forms/${id}/assign-mentor`, body);
    return res.data;
  }

  throw new Error('Unable to determine form or student identifier to assign mentor');
}

export default { assignMentor };
