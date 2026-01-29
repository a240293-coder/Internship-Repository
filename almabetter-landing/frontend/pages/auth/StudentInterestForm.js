import React, { useState } from 'react';
import PopupMessage from '../../components/shared/PopupMessage';
import usePopupMessage from '../../components/shared/usePopupMessage';
import DashboardLayout from '../../components/DashboardLayout';
import { useRouter } from 'next/router';
import api from '../../lib/api';
// Auth.css is imported globally from pages/_app.js

const StudentInterestForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    interests: '',
    desiredDomain: '',
    goals: '',
    resume: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [currentFormId, setCurrentFormId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, showPopup] = usePopupMessage();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'resume') {
      setFormData({
        ...formData,
        resume: files ? files[0] : null
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    // Client-side duplicate-domain check (prevents trying to submit same domain twice)
    const fetchMyForms = async () => {
      try {
        const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
        const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
        const params = id ? `?userId=${encodeURIComponent(id)}` : email ? `?email=${encodeURIComponent(email)}` : '';
        // try preferred endpoint
        try {
          const res = await api.get(`/forms/my-forms${params}`);
          const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
          return data;
        } catch (e) {}
        // try single form endpoint
        try {
          const res = await api.get(`/forms/my-form${params}`);
          const d = res?.data;
          return d ? (Array.isArray(d) ? d : [d]) : [];
        } catch (e) {}
        // fallback to mentor/students and filter
        try {
          const res = await api.get('/mentor/students');
          const all = Array.isArray(res?.data) ? res.data : [];
          const filtered = all.filter((f) => {
            if (id && f.studentId) return String(f.studentId) === String(id);
            if (email && f.studentEmail) return String(f.studentEmail) === String(email);
            return false;
          }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
          return filtered;
        } catch (e) {
          return [];
        }
      } catch (e) {
        return [];
      }
    };

    try {
      const existing = await fetchMyForms();
      const domain = (formData.desiredDomain || '').trim().toLowerCase();
      if (domain) {
        const duplicateForm = existing.find(f => (((f.desiredDomain || f.desired_domain || '') + '').trim().toLowerCase() === domain));
        // If duplicate exists and it's not the same form being edited, block and show popup
        if (duplicateForm && (!isEditing || String(duplicateForm.id) !== String(currentFormId))) {
          const msg = 'You have already selected this domain in a previous submission. Please choose a different domain or update your existing form.';
          setError(msg);
          showPopup(msg);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      // ignore and proceed (server will enforce)
      console.warn('Duplicate check failed, proceeding to submit', e);
    }

    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      formDataToSend.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim())));
      formDataToSend.append('desiredDomain', formData.desiredDomain);
      formDataToSend.append('goals', formData.goals);
      
      // Append user info
      // If user explicitly opened the form as `?mode=new`, skip attaching student identifiers
      // so the backend can treat it as a fresh submission.
      const modeForSubmit = router?.query?.mode;
      if (typeof window !== 'undefined' && modeForSubmit !== 'new') {
        const email = localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail');
        const name = localStorage.getItem('userName_student') || localStorage.getItem('userName');
        const id = localStorage.getItem('userId_student') || localStorage.getItem('userId');
        if (email) formDataToSend.append('studentEmail', email);
        if (name) formDataToSend.append('studentName', name);
        if (id) formDataToSend.append('studentId', id);
      }

      // Append file
      if (formData.resume) {
        formDataToSend.append('resume', formData.resume);
      }

      // Send FormData (browser sets Content-Type to multipart/form-data automatically)
      // Perform the API call and handle 409 responses explicitly here to avoid uncaught rejections
      try {
        if (isEditing) {
          if (currentFormId) {
            formDataToSend.append('formId', currentFormId);
          }
          await api.put('/forms/update', formDataToSend);
          setSuccess('Form updated successfully!');
          showPopup('Form updated successfully!');
        } else {
          await api.post('/forms/submit', formDataToSend);
          setSuccess('Form submitted successfully! Admin will review and assign a mentor.');
          showPopup('Form submitted successfully!');
        }

        setTimeout(() => {
          // after submit/update, refresh submissions and redirect to dashboard
          reloadSubmissions();
          router.push('/student/dashboard');
        }, 1500);
      } catch (apiErr) {
        const status = apiErr?.response?.status || apiErr?.status;
        const message = apiErr?.response?.data?.message || apiErr?.message || 'Failed to submit form';
        if (status === 409 && !isEditing) {
          const mode = router?.query?.mode;
          if (mode === 'new') {
            try {
              // Rebuild FormData without student identifiers
              const formDataRetry = new FormData();
              formDataRetry.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim())));
              formDataRetry.append('desiredDomain', formData.desiredDomain);
              formDataRetry.append('goals', formData.goals);
              if (formData.resume) formDataRetry.append('resume', formData.resume);
              // Do not append studentEmail/studentId when forcing a new anonymous submission
              await api.post('/forms/submit', formDataRetry);
              setSuccess('Form submitted successfully (created as a new submission).');
              showPopup('Form submitted successfully (created as a new submission).');
              setTimeout(() => router.push('/student/dashboard'), 1500);
              return;
            } catch (e2) {
              console.error('Retry as anonymous submit failed:', e2);
              // Fallback: load existing form into edit flow
              setError(message + ' Switching to edit mode so you can update your existing form.');
              try {
                const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
                const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
                const params = {};
                if (id) params.userId = id;
                else if (email) params.email = email;
                const q = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
                const res = await api.get(`/forms/my-form${q}`);
                if (res && res.data) {
                  const f = res.data;
                  setFormData({
                    interests: f.interests ? (typeof f.interests === 'string' ? JSON.parse(f.interests || '[]') : f.interests).join(', ') : '',
                    desiredDomain: f.desiredDomain || f.desired_domain || '',
                    goals: f.goals || '',
                    resume: null
                  });
                  setIsEditing(true);
                  showPopup('Existing form loaded. Edit and submit to update.');
                }
              } catch (e3) {
                console.error('Error fetching existing form for edit:', e3);
              }
              return;
            }
          } else {
            // Default behavior: switch to edit flow and pre-fill using API proxy
            setError(message + ' Switching to edit mode so you can update your existing form.');
            try {
              const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
              const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
              const params = {};
              if (id) params.userId = id;
              else if (email) params.email = email;
              const q = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
              const res = await api.get(`/forms/my-form${q}`);
              if (res && res.data) {
                const f = res.data;
                setFormData({
                  interests: f.interests ? (typeof f.interests === 'string' ? JSON.parse(f.interests || '[]') : f.interests).join(', ') : '',
                  desiredDomain: f.desiredDomain || f.desired_domain || '',
                  goals: f.goals || '',
                  resume: null
                });
                setIsEditing(true);
                showPopup('Existing form loaded. Edit and submit to update.');
              }
            } catch (e) {
              console.error('Error fetching existing form for edit:', e);
            }
            return;
          }
        } else {
          // Non-409 API error, rethrow to be handled by outer catch
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Form submit error:', err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Failed to submit form';
      // If backend rejected as duplicate but user explicitly asked for a NEW form,
      // retry the submission without student identifiers so a separate anonymous entry is created.
      if (status === 409 && !isEditing) {
        const mode = router?.query?.mode;
        if (mode === 'new') {
          try {
            // Rebuild FormData without student identifiers
            const formDataRetry = new FormData();
            formDataRetry.append('interests', JSON.stringify(formData.interests.split(',').map(i => i.trim())));
            formDataRetry.append('desiredDomain', formData.desiredDomain);
            formDataRetry.append('goals', formData.goals);
            if (formData.resume) formDataRetry.append('resume', formData.resume);
            // Do not append studentEmail/studentId when forcing a new anonymous submission
            await api.post('/forms/submit', formDataRetry);
            setSuccess('Form submitted successfully (created as a new submission).');
            showPopup('Form submitted successfully (created as a new submission).');
            setTimeout(() => router.push('/student/dashboard'), 1500);
          } catch (e2) {
            console.error('Retry as anonymous submit failed:', e2);
            // Fallback: load existing form into edit flow
            setError(message + ' Switching to edit mode so you can update your existing form.');
            try {
              const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
              const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
              const params = {};
              if (id) params.userId = id;
              else if (email) params.email = email;
              const q = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
              const res = await api.get(`/forms/my-form${q}`);
              if (res && res.data) {
                const f = res.data;
                setFormData({
                  interests: f.interests ? (typeof f.interests === 'string' ? JSON.parse(f.interests || '[]') : f.interests).join(', ') : '',
                  desiredDomain: f.desiredDomain || f.desired_domain || '',
                  goals: f.goals || '',
                  resume: null
                });
                setIsEditing(true);
                showPopup('Existing form loaded. Edit and submit to update.');
              }
            } catch (e3) {
              console.error('Error fetching existing form for edit:', e3);
            }
          }
        } else {
          // Default behavior: switch to edit flow and pre-fill using API proxy
          setError(message + ' Switching to edit mode so you can update your existing form.');
          try {
            const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
            const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
            const params = {};
            if (id) params.userId = id;
            else if (email) params.email = email;
            const q = params && Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
            const res = await api.get(`/forms/my-form${q}`);
            if (res && res.data) {
              const f = res.data;
              setFormData({
                interests: f.interests ? (typeof f.interests === 'string' ? JSON.parse(f.interests || '[]') : f.interests).join(', ') : '',
                desiredDomain: f.desiredDomain || f.desired_domain || '',
                goals: f.goals || '',
                resume: null
              });
              setIsEditing(true);
              showPopup('Existing form loaded. Edit and submit to update.');
            }
          } catch (e) {
            console.error('Error fetching existing form for edit:', e);
          }
        }
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  // On mount, try to fetch existing form and switch to edit mode if present
  React.useEffect(() => {
    const fetchExisting = async () => {
      try {
        if (typeof window === 'undefined') return;
        // Wait until Next router has parsed the query
        if (!router.isReady) return;
        // If a specific formId is provided, load that submission for editing
        const formId = router?.query?.formId;
        if (formId) {
          try {
            const id = localStorage.getItem('userId_student') || localStorage.getItem('userId');
            const email = localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail');
            const params = id ? `?userId=${encodeURIComponent(id)}` : email ? `?email=${encodeURIComponent(email)}` : '';
            const res = await api.get(`/forms/my-forms${params}`);
            const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
            const found = data.find(f => String(f.id) === String(formId));
            if (found) {
              setFormData({
                interests: found.interests ? (typeof found.interests === 'string' ? JSON.parse(found.interests || '[]') : found.interests).join(', ') : '',
                desiredDomain: found.desiredDomain || found.desired_domain || '',
                goals: found.goals || '',
                resume: null
              });
              setIsEditing(true);
              setCurrentFormId(found.id);
              return;
            }
          } catch (e) {
            console.warn('Could not load specified formId for edit', e);
          }
        }
        // Respect mode query param
        const mode = router?.query?.mode;
        if (mode === 'new') {
          setIsEditing(false);
          setFormData({ interests: '', desiredDomain: '', goals: '', resume: null });
          setSubmissions([]);
          setCurrentFormId(null);
          return; // user explicitly requested a new form
        }

        // If mode=update, fetch all submissions for student and show them (do not auto-edit)
        if (mode === 'update') {
          try {
            const id = localStorage.getItem('userId_student') || localStorage.getItem('userId');
            const email = localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail');
            const params = id ? `?userId=${encodeURIComponent(id)}` : email ? `?email=${encodeURIComponent(email)}` : '';
            const res = await api.get(`/forms/my-forms${params}`);
            const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
            setSubmissions(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
          } catch (e) {
            console.warn('Could not fetch submissions for update mode', e);
          }
          return;
        }

        const id = localStorage.getItem('userId_student') || localStorage.getItem('userId');
        const email = localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail');
        const params = {};
        if (id) params.userId = id;
        else if (email) params.email = email;
        if (!params.userId && !params.email) return;
        const query = new URLSearchParams(params).toString();
        const res = await api.get(`/forms/my-form?${query}`);
        if (res && res.data) {
          const f = res.data;
          setFormData({
            interests: f.interests ? (typeof f.interests === 'string' ? JSON.parse(f.interests || '[]') : f.interests).join(', ') : '',
            desiredDomain: f.desiredDomain || f.desired_domain || '',
            goals: f.goals || '',
            resume: null
          });
          setIsEditing(true);
        }
      } catch (err) {
        // ignore 404
      }
    };
    fetchExisting();
  }, [router?.isReady, router?.query?.mode]);

  const reloadSubmissions = async () => {
    try {
      const id = typeof window !== 'undefined' ? (localStorage.getItem('userId_student') || localStorage.getItem('userId')) : null;
      const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail_student') || localStorage.getItem('userEmail')) : null;
      const params = id ? `?userId=${encodeURIComponent(id)}` : email ? `?email=${encodeURIComponent(email)}` : '';
      const res = await api.get(`/forms/my-forms${params}`);
      const data = Array.isArray(res?.data) ? res.data : (res?.data ? [res.data] : []);
      setSubmissions(data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (e) {
      console.warn('Failed to reload submissions', e);
    }
  };

  const handleEditClick = (id) => {
    const f = submissions.find(s => String(s.id) === String(id));
    if (!f) return;
    setFormData({
      interests: Array.isArray(f.interests) ? f.interests.join(', ') : (typeof f.interests === 'string' ? (JSON.parse(f.interests||'[]')||[]).join(', ') : ''),
      desiredDomain: f.desiredDomain || f.desired_domain || '',
      goals: f.goals || '',
      resume: null
    });
    setIsEditing(true);
    setCurrentFormId(f.id);
    showPopup('Loaded form for editing. Make changes and submit to update.');
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Delete this submission? This cannot be undone.')) return;
    try {
      await api.delete(`/forms/${id}`);
      showPopup('Submission deleted');
      // remove locally
      setSubmissions(prev => prev.filter(s => String(s.id) !== String(id)));
      // if currently editing this form, reset form
      if (String(currentFormId) === String(id)) {
        setCurrentFormId(null);
        setIsEditing(false);
        setFormData({ interests: '', desiredDomain: '', goals: '', resume: null });
      }
      // Notify admin UI to refresh
      try { window.dispatchEvent(new Event('statusUpdated')); } catch (e) { }
    } catch (e) {
      console.error('Delete failed', e);
      setError(e?.response?.data?.message || 'Failed to delete submission');
    }
  };

  return (
    <DashboardLayout title="Student Interest Form" role="student">
      <div className="interest-page">
      <PopupMessage message={popup} />
      <div className="interest-grid">
        {/* Visual section removed per request; show only the form centered */}
        <section className="interest-form-card" aria-labelledby="interest-form-heading">
          <header className="interest-header">
            <p className="interest-eyebrow">Interest form</p>
            <h2 id="interest-form-heading">Student Interest Form</h2>
            <p className="interest-subtext">Tell us about your interests and career goals</p>
          </header>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="interest-form">
            <div className="form-group">
              <label>Interests (comma-separated)</label>
              <textarea
                name="interests"
                placeholder="e.g., Web Development, AI, Data Science"
                value={formData.interests}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Domain You Want to Grow In</label>
              <select
                name="desiredDomain"
                value={formData.desiredDomain}
                onChange={handleChange}
                required
              >
                <option value="">Select a domain</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="DevOps">DevOps</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Previous Experience field removed */}

            <div className="form-group">
              <label>Career Goals</label>
              <textarea
                name="goals"
                placeholder="What are your career goals and expectations?"
                value={formData.goals}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Upload Resume (PDF)</label>
              <input
                type="file"
                name="resume"
                accept=".pdf"
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Submitting...' : 'Submit Form'}
            </button>
          </form>
        </section>
      </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentInterestForm;
