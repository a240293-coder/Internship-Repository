import Head from 'next/head'
import Link from 'next/link'
import styles from '../../../../styles/SocialMedia.module.css'
import { useState } from 'react'

export default function SocialMedia() {
  const modules = [
    { id: 'm1', title: 'Social Media Foundations', desc: 'Audience, brand voice, and platform selection.', outcomes: ['Define target audience', 'Establish brand voice'] },
    { id: 'm2', title: 'Instagram & LinkedIn Growth', desc: 'Platform-specific tactics for organic and paid growth.', outcomes: ['Grow followership', 'Optimize profiles for discovery'] },
    { id: 'm3', title: 'Content Planning & Calendars', desc: 'Content pillars, scheduling, and repurposing.', outcomes: ['Create a 30-day content calendar', 'Repurpose long-form content'] },
    { id: 'm4', title: 'Analytics & Insights', desc: 'Measure engagement, reach, and conversion.', outcomes: ['Track KPIs', 'Build a simple analytics dashboard'] },
    { id: 'm5', title: 'Influencer Collaboration', desc: 'Identify, outreach, and measure influencer programs.', outcomes: ['Run micro-influencer promotion', 'Measure campaign ROI'] },
    { id: 'm6', title: 'Brand Campaign Project', desc: 'Plan and execute a cross-platform brand campaign.', outcomes: ['Launch a small campaign', 'Present campaign learnings'] },
  ]

  const tools = ['Meta Business Suite','Canva','Hootsuite','Google Analytics']
  const skills = ['Platform Strategy','Content Planning','Community Growth','Analytics']
  const who = ['Students & Freshers','Aspiring marketers','Business owners']
  const careers = ['Social Media Manager','Content Strategist','Community Lead']

  const [open, setOpen] = useState('m1')

  return (
    <>
      <Head>
        <title>Social Media | LearnBetter</title>
        <meta name="description" content="Social Media domain — practical creator and brand-building strategies." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">Social Media</h1>
            <p className={styles.lede}>Practical creator and brand mindset: platform strategies, content systems, and audience growth.</p>
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
              'Practical creator + brand mindset',
              'Platform-specific strategies',
              'Content planning & calendars',
              'Analytics & insights',
              'Influencer collaboration'
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
              <h4>Rahul Verma</h4>
              <p className={styles.mentorExp}>8+ years — Ex-Agency / Industry Expert</p>
              <Link href="/mentors/rahul-verma" className={styles.mentorCta}>View Mentor Profile</Link>
            </div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>LearnBetter Social Media Internship Certificate — QR-based verification included.</p>
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
