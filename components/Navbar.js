"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [showCourses, setShowCourses] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [closeTimeout, setCloseTimeout] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

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
  }, [showMore, showCourses, styles.coursesDropdown, styles.moreDropdown]);

  const handleMoreClick = (e) => {
    e.preventDefault();
    setShowMore(!showMore);
  };

  const handleOverlayClick = () => {
    setShowMore(false);
  };

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
          
          <div className={styles.navButtons}>
            <a href="/auth/signin" target="_blank" rel="noopener noreferrer" className={styles.btnSignIn} aria-label="Sign in to your account">SIGN IN</a>
          </div>
          
          <button className={styles.hamburger} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <h1 className={styles.mobileLogo}>Learn<span className={styles.logoHighlight}>Better</span></h1>
            <button className={styles.closeBtn} onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">×</button>
          </div>
          
          <nav className={styles.mobileNav}>
            <button className={styles.mobileMenuItem} onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}>
              Courses
              <svg className={`${styles.chevron} ${mobileCoursesOpen ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            {mobileCoursesOpen && (
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
            
            <button className={styles.mobileMenuItem} onClick={() => setMobileMoreOpen(!mobileMoreOpen)}>
              More
              <svg className={`${styles.chevron} ${mobileMoreOpen ? styles.rotated : ''}`} width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
                <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </button>
            {mobileMoreOpen && (
              <div className={styles.mobileSubmenu}>
                <a href="#blog" className={styles.mobileSubItem}>Blog</a>
                <a href="#news" className={styles.mobileSubItem}>In the News</a>
                <a href="#about" className={styles.mobileSubItem}>About Us</a>
              </div>
            )}
            
            <a href="/auth/signin" target="_blank" rel="noopener noreferrer" className={styles.mobileSignIn}>SIGN IN</a>
          </nav>
        </div>
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
