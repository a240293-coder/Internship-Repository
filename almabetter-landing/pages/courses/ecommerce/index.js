import Head from 'next/head';
import Link from 'next/link';
import styles from '../../../styles/EcommerceGlobal.module.css';
import { useState } from 'react';

export default function EcommerceDomain() {
  const modules = [
    { id: 'm1', title: 'Introduction to E-commerce', desc: 'Overview of ecommerce landscape, business models, and value chains.', outcomes: ['Understand ecommerce economics', 'Identify marketplace vs direct-to-consumer models'] },
    { id: 'm2', title: 'E-commerce Business Models', desc: 'Comparing models: marketplace, D2C, subscription, hybrid.', outcomes: ['Choose an appropriate business model', 'Map revenue streams'] },
    { id: 'm3', title: 'Product & Catalog Management', desc: 'Product data, SKUs, variants, and catalog taxonomy.', outcomes: ['Create optimized listings', 'Design category taxonomy'] },
    { id: 'm4', title: 'Store Setup (Shopify / WooCommerce)', desc: 'Hands-on store setup, theme basics and app integrations.', outcomes: ['Launch a basic Shopify store', 'Connect payment & shipping'] },
    { id: 'm5', title: 'Payment, Checkout & Security', desc: 'Payment gateways, checkout UX, fraud prevention.', outcomes: ['Integrate Stripe/Razorpay', 'Design secure checkout flow'] },
    { id: 'm6', title: 'Logistics, Fulfillment & Returns', desc: 'Fulfillment strategies, 3PL, and return policies.', outcomes: ['Plan fulfillment', 'Estimate logistics cost'] },
    { id: 'm7', title: 'Marketing for E-commerce', desc: 'Acquisition channels, product listing ads, social commerce.', outcomes: ['Run acquisition campaigns', 'Optimize product ads'] },
    { id: 'm8', title: 'Analytics & Optimization', desc: 'KPIs, funnel analysis, A/B testing and conversion optimization.', outcomes: ['Set up GA events', 'Run basic experiments'] },
    { id: 'm9', title: 'Capstone Project', desc: 'Launch a small store, run acquisition and present results.', outcomes: ['Build a portfolio-ready project', 'Get instructor feedback'] },
  ];

  const [open, setOpen] = useState('m1');

  return (
    <>
      <Head>
        <title>E-commerce | LearnBetter</title>
        <meta name="description" content="E-commerce domain program — build, manage, and scale online businesses." />
      </Head>

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <h1 id="hero-title">E-commerce (Domain)</h1>
            <p className={styles.lede}>Build, manage, and scale online businesses using real-world tools and platforms.</p>
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
              'Managing online stores',
              'Product listing & catalog optimization',
              'Pricing & inventory strategy',
              'Order fulfillment & logistics',
              'Payment gateways & checkout flows',
              'Customer acquisition & retention',
              'Analytics for e-commerce decisions',
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
            {['Shopify','WooCommerce','Product Management','Inventory Planning','Order Management','Payment Gateways','Customer Experience','Conversion Optimization'].map(s => (
              <span key={s} className={styles.chip}>{s}</span>
            ))}
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
          <h3>Tools & platforms covered</h3>
          <div className={styles.toolsGrid}>
            {['Shopify','WooCommerce','Stripe','Razorpay','Google Analytics','Meta Commerce','Excel/Sheets'].map(t => (
              <div key={t} className={styles.tool}>{t}</div>
            ))}
          </div>
        </section>

        <section className={styles.who}>
          <h3>Who should take this course</h3>
          <div className={styles.cards}>
            <div className={styles.cardItem}><h4>Students & Freshers</h4><p>Learn practical skills to start a career in ecommerce operations and marketing.</p></div>
            <div className={styles.cardItem}><h4>Aspiring Entrepreneurs</h4><p>Build and launch your first online store with real tools and a project roadmap.</p></div>
            <div className={styles.cardItem}><h4>Career Switchers</h4><p>Transition into ecommerce roles with hands-on project experience and career support.</p></div>
          </div>
        </section>

        <section className={styles.careers}>
          <h3>Career outcomes</h3>
          <ul>
            <li>E-commerce Executive</li>
            <li>Store Manager</li>
            <li>Marketplace Specialist</li>
            <li>Operations Associate</li>
            <li>Business Analyst (E-commerce)</li>
          </ul>
          <p className={styles.careerNote}>Career guidance included with your internship certificate.</p>
        </section>

        <section className={styles.details}>
          <h3>Course details</h3>
          <div className={styles.infoGrid}>
            <div><strong>Duration</strong><div>8–12 Weeks</div></div>
            <div><strong>Mode</strong><div>Online + Projects</div></div>
            <div><strong>Level</strong><div>Beginner to Intermediate</div></div>
            <div><strong>Language</strong><div>English</div></div>
            <div><strong>Certification</strong><div>Yes — Internship Certificate</div></div>
          </div>
        </section>

        <section className={styles.certificate}>
          <h3>Certification</h3>
          <div className={styles.certRow}>
            <div className={styles.certPreview} aria-hidden>Certificate preview</div>
            <div>
              <p>Earn a verified LearnBetter E-commerce Internship Certificate with unique credential ID and QR-based verification.</p>
            </div>
          </div>
        </section>

        <div className={styles.finalCta}>
          <Link href="/apply" className={styles.ctaPrimary}>Apply for E-commerce Program</Link>
          <Link href="/contact" className={styles.ctaSecondary}>Talk to Career Expert</Link>
        </div>
      </main>
    </>
  );
}
