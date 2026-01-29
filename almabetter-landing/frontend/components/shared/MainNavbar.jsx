
import styles from "../Navbar.module.css";
import coursesData from "../../data/courses";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';

// Dummy categories fallback (should be replaced with real data)
const categories = {
  marketing: {
    title: "Marketing",
    courses: [{ slug: "digital-marketing", title: "Digital Marketing" }],
  },
  technology: {
    title: "Technology",
    courses: [{ slug: "web-dev", title: "Web Development" }],
  },
  data: {
    title: "Data Science",
    courses: [{ slug: "data-science", title: "Data Science" }],
  },
  operations: {
    title: "Operations",
    courses: [{ slug: "operations", title: "Operations" }],
  },
};

export default function MainNavbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isDesktopCoursesOpen, setIsDesktopCoursesOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState('');
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [isHomeRoute, setIsHomeRoute] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const bannerTexts = [
    "Get mentored by top experts!",
    "Unlock your dream career!",
    "Join our next cohort!",
  ];

  const coursesMenuRef = useRef(null);
  const coursesCloseTimerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsHomeRoute(router.pathname === '/');
  }, [router.pathname]);

  useEffect(() => {
    // Improved auth logic: only treat as logged in if userRole is a valid, non-empty string
    const updateAuthState = () => {
      const role = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');
      // Accept only specific roles (add more as needed) and require a token
      const validRoles = ['student', 'mentor', 'admin'];
      if (token && role && validRoles.includes(String(role).toLowerCase())) {
        setUserRole(String(role).toLowerCase());
        setIsLoggedIn(true);
      } else {
        setUserRole('');
        setIsLoggedIn(false);
      }
    };
    updateAuthState();
    window.addEventListener('authChanged', updateAuthState);
    return () => window.removeEventListener('authChanged', updateAuthState);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % bannerTexts.length);
        setIsFading(false);
      }, 500);
    }, 3500);
    return () => clearInterval(timer);
  }, [bannerTexts.length]);

  const handleLogoClick = useCallback(() => {
    if (router && typeof router.push === 'function') {
      router.push('/');
    } else if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, [router]);

  const handleLogout = () => {
    try {
      const storedRole = localStorage.getItem('userRole');
      const storedRoleNorm = storedRole ? String(storedRole).toLowerCase() : null;
      if (storedRoleNorm) {
        localStorage.removeItem(`userName_${storedRoleNorm}`);
        localStorage.removeItem(`userEmail_${storedRoleNorm}`);
        localStorage.removeItem(`userId_${storedRoleNorm}`);
      }
    } catch (e) {}
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUserRole('');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <>
      <header className={`${styles.navbar} navbar-global ${scrolled ? styles.scrolled : ""}`}> 
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
            <a href="#placements">Placements</a>
            <a href="/contact" target="_blank" rel="noopener noreferrer">Contact Us</a>
            <a href="/about" target="_blank" rel="noopener noreferrer">About Us</a>
          </nav>

          <div className={styles.signinWrapper} style={{ position: 'relative', height: '100%' }}>
            {!isLoggedIn && (
              <>
                <div
                  className={styles.signInDropdownBtnWrapper}
                  style={{ display: 'inline-block', position: 'relative' }}
                  onMouseEnter={() => setShowSignInDropdown(true)}
                  onMouseLeave={() => setShowSignInDropdown(false)}
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
              </>
            )}
            {isLoggedIn && (
              <>
                <button className={styles.signInDropdownBtn} onClick={handleLogout}>Logout</button>
              </>
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
          <div className={styles.mobileOverlay} onClick={() => setIsMobileMenuOpen(false)} />
          <div className={styles.mobileMenu} onClick={e => e.stopPropagation()}>
            <div className={styles.mobileMenuHeader}>
              <button type="button" className={styles.mobileLogoButton} onClick={handleLogoClick} aria-label="Open LearnBetter homepage">
                <span style={{ marginLeft: 0 }} className={styles.mobileLogo}>Learn<span className={styles.logoHighlight}>Better</span></span>
              </button>
              <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">×</button>
            </div>
            <nav className={styles.mobileNav} onClick={(e) => { const t = e.target; if (t && t.tagName === 'A') { setIsMobileMenuOpen(false); } }}>
              <button className={styles.mobileMenuItem} onClick={e => { e.stopPropagation(); setShowMobileCourses(prev => !prev); }}>
                <span className={styles.coursesLabel}>Courses</span>
                <svg className={`${styles.chevron} ${showMobileCourses ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {showMobileCourses && (
                <div className={styles.mobileAccordionWrap}>
                  {Object.entries(categories).map(([k, cat]) => (
                    <div key={k} className={styles.mobileAccordion}>
                      <button className={`${styles.accordionRow} ${mobileOpenCategory === k ? styles.open : ''}`} onClick={(e) => { e.stopPropagation(); setMobileOpenCategory(prev => (prev === k ? '' : k)); }} aria-expanded={mobileOpenCategory === k ? 'true' : 'false'}>
                        <span className={`${styles.accordionTitle} ${styles.mobileCourseCategory}`}>{cat.title}</span>
                        <svg className={`${styles.chevron} ${mobileOpenCategory === k ? styles.rotated : ''}`} width="14" height="10" viewBox="0 0 12 8" fill="none" aria-hidden>
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                      </button>
                      <div className={`${styles.accordionContent} ${mobileOpenCategory === k ? styles.open : ''}`}>
                        {cat.courses.map(c => (
                          <a key={c.slug} href={`/courses/${k}/${c.slug}`} className={styles.accordionCourse} onClick={(ev) => { ev.preventDefault(); setSelectedDomain(k); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch (err) {} try { if (typeof window !== 'undefined') window.open(`/courses/${k}/${c.slug}`, '_blank'); } catch (err) { if (router && typeof router.push === 'function') router.push(`/courses/${k}/${c.slug}`); } }}>{c.title}</a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <a href="#placements" className={styles.mobileMenuItem}>Placements</a>
              <a href="/contact" className={styles.mobileMenuItem} target="_blank" rel="noopener noreferrer">Contact Us</a>
              <a href="/about" target="_blank" rel="noopener noreferrer" className={styles.mobileMenuItem}>About Us</a>
              <div>
                {!isLoggedIn && (
                  <>
                    <button className={styles.mobileSignInDropdownBtn} type="button" onClick={e => { e.stopPropagation(); setShowMobileSignIn(prev => !prev); }} aria-haspopup="true" aria-expanded={showMobileSignIn ? "true" : "false"}>Sign Up <span style={{fontSize: '1em', marginLeft: 4}}>▾</span></button>
                    {showMobileSignIn && (
                      <div className={styles.mobileSignInDropdown}>
                        <Link href="/auth/signup/student" className={styles.mobileSignInDropdownItem} onClick={(ev) => { ev.preventDefault(); setShowMobileSignIn(false); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch(e){} try { if (typeof window !== 'undefined') window.open('/auth/signup/student', '_blank'); } catch(err) { if (router && typeof router.push === 'function') router.push('/auth/signup/student'); } }}>Student Sign Up</Link>
                        <div className={styles.dropdownDivider} />
                        <Link href="/auth/signup/mentor" className={styles.mobileSignInDropdownItem} onClick={(ev) => { ev.preventDefault(); setShowMobileSignIn(false); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0,0); } catch(e){} try { if (typeof window !== 'undefined') window.open('/auth/signup/mentor', '_blank'); } catch(err) { if (router && typeof router.push === 'function') router.push('/auth/signup/mentor'); } }}>Mentor Sign Up</Link>
                      </div>
                    )}
                  </>
                )}
                {isLoggedIn && (
                  <>
                    <button className={styles.mobileSignInDropdownBtn} onClick={handleLogout}>Logout</button>
                  </>
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
