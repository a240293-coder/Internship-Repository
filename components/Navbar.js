"use client";

import styles from "./Navbar.module.css";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Desktop hover dropdown states
  const [isDesktopCoursesOpen, setIsDesktopCoursesOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [openCategory, setOpenCategory] = useState(""); // accordion state: 'marketing'|'technology'|'data'|'operations'
  const [isDesktopPracticeOpen, setIsDesktopPracticeOpen] = useState(false);
  const [isDesktopExpertiseOpen, setIsDesktopExpertiseOpen] = useState(false);
  // Small close delays via refs to avoid re-renders
  const coursesCloseTimerRef = useRef(null);
  const practiceCloseTimerRef = useRef(null);
  const expertiseCloseTimerRef = useRef(null);
  const coursesMenuRef = useRef(null);
  const router = useRouter();
  const isCourseRoute = router && typeof router.asPath === 'string' && (
    router.asPath.startsWith('/courses/') || router.asPath.startsWith('/certificate')
  );
  // Keep selectedDomain in sync with the current route so active state persists
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
  // Mobile menu and nested dropdowns
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [mobileOpenCategory, setMobileOpenCategory] = useState('');
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [showMobileExpertise, setShowMobileExpertise] = useState(false);
  // Banner rotation
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  // Banner rotating texts (prevent runtime error if undefined)
  const bannerTexts = [
    "Build job-ready skills with hands-on projects",
    "Get mentored by industry experts",
    "Launch your career with real internships",
  ];

  // Simple rotation effect for banner text
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
  // Sign In Dropdown state (hover-based for desktop)
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  // Close mobile nested dropdowns when mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setShowMobileCourses(false);
      setShowMobileSignIn(false);
      setShowMobileExpertise(false);
    }
  }, [isMobileMenuOpen]);

  // Lock body scroll only for mobile menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);
  // Lock body scroll when Courses dropdown is open (prevent background scroll)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!isDesktopCoursesOpen) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow || "";
      document.body.style.paddingRight = prevPaddingRight || "";
    };
  }, [isDesktopCoursesOpen]);

  // clear openCategory when the dropdown itself closes
  useEffect(() => {
    if (!isDesktopCoursesOpen) setOpenCategory('');
  }, [isDesktopCoursesOpen]);

  // Prevent background scroll and scroll chaining while dropdown is open
  useEffect(() => {
    if (typeof window === "undefined") return;
    const menuEl = coursesMenuRef.current;
    if (!isDesktopCoursesOpen || !menuEl) return;

    // Wheel handler on the menu to prevent propagation at boundaries
    const onMenuWheel = (e) => {
      // allow if menu can scroll in the delta direction
      const delta = e.deltaY;
      const atTop = menuEl.scrollTop === 0;
      const atBottom = Math.ceil(menuEl.scrollTop + menuEl.clientHeight) >= menuEl.scrollHeight;
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        e.preventDefault();
        e.stopPropagation();
      }
      // otherwise allow scrolling inside menu
    };

    // Touch handling for mobile/touch devices
    let startY = 0;
    const onTouchStart = (e) => {
      if (e.touches && e.touches.length) startY = e.touches[0].clientY;
    };
    const onMenuTouchMove = (e) => {
      if (!e.touches || !e.touches.length) return;
      const currentY = e.touches[0].clientY;
      const delta = startY - currentY;
      const atTop = menuEl.scrollTop === 0;
      const atBottom = Math.ceil(menuEl.scrollTop + menuEl.clientHeight) >= menuEl.scrollHeight;
      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Prevent wheel on document when not over the menu
    const onDocWheel = (e) => {
      if (!menuEl.contains(e.target)) {
        e.preventDefault();
      }
    };

    // Use non-passive to allow preventDefault
    menuEl.addEventListener('wheel', onMenuWheel, { passive: false });
    menuEl.addEventListener('touchstart', onTouchStart, { passive: true });
    menuEl.addEventListener('touchmove', onMenuTouchMove, { passive: false });
    document.addEventListener('wheel', onDocWheel, { passive: false });

    return () => {
      menuEl.removeEventListener('wheel', onMenuWheel);
      menuEl.removeEventListener('touchstart', onTouchStart);
      menuEl.removeEventListener('touchmove', onMenuTouchMove);
      document.removeEventListener('wheel', onDocWheel);
    };
  }, [isDesktopCoursesOpen]);
  // single body-lock useEffect above; duplicate lines removed
  // No global listeners for desktop hover menus

  // No document click listeners for Sign In dropdown (hover only)

  const handleLogoClick = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const enableBlur = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.classList.add("nav-blur");
    }
  }, []);

  const disableBlur = useCallback(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("nav-blur");
    }
  }, []);

  useEffect(() => {
    // Ensure blur is cleared on mount and teardown
    disableBlur();
    return () => {
      disableBlur();
    };
  }, [disableBlur]);

  return (
    <>
      <header
        className={`${styles.navbar} navbar-global ${scrolled ? styles.scrolled : ""}`}
      >
        <div className={styles.container} onMouseLeave={disableBlur}>
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
                  <div className={styles.menuContainer}>
                    <div className={styles.categories}>
                      {Object.entries(categories).map(([key, cat]) => (
                        <div
                          key={key}
                          onMouseEnter={() => setOpenCategory(key)}
                          onMouseLeave={() => setOpenCategory('')}
                        >
                          <button
                            type="button"
                            className={styles.domainHeading + ' ' + styles.domainBoard + (selectedDomain === key ? ` ${styles.domainActive}` : '')}
                            onClick={() => setOpenCategory(prev => (prev === key ? '' : key))}
                            aria-expanded={openCategory === key ? 'true' : 'false'}
                          >
                            {cat.title}
                          </button>

                          <div className={styles.practiceListWrapper + (openCategory === key ? ` ${styles.open}` : '')}>
                            {cat.courses.map((c) => (
                              <Link
                                key={c.slug}
                                href={`/courses/${key}/${c.slug}`}
                                className={styles.practiceItem}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                  setSelectedDomain(key);
                                  setIsDesktopCoursesOpen(false);
                                  setOpenCategory('');
                                }}
                              >
                                {c.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a
              href="#placements"
            >Placements</a>
            <div
              className={styles.expertiseDropdown}
              onMouseEnter={() => {
                enableBlur();
                if (expertiseCloseTimerRef.current) clearTimeout(expertiseCloseTimerRef.current);
                setIsDesktopExpertiseOpen(true);
              }}
              onMouseLeave={() => {
                if (expertiseCloseTimerRef.current) clearTimeout(expertiseCloseTimerRef.current);
                expertiseCloseTimerRef.current = setTimeout(() => setIsDesktopExpertiseOpen(false), 120);
                disableBlur();
              }}
            >
              <button className={`${styles.practiceBtn} ${styles.freePracticeLink}`} aria-label="Our Expertise dropdown">
                <span className={styles.practiceLabel}>Our Expertise</span>
              </button>
              {isDesktopExpertiseOpen && (
                  <div className={styles.expertiseMenu}>
                    <Link href="/courses/marketing/digital-marketing" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Digital Marketing</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/marketing/ecommerce" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Ecommerce</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/technology/web-development" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Web development - Strategic Partner</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/operations/logistics" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Logistics and operations</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/marketing/pr-outreach" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Public relation and outreach</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/operations/designing" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Designing</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/marketing/social-media" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Social Media</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/technology/app-development" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">App Development</Link>
                    <div className={styles.expertiseDivider}></div>
                    <Link href="/courses/data/data-science" className={styles.expertiseItem} target="_blank" rel="noopener noreferrer">Data Science</Link>
                  </div>
                )}
            </div>
            <div
              className={styles.practiceDropdown}
              onMouseEnter={() => {
                enableBlur();
                if (practiceCloseTimerRef.current) clearTimeout(practiceCloseTimerRef.current);
                setIsDesktopPracticeOpen(true);
              }}
              onMouseLeave={() => {
                if (practiceCloseTimerRef.current) clearTimeout(practiceCloseTimerRef.current);
                practiceCloseTimerRef.current = setTimeout(() => setIsDesktopPracticeOpen(false), 120);
                disableBlur();
              }}
            >
              <button className={`${styles.practiceBtn} ${styles.freePracticeLink}`} aria-label="Practice dropdown">
                <span className={styles.freeText}>Free</span>
                <span className={styles.practiceLabel}>Practice</span>
              </button>
              {isDesktopPracticeOpen && (
                <div className={styles.practiceMenu}>
                  <a href="#tutorials" className={`${styles.practiceItem} ${styles.practiceItemHighlight}`}>Tutorials</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#articles" className={styles.practiceItem}>Articles</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#coding-problems" className={styles.practiceItem}>Coding Problems</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#quizzes" className={styles.practiceItem}>Quizzes</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#videos" className={styles.practiceItem}>Learning Videos</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#compilers" className={styles.practiceItem}>Online Compilers</a>
                  <div className={styles.practiceDivider}></div>
                  <a href="#cheatsheet" className={styles.practiceItem}>Cheat Sheet</a>
                </div>
              )}
            </div>
            
            <a href="/contact" target="_blank" rel="noopener noreferrer">Contact Us</a>
            <a
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
            >About Us</a>
          </nav>
          
          {/* Sign In Dropdown Button - hover logic only */}
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
              // No onClick for hover-based dropdown
            >
              Sign In <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
            </button>
            {showSignInDropdown && (
              <div
                className={styles.signInDropdown}
                style={{ pointerEvents: 'auto', zIndex: 2000, position: 'absolute', top: '100%', left: 0 }}
              >
                <a
                  href="/auth/signin/student"
                  className={styles.signInDropdownItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >Student Sign In</a>
                <div className={styles.dropdownDivider}></div>
                <a
                  href="/auth/signin/mentor"
                  className={styles.signInDropdownItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >Mentor Sign In</a>
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
                // Close menu when a link is selected
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
                <div className={styles.mobileSubmenu}>
                  {Object.entries(categories).map(([k, cat]) => (
                    <div key={k}>
                      <button
                        className={styles.mobileSubItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileOpenCategory(prev => (prev === k ? '' : k));
                        }}
                        style={{ fontWeight: 700, width: '100%', textAlign: 'left' }}
                      >
                        {cat.title}
                      </button>
                      {mobileOpenCategory === k && (
                        <div style={{ paddingLeft: 12 }}>
                          {cat.courses.map(c => (
                            <Link
                              key={c.slug}
                              href={`/courses/${k}/${c.slug}`}
                              className={styles.mobileSubItem}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setSelectedDomain(k);
                                setIsMobileMenuOpen(false);
                              }}
                              style={{ fontWeight: 500 }}
                            >
                              {c.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <button
                className={styles.mobileMenuItem}
                onClick={e => {
                  e.stopPropagation();
                  setShowMobileExpertise(prev => !prev);
                }}
              >
                Our Expertise
                <svg className={`${styles.chevron} ${showMobileExpertise ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {showMobileExpertise && (
                <div className={styles.mobileSubmenu}>
                  <Link href="/courses/marketing/digital-marketing" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Digital Marketing</Link>
                  <Link href="/courses/marketing/ecommerce" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Ecommerce</Link>
                  <Link href="/courses/technology/web-development" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Web development - Strategic Partner</Link>
                  <Link href="/courses/operations/logistics" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Logistics and operations</Link>
                  <Link href="/courses/marketing/pr-outreach" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Public relation and outreach</Link>
                  <Link href="/courses/operations/designing" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Designing</Link>
                  <Link href="/courses/marketing/social-media" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Social Media</Link>
                  <Link href="/courses/technology/app-development" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">App Development</Link>
                  <Link href="/courses/data/data-science" className={styles.mobileSubItem} target="_blank" rel="noopener noreferrer">Data Science</Link>
                </div>
              )}
              <a href="#placements" className={styles.mobileMenuItem}>Placements</a>
              <a href="#practice" className={styles.mobileMenuItem}><span className={styles.practiceLabel}>Practice</span><span className={styles.freeText}>FREE</span></a>
              <a href="/contact" className={styles.mobileMenuItem} target="_blank" rel="noopener noreferrer">Contact Us</a>
              <a
                href="/about"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileMenuItem}
              >About Us</a>
              {/* Mobile Sign In Dropdown */}
              <div className={styles.mobileSignInDropdownWrapper}>
                <button
                  className={styles.mobileSignInDropdownBtn}
                  aria-haspopup="true"
                  aria-expanded={showMobileSignIn ? "true" : "false"}
                  onClick={e => {
                    e.stopPropagation();
                    setShowMobileSignIn(prev => !prev);
                  }}
                >
                  Sign In <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
                </button>
                {showMobileSignIn && (
                  <div className={styles.mobileSignInDropdown}>
                    <a
                      href="/auth/signin/student"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mobileSignInDropdownItem}
                    >
                      Student Sign In
                    </a>
                    <div className={styles.dropdownDivider} />
                    <a
                      href="/auth/signin/mentor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mobileSignInDropdownItem}
                    >
                      Mentor Sign In
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
      
      {!isCourseRoute && (
        <div className={styles.banner}>
          <div className={styles.bannerContent}>
            <span className={styles.arrow}></span>
            <div className={styles.bannerTextGroup}>
              <span
                className={`${styles.bannerText} ${isFading ? styles.bannerTextFading : styles.bannerTextVisible}`}
              >
                {bannerTexts[currentTextIndex]}
              </span>
              <button className={styles.btnBookNow} aria-label="Book a live demo session">Book Now</button>
            </div>
            {/* Mobile-specific compact announcement layout */}
            <div className={styles.mobileBannerRow}>
              <div className={styles.mobileBannerLeft}>
                <span className={styles.bannerIcon}>🚀</span>
                <div className={styles.mobileBannerText}>
                  <div className={styles.mobileBannerHeadline}>Your Success, Our Mission!</div>
                  <div className={styles.mobileBannerSubtext}>Next cohort starts on 26th Dec, 2025</div>
                </div>
              </div>
              <button className={styles.btnMobileBook} aria-label="Book a live demo session">Book Now</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Overlay removed for hover-based dropdown */}
    </>
  );
}
