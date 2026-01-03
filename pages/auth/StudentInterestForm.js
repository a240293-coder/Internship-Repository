import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../api';
import './Auth.css';

const StudentInterestForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    interests: '',
    desiredDomain: '',
    experience: '',
    goals: '',
    resume: null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

    try {
      // Send JSON payload (backend supports JSON); skip resume upload for now
      const payload = {
        interests: formData.interests.split(',').map(i => i.trim()),
        desiredDomain: formData.desiredDomain,
        experience: formData.experience,
        goals: formData.goals,
        // include student email if available in localStorage
        studentEmail: typeof window !== 'undefined' ? localStorage.getItem('userEmail') || null : null,
        studentName: typeof window !== 'undefined' ? localStorage.getItem('userName') || null : null,
        studentId: typeof window !== 'undefined' ? localStorage.getItem('userId') || null : null,
      };

      await api.post('/forms/submit', payload);

      setSuccess('Form submitted successfully! Admin will review and assign a mentor.');
      setTimeout(() => {
        router.push('/student/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Form submit error:', err);
      const message = err?.response?.data?.message || err?.message || 'Failed to submit form';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="interest-page">
      <div className="interest-grid">
        <section className="interest-visual" aria-hidden="false">
          <div className="interest-badge">Student-first · Internship-ready</div>
          <h1>Craft your internship-ready journey</h1>
          <p className="interest-description">
            Share what excites you, the domains you want to master, and we will pair you with mentors who can accelerate your next big leap.
          </p>
          <ul className="interest-highlights">
            <li>Personalized mentor matching</li>
            <li>Industry-backed projects</li>
            <li>Career-aligned learning paths</li>
          </ul>
          <div className="interest-metrics">
            <div>
              <p className="metric-value">1500+</p>
              <p className="metric-label">Students guided</p>
            </div>
            <div>
              <p className="metric-value">120+</p>
              <p className="metric-label">Mentor partners</p>
            </div>
          </div>
          <div className="interest-meta">
            <p>Need help? <span>admissions@learnbetter.com</span></p>
          </div>
          <div className="interest-orb" aria-hidden="true" />
        </section>

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

            <div className="form-group">
              <label>Previous Experience</label>
              <textarea
                name="experience"
                placeholder="Describe your previous experience in tech/projects"
                value={formData.experience}
                onChange={handleChange}
                required
              />
            </div>

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
  );
};

export default StudentInterestForm;
