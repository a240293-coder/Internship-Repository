
import styles from "../Navbar.module.css";
import coursesData from "../../data/courses";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';
import api from "../../lib/api";
import { KoHo } from "next/font/google";
import { FiBell, FiSearch, FiChevronDown, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const koho = KoHo({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});


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
  const [userName, setUserName] = useState('');
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState('');
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [isHomeRoute, setIsHomeRoute] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [dashboardTitle, setDashboardTitle] = useState('');
  const profileDropdownRef = useRef(null);
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

    // Infer dashboard title from route
    const pathParts = router.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && ['student', 'mentor', 'admin'].includes(pathParts[0])) {
      const page = pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1).replace(/-/g, ' ');
      setDashboardTitle(page);
    } else {
      setDashboardTitle('');
    }
  }, [router.pathname]);

  useEffect(() => {
    // Improved auth logic: only treat as logged in if userRole is a valid, non-empty string
    const fetchUserProfile = async (role) => {
      try {
        const endpoint = `/${role}/profile`;
        const res = await api.get(endpoint);
        if (res?.data?.name) {
          setUserName(res.data.name);
          // Sync back to localStorage for fallback, but main source is now DB
          localStorage.setItem(`userName_${role}`, res.data.name);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    const updateAuthState = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('userRole');
        const validRoles = ['student', 'mentor', 'admin'];

        if (token && role && validRoles.includes(String(role).toLowerCase())) {
          const normRole = String(role).toLowerCase();
          setUserRole(normRole);
          setIsLoggedIn(true);
          // Fetch fresh name from DB
          fetchUserProfile(normRole);
          // Set initial name from localStorage if available to avoid flicker
          const cachedName = localStorage.getItem(`userName_${normRole}`);
          if (!userName && cachedName) {
            setUserName(cachedName);
          }
        } else {
          setUserRole('');
          setIsLoggedIn(false);
          setUserName('');
        }
      }
    };
    updateAuthState();
    window.addEventListener('authChanged', updateAuthState);
    return () => window.removeEventListener('authChanged', updateAuthState);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    } catch (e) { }
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setUserRole('');
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    router.push('/');
  };

  return (
    <>
      <header className={`${styles.navbar} navbar-global ${scrolled ? styles.scrolled : ""} ${isLoggedIn ? styles.loggedInHeader : ""}`}>
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

            {isLoggedIn && userRole && (
              <div className={styles.dashboardBreadcrumb}>
                <span className={styles.breadcrumbSeparator}>/</span>
                <span className={styles.roleLabel}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                {dashboardTitle && (
                  <>
                    <span className={styles.breadcrumbSeparator}>/</span>
                    <span className={styles.pageLabel}>{dashboardTitle}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <>
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
                      <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
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
                    Sign Up <span style={{ fontSize: '1em', marginLeft: 4 }}>▾</span>
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
              </div>

              <button className={styles.hamburger} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle mobile menu">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </>
          ) : (
            <div className={styles.dashboardRight}>
              <div className={styles.dbProfileSection} ref={profileDropdownRef}>
                <button
                  className={styles.dbProfileTrigger}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  aria-expanded={showProfileDropdown}
                >
                  <div className={styles.dbAvatar}>
                    {userName ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div className={styles.dbProfileMeta}>
                    <span className={styles.dbProfileName}>{userName}</span>
                    <span className={styles.dbProfileRole}>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                  </div>
                  <FiChevronDown className={`${styles.dbChevron} ${showProfileDropdown ? styles.dbChevronRotate : ''}`} />
                </button>

                {showProfileDropdown && (
                  <div className={styles.dbProfileDropdown} role="menu">
                    <Link href={`/${userRole}/account`} className={styles.dbDropdownItem} role="menuitem">
                      <FiUser /> My Account
                    </Link>
                    <div className={styles.dbDropdownDivider} />
                    <button onClick={handleLogout} className={`${styles.dbDropdownItem} ${styles.dbLogoutItem}`} role="menuitem">
                      <FiLogOut /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </button>
              {showMobileCourses && (
                <div className={styles.mobileAccordionWrap}>
                  {Object.entries(categories).map(([k, cat]) => (
                    <div key={k} className={styles.mobileAccordion}>
                      <button className={`${styles.accordionRow} ${mobileOpenCategory === k ? styles.open : ''}`} onClick={(e) => { e.stopPropagation(); setMobileOpenCategory(prev => (prev === k ? '' : k)); }} aria-expanded={mobileOpenCategory === k ? 'true' : 'false'}>
                        <span className={`${styles.accordionTitle} ${styles.mobileCourseCategory}`}>{cat.title}</span>
                        <svg className={`${styles.chevron} ${mobileOpenCategory === k ? styles.rotated : ''}`} width="14" height="10" viewBox="0 0 12 8" fill="none" aria-hidden>
                          <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none" />
                        </svg>
                      </button>
                      <div className={`${styles.accordionContent} ${mobileOpenCategory === k ? styles.open : ''}`}>
                        {cat.courses.map(c => (
                          <a key={c.slug} href={`/courses/${k}/${c.slug}`} className={styles.accordionCourse} onClick={(ev) => { ev.preventDefault(); setSelectedDomain(k); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0, 0); } catch (err) { } try { if (typeof window !== 'undefined') window.open(`/courses/${k}/${c.slug}`, '_blank'); } catch (err) { if (router && typeof router.push === 'function') router.push(`/courses/${k}/${c.slug}`); } }}>{c.title}</a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <a href="#placements" className={styles.mobileMenuItem}>Placements</a>
              <a href="/contact" className={styles.mobileMenuItem} target="_blank" rel="noopener noreferrer">Contact Us</a>
              <a href="/about" target="_blank" rel="noopener noreferrer" className={styles.mobileMenuItem}>About Us</a>
              {!isLoggedIn ? (
                <div>
                  <button className={styles.mobileSignInDropdownBtn} type="button" onClick={e => { e.stopPropagation(); setShowMobileSignIn(prev => !prev); }} aria-haspopup="true" aria-expanded={showMobileSignIn ? "true" : "false"}>Sign Up <span style={{ fontSize: '1em', marginLeft: 4 }}>▾</span></button>
                  {showMobileSignIn && (
                    <div className={styles.mobileSignInDropdown}>
                      <Link href="/auth/signup/student" className={styles.mobileSignInDropdownItem} onClick={(ev) => { ev.preventDefault(); setShowMobileSignIn(false); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0, 0); } catch (e) { } try { if (typeof window !== 'undefined') window.open('/auth/signup/student', '_blank'); } catch (err) { if (router && typeof router.push === 'function') router.push('/auth/signup/student'); } }}>Student Sign Up</Link>
                      <div className={styles.dropdownDivider} />
                      <Link href="/auth/signup/mentor" className={styles.mobileSignInDropdownItem} onClick={(ev) => { ev.preventDefault(); setShowMobileSignIn(false); setIsMobileMenuOpen(false); try { if (typeof window !== 'undefined') window.scrollTo(0, 0); } catch (e) { } try { if (typeof window !== 'undefined') window.open('/auth/signup/mentor', '_blank'); } catch (err) { if (router && typeof router.push === 'function') router.push('/auth/signup/mentor'); } }}>Mentor Sign Up</Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.mobileLoggedInWrapper}>
                  <div className={styles.mobileUserMeta}>
                    <div className={styles.dbAvatar} style={{ margin: '0 0 10px 0' }}>
                      {userName ? userName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
                    </div>
                    <span className={styles.mobileUserNameDisplay}>{userName}</span>
                    <span className={styles.dbProfileRole} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </span>
                  </div>

                  <div className={styles.mobileDashboardLinks}>
                    {userRole === 'student' && (
                      <>
                        <Link href="/student/dashboard" className={styles.mobileMenuItem}>Dashboard</Link>
                        <Link href="/student/form?mode=new" className={styles.mobileMenuItem}>Interest Form</Link>
                        <Link href="/student/sessions" className={styles.mobileMenuItem}>Upcoming Sessions</Link>
                      </>
                    )}
                    {userRole === 'mentor' && (
                      <>
                        <Link href="/mentor/dashboard" className={styles.mobileMenuItem}>Dashboard</Link>
                        <Link href="/mentor/students" className={styles.mobileMenuItem}>My Students</Link>
                        <Link href="/mentor/session" className={styles.mobileMenuItem}>Schedule Session</Link>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <>
                        <Link href="/admin/dashboard" className={styles.mobileMenuItem}>Overview</Link>
                        <Link href="/admin/live-sessions" className={styles.mobileMenuItem}>Live Sessions</Link>
                        <Link href="/admin/mentors" className={styles.mobileMenuItem}>Mentors</Link>
                      </>
                    )}
                  </div>

                  <button className={styles.mobileLogoutBtn} onClick={handleLogout}>Logout</button>
                </div>
              )}
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
