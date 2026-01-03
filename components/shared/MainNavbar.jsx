"use client";

import styles from "../Navbar.module.css";
import coursesData from "../../data/courses";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';

export default function MainNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isDesktopCoursesOpen, setIsDesktopCoursesOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [openCategory, setOpenCategory] = useState("");
  const coursesCloseTimerRef = useRef(null);
  const coursesMenuRef = useRef(null);
  const prevBodyOverflowRef = useRef(null);
  const router = useRouter();
  const normalizedPath = (router?.asPath || '').split(/[?#]/)[0] || '';
  const isHomeRoute = normalizedPath === '/' || normalizedPath === '';

  useEffect(() => {
    if (!router || !router.asPath) return;
    const parts = router.asPath.split('/').filter(Boolean);
    if (parts[0] === 'courses' && parts[1]) {
      const slug = parts[1];
      if (['marketing', 'technology', 'data', 'operations'].includes(slug)) {
        setSelectedDomain(slug);
        return;
      }
    }
    setSelectedDomain('');
  }, [router, router.asPath]);

  const categories = {
    marketing: {
      title: 'Marketing & Growth',
      courses: [
        { slug: 'digital-marketing', title: 'Digital Marketing' },
        { slug: 'social-media', title: 'Social Media' },
        { slug: 'pr-outreach', title: 'Public Relation & Outreach' },
        { slug: 'ecommerce', title: 'Ecommerce' },
      ],
    },
    technology: {
      title: 'Technology & Development',
      courses: [
        { slug: 'web-development', title: 'Web Development (Strategic Partner)' },
        { slug: 'app-development', title: 'App Development' },
      ],
    },
    data: {
      title: 'Data & Intelligence',
      courses: [
        { slug: 'data-science', title: 'Data Science' },
      ],
    },
    operations: {
      title: 'Operations & Design',
      courses: [
        { slug: 'logistics', title: 'Logistics & Operations' },
        { slug: 'designing', title: 'Designing' },
      ],
    },
  };

  const toggleCategory = (key) => {
    setOpenCategory(prev => (prev === key ? '' : key));
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState('');
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const bannerTexts = [
    "Build job-ready skills with hands-on projects",
    "Get mentored by industry experts",
    "Launch your career with real internships",
  ];

  useEffect(() => {
    const rotate = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTextIndex((i) => (i + 1) % bannerTexts.length);
        setIsFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(rotate);
  }, [bannerTexts.length]);

  const [showSignInDropdown, setShowSignInDropdown] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setShowMobileCourses(false);
      setShowMobileSignIn(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = "";
    }
    return () => {
      if (typeof document !== 'undefined') document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDesktopCoursesOpen) {
      prevBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      if (prevBodyOverflowRef.current !== undefined && prevBodyOverflowRef.current !== null) {
        document.body.style.overflow = prevBodyOverflowRef.current;
        prevBodyOverflowRef.current = null;
      } else {
        document.body.style.overflow = '';
      }
    }

    return () => {
      if (prevBodyOverflowRef.current !== undefined && prevBodyOverflowRef.current !== null) {
        document.body.style.overflow = prevBodyOverflowRef.current;
        prevBodyOverflowRef.current = null;
      } else {
        document.body.style.overflow = '';
      }
    };
  }, [isDesktopCoursesOpen]);

  useEffect(() => {
    if (!isDesktopCoursesOpen) setOpenCategory('');
  }, [isDesktopCoursesOpen]);

  const handleLogoClick = useCallback(() => {
    if (router && typeof router.push === 'function') {
      router.push('/');
    } else if (typeof window !== "undefined") {
      window.location.href = '/';
    }
  }, [router]);

  return (
    <>
      <header
        className={`${styles.navbar} navbar-global ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <button
              type="button"
              className={styles.logoButton}
              onClick={handleLogoClick}
              aria-label="Open LearnBetter homepage"
            >
              <span style={{ marginLeft: 0 }} className={styles.logo}>Learn<span className={styles.logoHighlight}>Better</span></span>
            </button>
          </div>
          
          <nav className={styles.navLinks}>
            <div
              className={styles.coursesDropdown}
              onMouseEnter={() => {
                if (coursesCloseTimerRef.current) clearTimeout(coursesCloseTimerRef.current);
                setIsDesktopCoursesOpen(true);
                setOpenCategory(prev => prev || 'marketing');
              }}
              onMouseLeave={() => {
                if (coursesCloseTimerRef.current) clearTimeout(coursesCloseTimerRef.current);
                coursesCloseTimerRef.current = setTimeout(() => setIsDesktopCoursesOpen(false), 120);
              }}
            >
              <button
                className={styles.coursesBtn}
                aria-label="Courses dropdown"
                aria-expanded={isDesktopCoursesOpen ? 'true' : 'false'}
              >
                <span className={styles.coursesLabel}>Courses</span>
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>

              {isDesktopCoursesOpen && (
                <div ref={coursesMenuRef} className={styles.coursesMenu} role="menu" aria-label="Courses menu">
                  <div className={styles.menuPanel} onMouseLeave={() => setOpenCategory('')}>
                    <div className={styles.menuLeft} role="list">
                      <div className={styles.allCoursesPill}>All Courses (9)</div>
                      {Object.entries(categories).map(([key, cat]) => (
                        <button
                          key={key}
                          type="button"
                          role="listitem"
                          onMouseEnter={() => setOpenCategory(key)}
                          onClick={() => setOpenCategory(key)}
                          className={`${styles.categoryButton} ${openCategory === key ? styles.categoryActive : ''}`}
                        >
                          {cat.title}
                          <span className={styles.leftIndicator} aria-hidden />
                        </button>
                      ))}
                    </div>

                    <div className={styles.menuRight} role="region" aria-live="polite">
                      {openCategory ? (
                        <div className={styles.rightPanelInner}>
                          <header className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>{categories[openCategory].title}</h3>
                            <p className={styles.panelSubtitle}>{(
                              {
                                marketing: 'Build real-world marketing skills with hands-on projects, tools, and mentor guidance.',
                                technology: 'Learn to build scalable web and app products with industry-standard tools.',
                                data: 'Turn data into insights with practical analysis and projects.',
                                operations: 'Master operations and design workflows used by real businesses.'
                              }[openCategory]
                            )}</p>
                          </header>

                          <div className={styles.cardsGrid}>
                            {categories[openCategory].courses.map((c) => {
                              const href = c.slug === 'ecommerce' ? `/courses/ecommerce` : `/courses/${openCategory}/${c.slug}`;
                              const courseMeta = (coursesData[openCategory] && coursesData[openCategory][c.slug]) || {};
                              const desc = courseMeta.why || courseMeta.heroText || courseMeta.heroSubtitle || '';
                              return (
                                <div key={c.slug} className={styles.courseCard}>
                                  <div className={styles.courseCardBody}>
                                    <div className={styles.courseCardTitle}>{c.title}</div>
                                    <div className={styles.courseCardDesc}>{desc}</div>
                                  </div>
                                  <Link href={href} className={styles.courseCardCta} target="_blank" rel="noopener noreferrer" onClick={() => { setSelectedDomain(openCategory); setIsDesktopCoursesOpen(false); setOpenCategory(''); }}>
                                    <span>Explore course</span>
                                    <span className={styles.ctaArrow} aria-hidden>→</span>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>

                          <div className={styles.panelFooter}>
                            <Link href={`/courses/${openCategory}`} className={styles.viewAllCta} target="_blank" rel="noopener noreferrer" onClick={() => { setSelectedDomain(openCategory); setIsDesktopCoursesOpen(false); setOpenCategory(''); }}>
                              View all {categories[openCategory].title} courses →
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a
              href="#placements"
            >Placements</a>
            
            <a href="/contact" target="_blank" rel="noopener noreferrer">Contact Us</a>
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
            >About Us</a>
          </nav>
          
          <div
            className={styles.signinWrapper}
            onMouseEnter={() => setShowSignInDropdown(true)}
            onMouseLeave={() => setShowSignInDropdown(false)}
            style={{ position: 'relative', height: '100%' }}
          >
            <button
              className={styles.signInDropdownBtn}
              aria-haspopup="true"
              aria-expanded={showSignInDropdown ? "true" : "false"}
            >
              Sign Up <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
            </button>
            {showSignInDropdown && (
              <div
                className={styles.signInDropdown}
                style={{ pointerEvents: 'auto', zIndex: 2000, position: 'absolute', top: '100%', left: 0 }}
              >
                <Link
                  href="/auth/signup/student"
                  className={styles.signInDropdownItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >Student Sign Up</Link>
                <div className={styles.dropdownDivider}></div>
                <Link
                  href="/auth/signup/mentor"
                  className={styles.signInDropdownItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >Mentor Sign Up</Link>
              </div>
            )}
          </div>
          
          <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      {isMobileMenuOpen && (
        <>
          <div
            className={styles.mobileOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div
            className={styles.mobileMenu}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <button
                type="button"
                className={styles.mobileLogoButton}
                onClick={handleLogoClick}
                aria-label="Open LearnBetter homepage"
              >
                <span style={{ marginLeft: 0 }} className={styles.mobileLogo}>Learn<span className={styles.logoHighlight}>Better</span></span>
              </button>
              <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">×</button>
            </div>
            <nav
              className={styles.mobileNav}
              onClick={(e) => {
                const t = e.target;
                if (t && t.tagName === 'A') {
                  setIsMobileMenuOpen(false);
                }
              }}
            >
              <button
                className={styles.mobileMenuItem}
                onClick={e => {
                  e.stopPropagation();
                  setShowMobileCourses(prev => !prev);
                }}
              >
                <span className={styles.coursesLabel}>Courses</span>
                <svg className={`${styles.chevron} ${showMobileCourses ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {showMobileCourses && (
                <div className={styles.mobileAccordionWrap}>
                  {Object.entries(categories).map(([k, cat]) => (
                    <div key={k} className={styles.mobileAccordion}>
                      <button
                        className={`${styles.accordionRow} ${mobileOpenCategory === k ? styles.open : ''}`}
                        onClick={(e) => { e.stopPropagation(); setMobileOpenCategory(prev => (prev === k ? '' : k)); }}
                        aria-expanded={mobileOpenCategory === k ? 'true' : 'false'}
                      >
                        <span className={`${styles.accordionTitle} ${styles.mobileCourseCategory}`}>{cat.title}</span>
                        <svg className={`${styles.chevron} ${mobileOpenCategory === k ? styles.rotated : ''}`} width="14" height="10" viewBox="0 0 12 8" fill="none" aria-hidden>
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>

                      <div className={`${styles.accordionContent} ${mobileOpenCategory === k ? styles.open : ''}`}>
                        {cat.courses.map(c => (
                          <a
                            key={c.slug}
                            href={`/courses/${k}/${c.slug}`}
                            className={styles.accordionCourse}
                            onClick={(ev) => {
                                ev.preventDefault();
                                setSelectedDomain(k);
                                setIsMobileMenuOpen(false);
                                try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch (err) {}
                                try {
                                  if (typeof window !== 'undefined') window.open(`/courses/${k}/${c.slug}`, '_blank');
                                } catch (err) {
                                  if (router && typeof router.push === 'function') router.push(`/courses/${k}/${c.slug}`);
                                }
                            }}
                          >
                            {c.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <a href="#placements" className={styles.mobileMenuItem}>Placements</a>
              <a href="/contact" className={styles.mobileMenuItem} target="_blank" rel="noopener noreferrer">Contact Us</a>
              <a
                href="/about"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileMenuItem}
              >About Us</a>
              <div className={styles.mobileSignInDropdownWrapper}>
                <button
                  className={styles.mobileSignInDropdownBtn}
                  aria-haspopup="true"
                  aria-expanded={showMobileSignIn ? "true" : "false"}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setShowMobileSignIn(prev => !prev);
                    }}
                >
                  Sign Up <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
                </button>
                {showMobileSignIn && (
                  <div className={styles.mobileSignInDropdown}>
                      <Link
                        href="/auth/signup/student"
                        className={styles.mobileSignInDropdownItem}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setShowMobileSignIn(false);
                          setIsMobileMenuOpen(false);
                          try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch(e){}
                          try { if (typeof window !== 'undefined') window.open('/auth/signup/student', '_blank'); } catch(err) { if (router && typeof router.push === 'function') router.push('/auth/signup/student'); }
                        }}
                      >
                        Student Sign Up
                      </Link>
                      <div className={styles.dropdownDivider} />
                      <Link
                        href="/auth/signup/mentor"
                        className={styles.mobileSignInDropdownItem}
                        onClick={(ev) => {
                          ev.preventDefault();
                          setShowMobileSignIn(false);
                          setIsMobileMenuOpen(false);
                          try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch(e){}
                          try { if (typeof window !== 'undefined') window.open('/auth/signup/mentor', '_blank'); } catch(err) { if (router && typeof router.push === 'function') router.push('/auth/signup/mentor'); }
                        }}
                      >
                        Mentor Sign Up
                      </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
      
      {isHomeRoute && (
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <span className={styles.arrow}></span>
            <div className={styles.bannerTextGroup}>
              <span
                className={`${styles.bannerText} ${isFading ? styles.bannerTextFading : styles.bannerTextVisible}`}
              >
                {bannerTexts[currentTextIndex]}
              </span>
              <a className={styles.btnBookNow} href="/book-live-session" target="_blank" rel="noopener noreferrer" aria-label="Book a live demo session">Book Live Session</a>
            </div>
            <div className={styles.mobileBannerRow}>
              <div className={styles.mobileBannerLeft}>
                <span className={styles.bannerIcon}>🚀</span>
                <div className={styles.mobileBannerText}>
                  <div className={styles.mobileBannerHeadline}>Your Success, Our Mission!</div>
                  <div className={styles.mobileBannerSubtext}>Next cohort starts on 26th Dec, 2025</div>
                </div>
              </div>
              <a className={styles.btnMobileBook} href="/book-live-session" target="_blank" rel="noopener noreferrer" aria-label="Book a live demo session">Book Live Session</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
