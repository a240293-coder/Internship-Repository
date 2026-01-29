import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/AppDevelopment.module.css'
import { useState } from 'react'

export default function AppDevelopment() {
  const modules = [
    { id: 'm1', title: 'App Development Basics', desc: 'Platform choices and core app concepts.', outcomes: ['Understand mobile architectures','Choose right tools'] },
    { id: 'm2', title: 'UI Design for Mobile', desc: 'Mobile UI patterns and design systems.', outcomes: ['Design mobile-friendly UIs'] },
    { id: 'm3', title: 'App Logic & APIs', desc: 'State, navigation, and backend integration.', outcomes: ['Integrate APIs','Handle app state'] },
    { id: 'm4', title: 'Testing & Deployment', desc: 'Testing workflows and app store basics.', outcomes: ['Write basic tests','Deploy to stores or distribution platforms'] },
    { id: 'm5', title: 'Final App Project', desc: 'Build and ship a small app.', outcomes: ['Deliver working app','Prepare portfolio-ready project'] },
  ]

  const tools = ['Android Studio / Flutter','Firebase','GitHub']
  const skills = ['Mobile UI','App Logic','APIs','Testing']
  const who = ['Beginners in mobile dev','Designers moving to apps','Entrepreneurs']
  const careers = ['Mobile App Intern','Junior App Developer','Product Engineer']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>App Development | LearnBetter</title>
        <meta name="description" content="App Development — build beginner-friendly mobile apps with practical tooling and deployment." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">App Development</h1>
            <p className={styles.lede}>Beginner-friendly app development focusing on UI, logic, and deployment.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Beginner Friendly</span>
              <span className={styles.badge}>Hands-on Project</span>
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
              'Android / cross-platform basics',
              'UI + logic understanding',
              'Testing & deployment'
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

        <section className={styles.mentor}>
          <h3>Domain mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Neha Kapoor</h4>
              <p className={styles.mentorExp}>Mobile Engineer — Industry Expert</p>
              <Link href="/mentors/neha-kapoor" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>LearnBetter App Development Internship Certificate — QR-based verification included.</p>
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
