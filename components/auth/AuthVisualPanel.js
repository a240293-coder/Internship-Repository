import React from 'react';

const defaultStats = [
  { value: '96%', label: 'Interview-ready grads' },
  { value: '250+', label: 'Industry mentors' }
];

const defaultLogos = ['Paytm', 'Myntra', 'Unacademy', 'Swiggy'];

const getInitials = (name = '') => {
  const letters = name
    .split(' ')
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return letters || 'LB';
};

const AuthVisualPanel = ({
  eyebrow = 'Mentor-led sprints',
  title = 'Launch your next role',
  description = 'Ship portfolio-ready work with weekly mentor critiques, async support, and hiring pods built for ambitious switchers.',
  quote = '“The sprint retros kept me accountable and confident for every interview.”',
  author = 'Kamya Malhotra',
  authorRole = 'Non-tech → Data Analyst, PaisaBazaar',
  stats = defaultStats,
  logos = defaultLogos
}) => (
  <aside className="auth-visual" aria-label="LearnBetter success highlights">
    <div className="visual-header">
      <p className="visual-badge">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="visual-copy">{description}</p>
    </div>

    <div className="visual-stats" aria-label="Program metrics">
      {stats.map(({ value, label }) => (
        <div key={`${value}-${label}`}>
          <p className="visual-stat-value">{value}</p>
          <p className="visual-stat-label">{label}</p>
        </div>
      ))}
    </div>

    <figure className="visual-testimonial">
      <div className="visual-avatar" aria-hidden="true">
        <span>{getInitials(author)}</span>
      </div>
      <div>
        <blockquote>{quote}</blockquote>
        <figcaption>
          <p className="visual-author">{author}</p>
          <p className="visual-author-role">{authorRole}</p>
        </figcaption>
      </div>
    </figure>

    <div className="visual-logos" aria-label="Where our alumni work">
      {logos.map((logo) => (
        <span key={logo}>{logo}</span>
      ))}
    </div>
  </aside>
);

export default AuthVisualPanel;
