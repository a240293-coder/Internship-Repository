import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import styles from '../styles/About.module.css';

export default function About() {
  const stats = [
    { value: '5000+', label: 'projects delivered by students' },
    { value: '100%', label: 'curriculum mapped to industry' },
    { value: '1:1', label: 'mentor guidance on real work' },
  ];

  const aboutCards = [
    { title: 'Real projects', text: 'Ship production-like projects that mirror internship tasks, so you talk about real outcomes in interviews.', badge: 'Program info', date: 'Updated weekly', mediaTitle: 'Project-ready' },
    { title: 'Mentor guidance', text: 'Work with mentors who have shipped products; get focused feedback on code, design, and communication.', badge: 'Mentor support', date: 'Fresh reviews', mediaTitle: 'Mentor-backed' },
    { title: 'Career signals', text: 'Showcase measurable wins: shipped features, dashboards, and documented learnings that recruiters can trust.', badge: 'Career signals', date: 'Always current', mediaTitle: 'Career proof' },
  ];

  const wideCards = [
    { title: 'Current tech stacks', text: 'Projects use modern stacks so you learn tools that teams already run in production.' },
    { title: 'Evidence over claims', text: 'You collect commits, demos, and write-ups — artifacts recruiters can review quickly.' },
    { title: 'Career-safe support', text: 'Mentors highlight gaps early and help you close them before interviews.' },
    { title: 'Soft skills built-in', text: 'Practice updates, async comms, and concise documentation — the signals teams notice.' }
  ];

  const trustItems = [
    { title: 'Proof of work', text: 'Versioned code, demo links, and changelogs to discuss in interviews.' },
    { title: 'Documented learnings', text: 'Concise summaries of what you built, why it matters, and what you would improve.' },
    { title: 'Mentor validation', text: 'Feedback that highlights strengths and gaps to share with recruiters.' }
  ];

  const [isMobile, setIsMobile] = useState(false);
  const statCarouselRef = useRef(null);
  const aboutCarouselRef = useRef(null);
  const wideCarouselRef = useRef(null);
  const trustCarouselRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const scrollCarousel = (ref) => {
      if (ref.current) {
        const { scrollLeft, clientWidth, scrollWidth } = ref.current;
        // Check if we are at the end (with a small buffer for float precision)
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          ref.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          ref.current.scrollTo({ left: scrollLeft + clientWidth, behavior: 'smooth' });
        }
      }
    };

    const statInterval = setInterval(() => scrollCarousel(statCarouselRef), 4000);
    const aboutInterval = setInterval(() => scrollCarousel(aboutCarouselRef), 5000);
    const wideInterval = setInterval(() => scrollCarousel(wideCarouselRef), 4500);
    const trustInterval = setInterval(() => scrollCarousel(trustCarouselRef), 4000);

    return () => {
      clearInterval(statInterval);
      clearInterval(aboutInterval);
      clearInterval(wideInterval);
      clearInterval(trustInterval);
    };
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>About LearnBetter | Student-First, Internship-Ready</title>
        <meta name="description" content="LearnBetter helps students get internship-ready with real projects, mentorship, and industry-aligned learning." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className={styles.page}>
        

        <section className={styles.hero}>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <p className={styles.kicker}>Student-first · Internship-ready</p>
              <h1 className={styles.heroTitle}>Who we are and how we help you land internships faster.</h1>
              <p className={styles.heroSubtitle}>
                LearnBetter is a practice-led learning platform built to make students confident with real projects, mentorship, and industry exposure — so you can show tangible skills, not just grades.
              </p>
              <div className={styles.heroActions}>
                <Link href="/apply" className={`${styles.btn} ${styles.btnPrimary}`}>Explore programs</Link>
              </div>
              <div className={styles.quickStats}>
                {isMobile ? (
                  <div className={styles.statCarousel} ref={statCarouselRef}>
                    <div className={styles.statTrack}>
                      {stats.map((stat, idx) => (
                        <div className={`${styles.statCard} ${styles.statCardMobile}`} key={stat.value}>
                          <div className={styles.statValue}>{stat.value}</div>
                          <div className={styles.statLabel}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  stats.map((stat) => (
                    <div className={styles.statCard} key={stat.value}>
                      <div className={styles.statValue}>{stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Why students choose LearnBetter</h2>
              <p className={styles.sectionSubtitle}>Built for students who want proof of skill: portfolio-ready projects, mentor feedback, and a clear path to internships.</p>
            </div>
            <div className={styles.cardGrid}>
              {isMobile ? (
                  <div className={styles.cardCarousel} ref={aboutCarouselRef}>
                    <div className={styles.cardTrack}>
                      {aboutCards.map((card) => (
                        <div className={`${styles.featureCard} ${styles.cardMobile}`} key={card.title}>
                        <div className={styles.featureMedia}>
                          <div className={styles.featureMediaText}>{card.mediaTitle || card.title}</div>
                        </div>
                        <div className={styles.featureBody}>
                          <div className={styles.featureMeta}>
                            <span className={styles.featureBadge}>{card.badge || 'Program info'}</span>
                            <span className={styles.featureDate}>{card.date}</span>
                          </div>
                          <h3 className={styles.featureTitle}>{card.title}</h3>
                          <p className={styles.featureText}>{card.text}</p>
                          <Link href="/apply" className={styles.featureLink}>Read more</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                aboutCards.map((card) => (
                  <div className={styles.featureCard} key={card.title}>
                    <div className={styles.featureMedia}>
                      <div className={styles.featureMediaText}>{card.mediaTitle || card.title}</div>
                    </div>
                    <div className={styles.featureBody}>
                      <div className={styles.featureMeta}>
                        <span className={styles.featureBadge}>{card.badge || 'Program info'}</span>
                        <span className={styles.featureDate}>{card.date}</span>
                      </div>
                      <h3 className={styles.featureTitle}>{card.title}</h3>
                      <p className={styles.featureText}>{card.text}</p>
                      <Link href="/apply" className={styles.featureLink}>Read more</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.split}>
              <div className={styles.splitText}>
                <h2 className={styles.sectionTitle}>Internship readiness, step by step</h2>
                <p className={styles.sectionSubtitle}>A simple path that takes you from fundamentals to internship-ready portfolios without guesswork.</p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>✓</span>
                    <div className={styles.listText}><strong>Build</strong> – Start with scoped tasks that match real internship work.</div>
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>✓</span>
                    <div className={styles.listText}><strong>Review</strong> – Get mentor feedback on code quality, clarity, and delivery.</div>
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>✓</span>
                    <div className={styles.listText}><strong>Show</strong> – Publish your work with context: goals, decisions, and outcomes.</div>
                  </li>
                  <li className={styles.listItem}>
                    <span className={styles.listIcon}>✓</span>
                    <div className={styles.listText}><strong>Apply</strong> – Use your proof of work to apply with confidence.</div>
                  </li>
                </ul>
              </div>
              <div className={styles.splitCard}>
                <div className={styles.highlightCard}>
                  <p className={styles.badge}>Internship-focused</p>
                  <h3 className={styles.highlightTitle}>Everything maps to how teams actually work.</h3>
                  <p className={styles.cardText}>From standups to PRs, you practice the same rituals used in real teams so your first day at an internship feels familiar.</p>
                  <div className={styles.tags}>
                    <span className={styles.tag}>Git workflow</span>
                    <span className={styles.tag}>Code reviews</span>
                    <span className={styles.tag}>Docs-first</span>
                    <span className={styles.tag}>Metrics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>How we keep it industry-aligned</h2>
              <p className={styles.sectionSubtitle}>Content, projects, and mentor reviews are updated with what hiring managers expect today.</p>
            </div>
            <div className={styles.cardGridWide}>
              {isMobile ? (
                <div className={styles.cardCarousel} ref={wideCarouselRef}>
                  <div className={styles.cardTrack}>
                    {wideCards.map((card) => (
                      <div className={`${styles.card} ${styles.cardMobile}`} key={card.title}>
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        <p className={styles.cardText}>{card.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                wideCards.map((card) => (
                  <div className={styles.card} key={card.title}> 
                    <h3 className={styles.cardTitle}>{card.title}</h3>
                    <p className={styles.cardText}>{card.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Trust signals students can show</h2>
              <p className={styles.sectionSubtitle}>Everything you create is reviewable: repos, walkthroughs, and short write-ups that prove your ability to execute.</p>
            </div>
            <div className={styles.trustGrid}>
              {isMobile ? (
                <div className={styles.cardCarousel} ref={trustCarouselRef}>
                  <div className={styles.cardTrack}>
                    {trustItems.map((item) => (
                      <div className={`${styles.trustItem} ${styles.cardMobile}`} key={item.title}>
                        <h3 className={styles.trustTitle}>{item.title}</h3>
                        <p className={styles.cardText}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                trustItems.map((item) => (
                  <div className={styles.trustItem} key={item.title}>
                    <h3 className={styles.trustTitle}>{item.title}</h3>
                    <p className={styles.cardText}>{item.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Ready to get internship-ready?</h2>
              <p className={styles.sectionSubtitle}>Take the next step with a program designed to mirror the way real teams work.</p>
            </div>
              <div className={styles.ctaRow}>
              <Link href="/apply" className={`${styles.btn} ${styles.btnPrimary}`}>Start your application</Link>
              <a className={`${styles.btn} ${styles.btnGhost}`} href="/auth/signin/student" target="_blank" rel="noopener noreferrer">Already a student? Sign in</a>
            </div>
          </div>
        </section>

        
      </main>
    </>
  );
}
