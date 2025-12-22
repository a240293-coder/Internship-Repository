"use client";

import styles from "./Navbar.module.css";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Separate mobile states for dropdowns
  const [showMobileCourses, setShowMobileCourses] = useState(false);
  const [showMobileMore, setShowMobileMore] = useState(false);
  const [showMobileSignIn, setShowMobileSignIn] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  // Sign In Dropdown state (hover-based for desktop)
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);
  // Mobile Sign In Dropdown state
  const [showMobileSignInDropdown, setShowMobileSignInDropdown] = useState(false);
  // Close mobile Sign In dropdown when mobile menu closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      setShowMobileSignInDropdown(false);
      setShowMobileCourses(false);
      setShowMobileMore(false);
      setShowMobileSignIn(false);
    }
  }, [mobileMenuOpen]);

  const bannerTexts = [
    "▶  Book a live demo session ⏱️ Next cohort starts on 26th Dec, 2025",
    "Your Success, Our Mission!",
    "781 Careers Launched in 2024 — Be Next!",
    "Learn skills. Get internships. Build careers.",
    "Industry-ready internships with real projects"
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentTextIndex(prevIndex => (prevIndex + 1) % bannerTexts.length);
        setIsFading(false);
      }, 150);
    }, 60000); // Change text every 60 seconds

    return () => clearInterval(interval); // Clean up interval on unmount
  }, [bannerTexts.length]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCourses && !e.target.closest(`.${styles.coursesDropdown}`)) {
        setShowCourses(false);
      }
      if (showMore && !e.target.closest(`.${styles.moreDropdown}`)) {
        setShowMore(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowMore(false);
        setShowCourses(false);
      }
    };

    if (showMore || showCourses) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [showMore, showCourses]);

  const handleMoreClick = (e) => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  const handleOverlayClick = () => {
    setShowMore(false);
  };

  // No document click listeners for Sign In dropdown (hover only)

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.container}>
          <div className={styles.leftSection}>
            <h1 className={styles.logo}>Learn<span className={styles.logoHighlight}>Better</span></h1>
            
            <div className={styles.coursesDropdown} 
                 onMouseEnter={() => {
                   if (closeTimeout) clearTimeout(closeTimeout);
                   setShowCourses(true);
                 }} 
                 onMouseLeave={() => {
                   setCloseTimeout(setTimeout(() => setShowCourses(false), 200));
                 }}>
              <button 
                className={styles.coursesBtn}
                aria-label="Courses dropdown"
              >
                Courses
                <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>
              
              {showCourses && (
                <div className={styles.coursesMenu}
                  onMouseEnter={() => {
                    if (closeTimeout) clearTimeout(closeTimeout);
                  }}
                  onMouseLeave={() => {
                    setCloseTimeout(setTimeout(() => setShowCourses(false), 300));
                  }}>
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
            <a href="#placements">Placements</a>
            <a href="#masterclass">Masterclass</a>
            <a href="#practice" className={styles.freePracticeLink}>
              <span className={styles.freeText}>FREE</span> Practice
            </a>
            <a href="#hire">Hire From Us</a>
            <div className={styles.moreDropdown}
              onMouseEnter={() => {
                if (closeTimeout) clearTimeout(closeTimeout);
                setShowMore(true);
              }}
              onMouseLeave={() => {
                setCloseTimeout(setTimeout(() => setShowMore(false), 300));
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
              {showMore && (
                <div className={styles.moreMenu}
                  onMouseEnter={() => {
                    if (closeTimeout) clearTimeout(closeTimeout);
                  }}
                  onMouseLeave={() => {
                    setCloseTimeout(setTimeout(() => setShowMore(false), 300));
                  }}
                >
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
          
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      {mobileMenuOpen && (
        <>
          <div
            className={styles.mobileOverlay}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className={styles.mobileMenu}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.mobileMenuHeader}>
              <h1 className={styles.mobileLogo}>Learn<span className={styles.logoHighlight}>Better</span></h1>
              <button className={styles.closeBtn} onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">×</button>
            </div>
            <nav className={styles.mobileNav}>
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
            <span className={styles.bannerText} style={{ opacity: isFading ? 0 : 1 }}>
              {bannerTexts[currentTextIndex]}
            </span>
            <button className={styles.btnBookNow} aria-label="Book a live demo session">Book Now</button>
          </div>
        </div>
      </div>
      
      {/* Overlay removed for hover-based dropdown */}
    </>
  );
}
