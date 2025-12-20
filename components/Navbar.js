import styles from "./Navbar.module.css";
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
  // Sign In Dropdown state (hover-based for desktop)
  const [showSignInDropdown, setShowSignInDropdown] = useState(false);

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
          </div>
          <div className={styles.signinWrapper}>
            <button
              className={styles.signInDropdownBtn}
              aria-haspopup="true"
              aria-expanded={showSignInDropdown ? "true" : "false"}
              onMouseEnter={() => setShowSignInDropdown(true)}
              onMouseLeave={() => setShowSignInDropdown(false)}
            >
              Sign In <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
            </button>
            {showSignInDropdown && (
              <div
                className={styles.signInDropdown}
                style={{ pointerEvents: 'auto', zIndex: 2000, position: 'absolute', top: '100%', right: 0 }}
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
            {/* Mobile Sign In Dropdown */}
            <div className={styles.mobileSignInDropdownWrapper}>
              <button
                className={styles.mobileSignInDropdownBtn}
                aria-haspopup="true"
                aria-expanded={showMobileSignInDropdown ? "true" : "false"}
                onClick={() => setShowMobileSignInDropdown((v) => !v)}
              >
                Sign In <span style={{fontSize: '1em', marginLeft: 4}}>▾</span>
              </button>
              {showMobileSignInDropdown && (
                <div className={styles.mobileSignInDropdown}>
                  <a href="/auth/signin/student" className={styles.mobileSignInDropdownItem}>Student Sign In</a>
                  <a href="/auth/signin/mentor" className={styles.mobileSignInDropdownItem}>Mentor Sign In</a>
                </div>
              )}
            </div>
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
