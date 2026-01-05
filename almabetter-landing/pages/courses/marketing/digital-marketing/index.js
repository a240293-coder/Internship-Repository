import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/DigitalMarketing.module.css'
import { useState } from 'react'

export default function DigitalMarketing() {
  const modules = [
    { id: 'm1', title: 'Intro to Digital Marketing', desc: 'Overview of channels, metrics, and campaign lifecycles.', outcomes: ['Understand core channels', 'Read basic campaign metrics'] },
    { id: 'm2', title: 'Search Engine Optimization', desc: 'On-page, technical SEO and content planning.', outcomes: ['Conduct a basic SEO audit', 'Plan SEO-friendly content'] },
    { id: 'm3', title: 'Paid Advertising', desc: 'Google Ads and Meta Ads fundamentals and campaign setup.', outcomes: ['Create simple search/display campaigns', 'Analyze CPM/CPC/ROAS'] },
    { id: 'm4', title: 'Social Media Strategy', desc: 'Organic and paid social strategies and creative planning.', outcomes: ['Draft a social calendar', 'Measure engagement and reach'] },
    { id: 'm5', title: 'Email & Funnel Marketing', desc: 'List building, automation, and conversion funnels.', outcomes: ['Design a basic welcome funnel', 'Create email automation workflows'] },
    { id: 'm6', title: 'Analytics & Reporting', desc: 'Set up tracking, dashboards, and conversion reporting.', outcomes: ['Use Google Analytics', 'Build basic marketing reports'] },
    { id: 'm7', title: 'Capstone Project', desc: 'Plan and run a small, measurable campaign and present results.', outcomes: ['Execute an end-to-end campaign', 'Prepare a performance report'] },
  ]

  const tools = ['Google Analytics','Google Ads','Meta Ads Manager','Canva','Mailchimp']
  const skills = ['SEO','Google Ads','Meta Ads','Content Strategy','Conversion Optimization']
  const who = ['Students & Freshers','Aspiring marketers','Business owners']
  const careers = ['Digital Marketing Executive','Performance Marketer','SEO Analyst']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Digital Marketing | LearnBetter</title>
        <meta name="description" content="Digital Marketing domain — performance marketing, SEO, content and analytics." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Digital Marketing</h1>
            <p className={styles.lede}>Learn how brands grow using performance marketing, SEO, content, and analytics.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Beginner Friendly</span>
              <span className={styles.badge}>Hands-on Projects</span>
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
              'SEO & SEM fundamentals',
              'Performance ads (Google, Meta)',
              'Content & brand marketing',
              'Email & funnel marketing',
              'Analytics & reporting'
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
              <h4>Priya Sharma</h4>
              <p className={styles.mentorExp}>10+ years — Ex-Agency / Industry Expert</p>
              <Link href="/mentors/priya-sharma" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>LearnBetter Digital Marketing Internship Certificate — QR-based verification included.</p>
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
