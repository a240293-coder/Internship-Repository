import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/PROutreach.module.css'
import { useState } from 'react'

export default function PROutreach() {
  const modules = [
    { id: 'm1', title: 'PR Fundamentals', desc: 'Principles of public relations and reputation.', outcomes: ['Write press-ready content'] },
    { id: 'm2', title: 'Media Outreach', desc: 'Media lists, pitching and follow-ups.', outcomes: ['Build outreach lists','Craft pitches'] },
    { id: 'm3', title: 'Brand Communication', desc: 'Messaging and corporate communications.', outcomes: ['Define brand messaging'] },
    { id: 'm4', title: 'Crisis Management', desc: 'Plans and responses for reputational issues.', outcomes: ['Draft crisis playbooks'] },
    { id: 'm5', title: 'Campaign Project', desc: 'Run a small outreach campaign.', outcomes: ['Execute outreach campaign'] },
  ]

  const tools = ['Media Databases','Email Outreach Tools','Analytics']
  const skills = ['Media Relations','Outreach','Brand Messaging']
  const who = ['PR aspirants','Marketing professionals','Business communicators']
  const careers = ['PR Intern','Communications Executive','Outreach Specialist']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Public Relation & Outreach | LearnBetter</title>
        <meta name="description" content="PR & Outreach — practical corporate-ready outreach, media relations and crisis handling." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Public Relation & Outreach</h1>
            <p className={styles.lede}>Make PR practical and corporate-ready: outreach, communication, and campaign execution.</p>
            <div className={styles.badges}>
              <span className={styles.badge}>Corporate Focus</span>
              <span className={styles.badge}>Practical Skills</span>
              <span className={styles.badge}>Certification</span>
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
              'PR Fundamentals',
              'Media Outreach',
              'Brand Communication',
              'Crisis Management'
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
          <h3>PR Mentor</h3>
          <div className={styles.mentorCard}>
            <img src="/profile.jpg" alt="Mentor" className={styles.mentorPhoto} />
            <div>
              <h4>Anjali Menon</h4>
              <p className={styles.mentorExp}>PR Lead — Industry Expert</p>
              <Link href="/mentors/anjali-menon" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>PR & Outreach Certificate — QR-based verification included.</p>
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
