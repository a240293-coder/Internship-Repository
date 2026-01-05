import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/Logistics.module.css'
import { useState } from 'react'

export default function Logistics() {
  const modules = [
    { id: 'm1', title: 'Supply Chain Basics', desc: 'End-to-end supply chain overview.', outcomes: ['Map supply chains','Identify stakeholders'] },
    { id: 'm2', title: 'Inventory Management', desc: 'Stock planning and SKU management.', outcomes: ['Plan inventory','Manage stock levels'] },
    { id: 'm3', title: 'Operations Planning', desc: 'Process design and SOPs.', outcomes: ['Design workflows','Create SOPs'] },
    { id: 'm4', title: 'Logistics Analytics', desc: 'Measure lead times, costs, and efficiency.', outcomes: ['Analyze logistics KPIs'] },
    { id: 'm5', title: 'Industry Case Studies', desc: 'Real business scenarios and solutions.', outcomes: ['Apply concepts to cases'] },
  ]

  const tools = ['Excel','ERP Basics','Operations Dashboards']
  const skills = ['Supply chain','Inventory planning','Operations analytics']
  const who = ['Business students','Operations aspirants','Managers']
  const careers = ['Operations Intern','Logistics Coordinator','Supply Chain Analyst']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Logistics & Operations | LearnBetter</title>
        <meta name="description" content="Practical operations training for non-technical learners: inventory, planning, and logistics analytics." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Logistics & Operations</h1>
            <p className={styles.lede}>Business-oriented operations training for practical roles in logistics and planning.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Industry Focused</span>
              <span className={styles.badge}>Case Studies</span>
              <span className={styles.badge}>Operations Certificate</span>
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
              'Supply Chain Basics',
              'Inventory Management',
              'Operations Planning',
              'Logistics Analytics'
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
          <h3>Industry Mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Rakesh Gupta</h4>
              <p className={styles.mentorExp}>Operations Leader — Industry Expert</p>
              <Link href="/mentors/rakesh-gupta" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Operations Internship Certificate</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>Operations Internship Certificate — QR verification included.</p>
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
