"use client";

import styles from "./Navbar.module.css";
import { useState, useEffect, useRef, useCallback } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Desktop hover dropdown states
  const [isDesktopCoursesOpen, setIsDesktopCoursesOpen] = useState(false);
  const [isDesktopPracticeOpen, setIsDesktopPracticeOpen] = useState(false);
  const [isDesktopMoreOpen, setIsDesktopMoreOpen] = useState(false);
  // Small close delays via refs to avoid re-renders
  const coursesCloseTimerRef = useRef(null);
  const practiceCloseTimerRef = useRef(null);
  const moreCloseTimerRef = useRef(null);
  // Mobile menu and nested dropdowns
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  // Banner rotation
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  // Sign In Dropdown state (hover-based for desktop)
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  // Close mobile nested dropdowns when mobile menu closes
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setShowMobileCourses(false);
      setShowMobileMore(false);
      setShowMobileSignIn(false);
    }
  }, [isMobileMenuOpen]);

  const bannerTexts = [
    "🚀 Your Success, Our Mission!",
    "🎓 Next cohort starts on 26th Dec, 2025",
    "💼 Internship opportunities with real industry projects"
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)');
    let intervalId = null;

    const setupRotation = () => {
      if (mql.matches) {
        // Laptop/tablet rotation every 5 seconds with smooth fade
        intervalId = setInterval(() => {
          setIsFading(true);
          setTimeout(() => {
            setCurrentTextIndex(prev => (prev + 1) % bannerTexts.length);
            setIsFading(false);
          }, 300);
        }, 5000);
      } else {
        // Ensure no fading state persists on mobile
        setIsFading(false);
      }
    };

    setupRotation();

    const handleChange = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      setupRotation();
    };

    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [bannerTexts.length]);

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
    return () => {
      disableBlur();
    };
  }, [disableBlur]);

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
              onMouseEnter={disableBlur}
              onMouseLeave={enableBlur}
              aria-label="Refresh LearnBetter homepage"
            >
              <span className={styles.logo}>Learn<span className={styles.logoHighlight}>Better</span></span>
            </button>
            
            <div
              className={styles.coursesDropdown}
              onMouseEnter={() => {
                enableBlur();
                if (coursesCloseTimerRef.current) clearTimeout(coursesCloseTimerRef.current);
                setIsDesktopCoursesOpen(true);
              }}
              onMouseLeave={() => {
                if (coursesCloseTimerRef.current) clearTimeout(coursesCloseTimerRef.current);
                coursesCloseTimerRef.current = setTimeout(() => setIsDesktopCoursesOpen(false), 120);
                disableBlur();
              }}
            >
              <button 
                className={styles.coursesBtn}
                aria-label="Courses dropdown"
              >
                Courses
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              
              {isDesktopCoursesOpen && (
                <div className={styles.coursesMenu}>
                  <div className={styles.menuContainer}>
                    <div className={styles.categories}>
                      <ul>
                        <li className={styles.active}>All Internships <span>(6)</span></li>
                        <li>Tech Internships <span>(3)</span></li>
                        <li>Data & AI Internships <span>(2)</span></li>
                        <li>Web & Software Internships <span>(1)</span></li>
                      </ul>
                    </div>
                    
                    <div className={styles.internships}>
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>LearnBetter Labs</div>
                        <div className={styles.title}>Full Stack Web Development Internship</div>
                        <div className={styles.desc}>Hands-on internship with real-world projects and mentor support</div>
                        <div className={styles.badge}>Popular</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                      
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>Industry Partner</div>
                        <div className={styles.title}>Data Analytics & AI Internship</div>
                        <div className={styles.desc}>Excel, SQL, Power BI, Python with real datasets</div>
                        <div className={styles.badge}>Top Rated</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                      
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>LearnBetter Labs</div>
                        <div className={styles.title}>Cloud Computing Internship</div>
                        <div className={styles.desc}>AWS fundamentals, CI/CD exposure, DevOps basics</div>
                        <div className={styles.badge}>Beginner Friendly</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                      
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>Industry Partner</div>
                        <div className={styles.title}>AI & ML Internship</div>
                        <div className={styles.desc}>Machine Learning basics, real datasets, model training</div>
                        <div className={styles.badge}>Popular</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                      
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>LearnBetter Labs</div>
                        <div className={styles.title}>Software Engineering Internship</div>
                        <div className={styles.desc}>Problem solving, Git, team projects, code reviews</div>
                        <div className={styles.badge}>Top Rated</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                      
                      <div className={styles.internshipCard}>
                        <div className={styles.partner}>Industry Partner</div>
                        <div className={styles.title}>Web & Software Internship</div>
                        <div className={styles.desc}>HTML, CSS, JavaScript, React development</div>
                        <div className={styles.badge}>Beginner Friendly</div>
                        <div className={styles.arrow}>↗</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <nav className={styles.navLinks}>
            <a
              href="#placements"
              onMouseEnter={enableBlur}
              onMouseLeave={disableBlur}
            >Placements</a>
            <a
              href="#masterclass"
              onMouseEnter={enableBlur}
              onMouseLeave={disableBlur}
            >Masterclass</a>
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
            <a
              href="#hire"
              onMouseEnter={enableBlur}
              onMouseLeave={disableBlur}
            >Hire From Us</a>
            <div
              className={styles.moreDropdown}
              onMouseEnter={() => {
                enableBlur();
                if (moreCloseTimerRef.current) clearTimeout(moreCloseTimerRef.current);
                setIsDesktopMoreOpen(true);
              }}
              onMouseLeave={() => {
                if (moreCloseTimerRef.current) clearTimeout(moreCloseTimerRef.current);
                moreCloseTimerRef.current = setTimeout(() => setIsDesktopMoreOpen(false), 120);
                disableBlur();
              }}
            >
              <button 
                className={styles.moreBtn}
                aria-label="Toggle more options dropdown"
              >
                More
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {isDesktopMoreOpen && (
                <div className={styles.moreMenu}>
                  <a href="#blog">Blog</a>
                  <div className={styles.divider}></div>
                  <a href="#news">In the News</a>
                </div>
              )}
            </div>
          </nav>
          
          {/* Sign In Dropdown Button - hover logic only */}
          <div
            className={styles.signinWrapper}
            onMouseEnter={() => setShowSignInDropdown(true)}
            onMouseLeave={() => setShowSignInDropdown(false)}
            style={{ position: 'relative', height: '100%' }}
            onFocus={disableBlur}
            onMouseOver={disableBlur}
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
                aria-label="Refresh LearnBetter homepage"
              >
                <span className={styles.mobileLogo}>Learn<span className={styles.logoHighlight}>Better</span></span>
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
                Courses
                <svg className={`${styles.chevron} ${showMobileCourses ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {showMobileCourses && (
                <div className={styles.mobileSubmenu}>
                  <a href="#internships" className={styles.mobileSubItem}>All Internships</a>
                  <a href="#tech" className={styles.mobileSubItem}>Tech Internships</a>
                  <a href="#data" className={styles.mobileSubItem}>Data & AI Internships</a>
                  <a href="#web" className={styles.mobileSubItem}>Web & Software Internships</a>
                </div>
              )}
              <a href="#placements" className={styles.mobileMenuItem}>Placements</a>
              <a href="#masterclass" className={styles.mobileMenuItem}>Masterclass</a>
              <a href="#practice" className={styles.mobileMenuItem}>FREE Practice</a>
              <a href="#hire" className={styles.mobileMenuItem}>Hire From Us</a>
              <button
                className={styles.mobileMenuItem}
                onClick={e => {
                  e.stopPropagation();
                  setShowMobileMore(prev => !prev);
                }}
              >
                More
                <svg className={`${styles.chevron} ${showMobileMore ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              {showMobileMore && (
                <div className={styles.mobileSubmenu}>
                   <a href="/blog" className={styles.mobileSubItem}>Blog</a>
                   <a href="/news" className={styles.mobileSubItem}>In the News</a>
                   <a href="#about" className={styles.mobileSubItem}>About Us</a>
                </div>
              )}
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
                    <a href="/auth/student-signin" target="_blank" rel="noopener noreferrer">
                      Student Sign In
                    </a>
                    <div className={styles.dropdownDivider} />
                    <a href="/auth/mentor-signin" target="_blank" rel="noopener noreferrer">
                      Mentor Sign In
                    </a>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
      
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
      
      {/* Overlay removed for hover-based dropdown */}
    </>
  );
}
