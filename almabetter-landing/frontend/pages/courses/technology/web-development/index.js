import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/WebDevelopment.module.css'
import { useState } from 'react'

export default function WebDevelopment() {
  const modules = [
    { id: 'm1', title: 'Web Fundamentals', desc: 'HTML, CSS, and core web principles.', outcomes: ['Build semantic pages','Responsive layouts'] },
    { id: 'm2', title: 'Frontend Development', desc: 'JavaScript, React and component architecture.', outcomes: ['Create SPA using React','State management basics'] },
    { id: 'm3', title: 'Backend Basics', desc: 'APIs, server-side concepts and simple persistence.', outcomes: ['Build a REST API','Connect to a database'] },
    { id: 'm4', title: 'Version Control', desc: 'Git workflows and collaboration on GitHub.', outcomes: ['Use Git effectively','Work with branches and PRs'] },
    { id: 'm5', title: 'Deployment', desc: 'CI/CD, hosting and deploying to Vercel.', outcomes: ['Deploy apps','Set up basic CI'] },
    { id: 'm6', title: 'Capstone Project', desc: 'End-to-end web application with deployment.', outcomes: ['Deliver a production-ready app'] },
  ]

  const tools = ['VS Code','Git & GitHub','React','Vercel']
  const skills = ['HTML','CSS','JavaScript','React','Deployment']
  const who = ['Aspiring developers','CS students','Career switchers']
  const careers = ['Frontend Developer','Fullstack Intern','Web Engineer']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Web Development | LearnBetter</title>
        <meta name="description" content="Web Development — build production-ready web apps using modern tools and deployment workflows." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Web Development (Strategic Partner)</h1>
            <p className={styles.lede}>Career-focused training: HTML, CSS, JavaScript, React, APIs, and deployment.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Career Serious</span>
              <span className={styles.badge}>Project-Based</span>
              <span className={styles.badge}>Mentor-Led</span>
            </div>

            <div className={styles.heroCtas}>
              <Link href="/apply" className={styles.ctaPrimary}>Apply Now</Link>
            </div>
          </div>
        </section>

        <section className={styles.learn}>
          <h2>What you’ll learn</h2>
          <div className={styles.learnGrid}>
            {[
              'HTML, CSS, JavaScript',
              'React / Next.js',
              'APIs & backend basics',
              'Deployment & CI/CD'
            ].map((t) => (
              <div key={t} className={styles.learnItem}>
                <span className={styles.check}>✓</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.skills}>
          <h3>Skills you will gain</h3>
          <div className={styles.chips}>
            {skills.map(s => <span key={s} className={styles.chip}>{s}</span>)}
          </div>
        </section>

        <section className={styles.modules} id="syllabus">
          <h3>Course modules</h3>
          <div className={styles.accordion}>
            {modules.map((m) => (
              <div key={m.id} className={styles.accordionItem}>
                <button
                  aria-expanded={open === m.id}
                  aria-controls={`${m.id}-panel`}
                  id={`${m.id}-button`}
                  className={styles.accordionButton}
                  onClick={() => setOpen(open === m.id ? '' : m.id)}
                >
                  <span>{m.title}</span>
                  <span className={styles.chev}>{open === m.id ? '−' : '+'}</span>
                </button>
                <div id={`${m.id}-panel`} role="region" aria-labelledby={`${m.id}-button`} className={`${styles.panel} ${open === m.id ? styles.open : ''}`}>
                  <p className={styles.moduleDesc}>{m.desc}</p>
                  <ul className={styles.moduleOutcomes}>
                    {m.outcomes.map(o => <li key={o}>{o}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.tools}>
          <h3>Tools covered</h3>
          <div className={styles.toolsGrid}>
            {tools.map(t => <div key={t} className={styles.tool}>{t}</div>)}
          </div>
        </section>

        <section className={styles.who}>
          <h3>Who should take this course</h3>
          <div className={styles.cards}>
            {who.map(w => (
              <div key={w} className={styles.cardItem}><h4>{w}</h4></div>
            ))}
          </div>
        </section>

        <section className={styles.careers}>
          <h3>Career outcomes</h3>
          <ul>
            {careers.map(c => <li key={c}>{c}</li>)}
          </ul>
        </section>

        <section className={styles.mentor}>
          <h3>Domain mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Amit Desai</h4>
              <p className={styles.mentorExp}>Senior Developer — Industry Expert</p>
              <Link href="/mentors/amit-desai" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>LearnBetter Web Development Certificate — QR-based verification included.</p>
            </div>
          </div>
        </section>

        <div className={styles.finalCta}>
          <Link href="/apply" className={styles.ctaPrimary}>Apply Now</Link>
          <Link href="/contact" className={styles.ctaSecondary}>Talk to Career Expert</Link>
        </div>
      </main>
    </>
  )
}
