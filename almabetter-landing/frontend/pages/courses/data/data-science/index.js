import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/DataScience.module.css'
import { useState } from 'react'

export default function DataScience() {
  const modules = [
    { id: 'm1', title: 'Python Fundamentals', desc: 'Python basics for data.', outcomes: ['Write Python scripts','Use libraries like pandas'] },
    { id: 'm2', title: 'Data Analysis', desc: 'Cleaning, aggregation and exploration.', outcomes: ['Perform data cleaning','Analyze datasets'] },
    { id: 'm3', title: 'Visualization', desc: 'Charts, dashboards and storytelling.', outcomes: ['Create visualizations','Build dashboards'] },
    { id: 'm4', title: 'Statistics Basics', desc: 'Probability and inference fundamentals.', outcomes: ['Understand mean/variance','Perform basic tests'] },
    { id: 'm5', title: 'Intro to ML', desc: 'Basic models and evaluation.', outcomes: ['Build simple models','Evaluate performance'] },
    { id: 'm6', title: 'Capstone Project', desc: 'End-to-end data project with insights.', outcomes: ['Deliver data insights report'] },
  ]

  const tools = ['Python','Pandas','Power BI','Jupyter']
  const skills = ['Python','Data Analysis','Visualization','Intro ML']
  const who = ['Aspiring data analysts','CS students','Career switchers']
  const careers = ['Data Analyst','Junior Data Scientist','Business Analyst']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Data Science | LearnBetter</title>
        <meta name="description" content="Data Science — Python, analysis, visualization, and introductory ML for career readiness." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Data Science</h1>
            <p className={styles.lede}>Career-oriented data science: Python, analysis, visualization and introductory ML.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Career-Focused</span>
              <span className={styles.badge}>Project-Based</span>
              <span className={styles.badge}>Senior Mentor</span>
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
              'Python for data',
              'Data analysis',
              'Visualization',
              'Intro to ML'
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
          <h3>Senior Data Mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Dr. Suman Rao</h4>
              <p className={styles.mentorExp}>Senior Data Scientist — Industry Expert</p>
              <Link href="/mentors/suman-rao" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>LearnBetter Data Science Certificate — Includes credential ID and QR verification.</p>
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
