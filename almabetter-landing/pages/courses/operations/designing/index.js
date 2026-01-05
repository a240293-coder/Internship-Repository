import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/Designing.module.css'
import { useState } from 'react'

export default function Designing() {
  const modules = [
    { id: 'm1', title: 'Design Fundamentals', desc: 'Principles of visual design and composition.', outcomes: ['Understand design principles'] },
    { id: 'm2', title: 'UI Principles', desc: 'Interface patterns and visual systems.', outcomes: ['Design UI components'] },
    { id: 'm3', title: 'UX Research', desc: 'User research and testing methods.', outcomes: ['Conduct basic user research'] },
    { id: 'm4', title: 'Wireframing', desc: 'Low-fidelity to high-fidelity workflows.', outcomes: ['Build wireframes and prototypes'] },
    { id: 'm5', title: 'Portfolio Project', desc: 'Prepare a portfolio-ready design project.', outcomes: ['Deliver portfolio piece'] },
  ]

  const tools = ['Figma','Adobe XD','Canva']
  const skills = ['UI/UX','Design Thinking','Prototyping','Portfolio']
  const who = ['Design students','Creative professionals','Product builders']
  const careers = ['UI/UX Intern','Product Designer','Design Associate']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Designing | LearnBetter</title>
        <meta name="description" content="Designing — UI/UX fundamentals, prototyping, and portfolio-building." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Designing</h1>
            <p className={styles.lede}>Visual-first, structured design training to build UI/UX skills and portfolio-ready work.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Portfolio Focused</span>
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
              'UI/UX basics',
              'Design thinking',
              'Portfolio building'
            ].map((t) => (
              <div key={t} className={styles.learnItem}>
                <span className={styles.check}>✓</span>
                <span>{t}</span>
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
          <h3>Design Mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Meera Iyer</h4>
              <p className={styles.mentorExp}>Senior Designer — Industry Expert</p>
              <Link href="/mentors/meera-iyer" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Portfolio-ready Certificate</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>Portfolio-ready certificate to showcase your design work.</p>
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
