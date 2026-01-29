import React from 'react';
import { useRouter } from 'next/router';
// import './Demo.css';

const OurMentors = () => {
  const router = useRouter();

  const mentors = [
    {
      id: 1,
      name: 'Dr. Rajesh Kumar',
      expertise: 'Cloud Architecture',
      company: 'AWS',
      bio: 'Senior architect with 15+ years of cloud infrastructure experience. Specializes in scalable solutions.',
      experience: '15+ years'
    },
    {
      id: 2,
      name: 'Sarah Anderson',
      expertise: 'Product Strategy',
      company: 'Google',
      bio: 'Strategic thinker focused on product-market fit. Guided 50+ startups to success.',
      experience: '12+ years'
    },
    {
      id: 3,
      name: 'Marcus Chen',
      expertise: 'Full Stack Development',
      company: 'Meta',
      bio: 'Expert in modern web technologies. Passionate about teaching best practices.',
      experience: '10+ years'
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      expertise: 'UX/UI Design',
      company: 'Apple',
      bio: 'Award-winning designer focused on user-centric design. Published author on design systems.',
      experience: '11+ years'
    },
    {
      id: 5,
      name: 'Prof. Anil Sharma',
      expertise: 'Data Science & AI',
      company: 'MIT',
      bio: 'Leading researcher in machine learning. Published 50+ research papers.',
      experience: '18+ years'
    },
    {
      id: 6,
      name: 'Lisa Thompson',
      expertise: 'Business Development',
      company: 'Microsoft',
      bio: 'Strategic partnerships expert. Built relationships with Fortune 500 companies.',
      experience: '14+ years'
    },
    {
      id: 7,
      name: 'Vikram Patel',
      expertise: 'DevOps & Infrastructure',
      company: 'Netflix',
      bio: 'Infrastructure specialist handling millions of requests. Expert in system optimization.',
      experience: '13+ years'
    },
    {
      id: 8,
      name: 'Jennifer Lee',
      expertise: 'Data Analytics',
      company: 'LinkedIn',
      bio: 'Analytics leader driving data-informed decisions. Expertise in big data solutions.',
      experience: '12+ years'
    }
  ];

  return (
    <div className="demo-container">
      {/* Hero Section */}
      <section className="demo-hero">
        <h1>Our Mentors</h1>
        <p>Learn from industry leaders and experienced professionals</p>
      </section>

      {/* Mentors Content */}
      <section className="demo-content">
        <div className="mentors-grid">
          {mentors.map((mentor) => (
            <div key={mentor.id} className="mentor-card">
              <div className="mentor-avatar-section">
                <div className="mentor-avatar">
                  <div className="avatar-initials">
                    {mentor.name.split(' ').map(n => n.charAt(0)).join('')}
                  </div>
                </div>
              </div>

              <div className="mentor-details">
                <h3 className="mentor-name">{mentor.name}</h3>
                <p className="mentor-expertise">{mentor.expertise}</p>
                <p className="mentor-company">{mentor.company}</p>
                <p className="mentor-bio">{mentor.bio}</p>
                
                <div className="mentor-footer">
                  <span className="mentor-experience">
                    {mentor.experience} experience
                  </span>
                  <button className="mentor-connect-btn">Connect</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mentor Stats */}
      <section className="demo-stats">
        <div className="stats-wrapper">
          <div className="stat-box">
            <h2>500+</h2>
            <p>Verified Mentors</p>
          </div>
          <div className="stat-box">
            <h2>50+</h2>
            <p>Industries</p>
          </div>
          <div className="stat-box">
            <h2>4.9/5</h2>
            <p>Average Rating</p>
          </div>
          <div className="stat-box">
            <h2>100%</h2>
            <p>Response Rate</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurMentors;
