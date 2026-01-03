import { useRouter } from 'next/router';
import Link from 'next/link';

const domainContent = {
  marketing: {
    title: 'Marketing & Growth',
    about:
      'Marketing & Growth focuses on promoting products or services, building customer relationships, and growing business impact through digital and traditional channels.',
    who: ['Students', 'Freshers', 'Career switchers interested in marketing or growth roles'],
    duration: '8–20 weeks (typical courses vary from short modules to multi-month programs)',
    level: 'Beginner → Intermediate',
    prerequisites: 'No strict prerequisites; basic web familiarity and curiosity about marketing is helpful.',
    interest: 'Good for analytical and creative people who enjoy messaging, metrics, and user behaviour.',
    courses: [
      'Digital Marketing Foundations',
      'Social Media Strategy',
      'Performance Marketing',
      'Growth Analytics'
    ]
  },
  technology: {
    title: 'Technology & Development',
    about:
      'Technology & Development covers software engineering, web and mobile development, and practical engineering skills for building products.',
    who: ['Students', 'Freshers', 'Career switchers aiming for developer roles'],
    duration: '12–28 weeks depending on depth and specialization',
    level: 'Beginner → Intermediate',
    prerequisites: 'Comfort with basic computer usage; willingness to learn programming fundamentals.',
    interest: 'Suited to problem-solvers who enjoy building, debugging and system design.',
    courses: [
      'Front-end Web Development',
      'Fullstack JavaScript',
      'React & Next.js Essentials',
      'Backend Fundamentals'
    ]
  },
  data: {
    title: 'Data & Intelligence',
    about:
      'Data & Intelligence teaches how to gather, analyse, and interpret data to make informed decisions and build data-driven products.',
    who: ['Students', 'Freshers', 'Career switchers with analytical interest'],
    duration: '10–24 weeks depending on specialization',
    level: 'Beginner → Intermediate',
    prerequisites: 'Comfort with basic maths; curiosity for analytics and data storytelling.',
    interest: 'Great for analytical thinkers interested in statistics, modelling and insights.',
    courses: [
      'Data Analytics Foundations',
      'SQL & Data Wrangling',
      'Intro to Machine Learning',
      'Data Visualization'
    ]
  },
  operations: {
    title: 'Operations & Design',
    about:
      'Operations & Design blends product operations, process optimisation and user-centred design to deliver impact across teams.',
    who: ['Students', 'Freshers', 'Career switchers interested in ops or design roles'],
    duration: '8–20 weeks depending on track',
    level: 'Beginner',
    prerequisites: 'No strict prerequisites; interest in systems, processes or design helps.',
    interest: 'Good for organised thinkers and creative problem-solvers.',
    courses: [
      'Product Operations Basics',
      'UX & Interaction Design',
      'Service Design Fundamentals',
      'Project Management Essentials'
    ]
  }
};

export default function DomainPage() {
  const router = useRouter();
  const { domain } = router.query;

  if (!domain) return null;
  const content = domainContent[domain];
  if (!content) {
    return (
      <main style={{ padding: 24, paddingTop: 96 }}>
        <h1>Domain not found</h1>
        <p>We could not find the domain you requested.</p>
        <p>
          <Link href="/">Return home</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, paddingTop: 96, maxWidth: 980, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8, fontWeight: 400 }}>{content.title}</h1>
      <p style={{ color: '#444', marginTop: 0 }}>{content.about}</p>

      <section style={{ marginTop: 24 }}>
        <h3>Who is this for</h3>
        <ul>
          {content.who.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Duration</h3>
        <p>{content.duration}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Required knowledge</h3>
        <p>
          <strong>Level:</strong> {content.level}
        </p>
        <p>
          <strong>Prerequisites:</strong> {content.prerequisites}
        </p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Interest fit</h3>
        <p>{content.interest}</p>
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Courses included</h3>
        <ul>
          {content.courses.map((c) => (
            <li key={c} style={{ marginBottom: 6 }}>
              <Link href="#">{c}</Link>
            </li>
          ))}
        </ul>
      </section>

      <p style={{ marginTop: 28 }}>
        <Link href="/">Back to home</Link>
      </p>
    </main>
  );
}
