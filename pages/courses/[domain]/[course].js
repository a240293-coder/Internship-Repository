import { useRouter } from 'next/router';
import Link from 'next/link';
import courses from '../../../data/courses';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

const courseDetails = courses;

export default function CoursePage() {
  const router = useRouter();
  const { domain, course } = router.query;

  if (!domain || !course) return null;
  const domainObj = courseDetails[domain] || {};
  const data = domainObj[course];

  if (!data) {
    return (
      <main style={{ padding: 24 }}>
          <h1>Course not found</h1>
          <p>We couldn&#39;t find the course you&#39;re looking for.</p>
          <p><Link href="/">Return home</Link></p>
        </main>
    );
  }
  const overview = data.overview || data.heroText || data.why || '';
  const skills = Array.isArray(data.skills) ? data.skills : (Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : []);
  const tools = Array.isArray(data.tools) ? data.tools : [];
  const prerequisites = data.prerequisites || data.prereqs || 'None specified';
  const outcomes = Array.isArray(data.outcomes) ? data.outcomes : [];
  const careers = Array.isArray(data.career) ? data.career : (Array.isArray(data.careers) ? data.careers : []);

  const handleHomeClick = (e) => {
    // If this tab was opened from another tab (window.opener), focus the opener and close this tab.
    try {
      if (typeof window !== 'undefined' && window.opener && !window.opener.closed) {
        e.preventDefault(); // prevent client navigation
        try {
          if (window.opener.focus) window.opener.focus();
        } catch (err) {
          // ignore
        }
        try {
          window.close();
        } catch (err) {
          // some browsers block close; ignore
        }
        return;
      }
    } catch (err) {
      // ignore
    }
    // No opener: allow normal navigation in the same tab (Next.js Link will handle it)
  };

  return (
    <>
      <Navbar />
      <main style={{ padding: 24, maxWidth: 980, margin: '0 auto' }}>
      <h1>{data.title}</h1>
      <p style={{ color: '#444' }}>{overview}</p>

      <section style={{ marginTop: 20 }}>
        <h3>What this course is</h3>
        <p>{overview}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Who should take it</h3>
        <p>Students, freshers and career-switchers with interest in this domain.</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Learning outcomes</h3>
        <ul>{outcomes.map(o => <li key={o}>{o}</li>)}</ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Skills gained</h3>
        <p>{skills.length ? skills.join(', ') : 'No skills listed'}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Tools & technologies</h3>
        <p>{tools.length ? tools.join(', ') : 'No tools listed'}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Prerequisites</h3>
        <p>{prerequisites}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Duration & commitment</h3>
        <p>{data.duration || 'Duration not specified'}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Career relevance</h3>
        <p>Relevant roles: {careers.length ? careers.join(', ') : 'Not specified'}</p>
      </section>

      <section style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }} aria-labelledby="cert-heading">
        <h2 id="cert-heading" style={{ margin: 0, fontSize: 22 }}>Certification & Recognition</h2>
        <p style={{ marginTop: 10, color: '#333' }}><strong>Get Industry-Recognized Certification</strong></p>

        <p style={{ color: '#444' }}>
          Upon successful completion of this course, learners will receive a <strong>LearnBetter Professional Certificate</strong> that validates practical skills, project work, and mentor evaluation. This certification helps students stand out in internships, entry-level roles, and academic evaluations.
        </p>

        <h4 style={{ marginTop: 12 }}>What the Certification Includes</h4>
        <ul>
          <li>Course completion certificate</li>
          <li>Verified project assessment</li>
          <li>Mentor-reviewed performance</li>
          <li>Skill-level validation</li>
        </ul>

        <h4 style={{ marginTop: 12 }}>How the Certification Helps You</h4>
        <ul>
          <li>Strengthens your resume and LinkedIn profile</li>
          <li>Demonstrates hands-on experience to recruiters</li>
          <li>Useful for internship and placement applications</li>
          <li>Shows commitment to structured learning</li>
        </ul>

        <h4 style={{ marginTop: 12 }}>Certification Eligibility</h4>
        <p style={{ marginTop: 6 }}>To earn the certificate, learners must:</p>
        <ul>
          <li>Complete all assigned projects</li>
          <li>Participate in mentor reviews</li>
          <li>Meet minimum performance benchmarks</li>
        </ul>

        <h4 style={{ marginTop: 12 }}>Certificate Format</h4>
        <p>Digital certificate (shareable link), Downloadable PDF, Verifiable credential ID.</p>

        <h4 style={{ marginTop: 12 }}>Who Recognizes This Certification?</h4>
        <p>Internship recruiters, hiring managers for entry-level roles, academic mentors, and industry partners.</p>

        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a href="/certificate/sample" target="_blank" rel="noopener noreferrer" style={{ background: '#fff', border: '1px solid #e10600', color: '#e10600', padding: '10px 14px', borderRadius: 8, textDecoration: 'none' }}>View Sample Certificate</a>
          <a href="#" onClick={(ev) => { ev.preventDefault(); const el = document.getElementById('career-heading'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }} style={{ background: '#f3f3f3', color: '#111', padding: '10px 14px', borderRadius: 8, textDecoration: 'none' }}>How Certification Helps My Career</a>
          <Link href="/apply" style={{ background: '#e10600', color: '#fff', padding: '10px 14px', borderRadius: 8, textDecoration: 'none' }}>Apply for This Course</Link>
        </div>

        <p style={{ marginTop: 12, fontSize: 13, color: '#666' }}><strong>Quality & Trust Note:</strong> LearnBetter certifications are skill-based, project-driven, and mentor-verified to ensure real-world relevance.</p>
      </section>

      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <Link href="/apply" style={{ background: '#e10600', color: '#fff', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>Apply</Link>
        <a href="#" style={{ background: '#fff', color: '#e10600', padding: '10px 16px', borderRadius: 8, textDecoration: 'none', border: '1px solid #e10600' }}>Talk to Mentor</a>
      </div>
      </main>
      {/* Floating home icon — appears on the right side, vertically centered */}
      <Link
        href="/"
        aria-label="Go to homepage"
        onClick={handleHomeClick}
        style={{
          position: 'fixed',
          right: 24,
          top: 88,
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
          border: '1px solid rgba(0,0,0,0.06)',
          zIndex: 9999,
          textDecoration: 'none',
          color: '#111'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M3 11.5L12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5 12v7a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>

      <Footer />
    </>
  );
}
