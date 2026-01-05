import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Mentors.module.css';

const mentors = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Data science',
    company: 'Google',
    bio: '15+ years in cloud computing, Former AWS Solutions Architect',
    image: '/profile.jpg',
  },
  {
    name: 'Sarah Williams',
    role: 'App development',
    company: 'Microsoft',
    bio: 'PhD in AI, Published researcher with 50+ papers',
    image: '/profile.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Social media',
    company: 'Amazon',
    bio: 'Built large-scale systems handling 100M+ users',
    image: '/profile.jpg',
  },
];

export default function Mentors() {
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const indexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchRef = useRef({ startX: 0, deltaX: 0, dragging: false });
  // Track swipe/tap for mobile navigation prevention
  const swipeRef = useRef({ startX: 0, endX: 0, isSwiping: false });

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };

    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);

    return () => {
      window.removeEventListener('resize', updateIsMobile);
    };
  }, []);

  const tick = useCallback(() => {
    if (!isMobile) return;
    const container = carouselRef.current;
    if (!container) return;

    const mentorsCount = 3; // total mentor cards
    const nextIndex = (indexRef.current + 1) % mentorsCount;
    setCurrentIndex(nextIndex);
    indexRef.current = nextIndex;
  }, [isMobile]);

  const startAutoScroll = useCallback(() => {
    clearInterval(intervalRef.current);
    if (!isMobile) return;
    intervalRef.current = setInterval(tick, 5000);
  }, [isMobile, tick]);

  useEffect(() => {
    startAutoScroll();

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(resumeTimeoutRef.current);
    };
  }, [startAutoScroll]);

  const pauseAndResume = useCallback(() => {
    if (!isMobile) return;
    clearInterval(intervalRef.current);
    clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoScroll();
    }, 4000);
  }, [isMobile, startAutoScroll]);

  // Modified auto-swipe effect to always run on mobile
  useEffect(() => {
    if (!isMobile) return;
    const cards = document.querySelectorAll('.' + styles.mentorCard);
    if (!cards.length) return;
    const interval = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % mentors.length;
      setCurrentIndex(nextIndex);
      indexRef.current = nextIndex;
      cards[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }, 5000);
    return () => clearInterval(interval);
  }, [isMobile, mentors.length, styles.mentorCard]);

  // Touch handlers for manual swipe
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    pauseAndResume();
    touchRef.current.startX = e.touches[0].clientX;
    touchRef.current.dragging = true;
    touchRef.current.deltaX = 0;
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !touchRef.current.dragging) return;
    touchRef.current.deltaX = e.touches[0].clientX - touchRef.current.startX;
    if (Math.abs(touchRef.current.deltaX) > 10) e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!isMobile || !touchRef.current.dragging) return;
    const threshold = 50;
    const dx = touchRef.current.deltaX;
    if (dx < -threshold) {
      // swipe left -> next
      const mentorsCount = mentors.length;
      const nextIndex = (indexRef.current + 1) % mentorsCount;
      setCurrentIndex(nextIndex);
      indexRef.current = nextIndex;
    } else if (dx > threshold) {
      // swipe right -> previous
      const mentorsCount = mentors.length;
      const prevIndex = (indexRef.current - 1 + mentorsCount) % mentorsCount;
      setCurrentIndex(prevIndex);
      indexRef.current = prevIndex;
    }
    touchRef.current.dragging = false;
    touchRef.current.deltaX = 0;
  };

  // Touch handlers for swipe/tap detection
  const handleCardTouchStart = (e) => {
    if (!isMobile) return;
    swipeRef.current.startX = e.touches[0].clientX;
    swipeRef.current.isSwiping = false;
  };

  const handleCardTouchMove = (e) => {
    if (!isMobile) return;
    const deltaX = e.touches[0].clientX - swipeRef.current.startX;
    if (Math.abs(deltaX) > 12) {
      swipeRef.current.isSwiping = true;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleCardTouchEnd = (e, onNavigate) => {
    if (!isMobile) return;
    swipeRef.current.endX = e.changedTouches[0].clientX;
    const deltaX = swipeRef.current.endX - swipeRef.current.startX;
    if (Math.abs(deltaX) <= 12) {
      // Treat as tap, allow navigation
      if (typeof onNavigate === 'function') onNavigate();
    } else {
      // Treat as swipe, prevent navigation
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className={styles.mentors} id="mentors">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Mentor <span className={styles.titleHighlight}>Panel</span>
        </h2>
        <p className={styles.subtitle}>Learn from industry experts and top professionals</p>
        <div
          ref={carouselRef}
          className={isMobile ? styles.mentorTrackMobile : styles.mentorTrack}
          onTouchStart={e => { handleTouchStart(e); }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isMobile ? (
            mentors.map((mentor, index) => (
              <div
                key={index}
                className={styles.mentorCard}
                style={{ scrollSnapAlign: 'center' }}
                onTouchStart={handleCardTouchStart}
                onTouchMove={handleCardTouchMove}
                onTouchEnd={e => handleCardTouchEnd(e, () => {
                  // Actual navigation logic (e.g. open mentor detail)
                  // Example: router.push(`/mentor/${mentor.id}`)
                  // If you use a Link or onClick, call it here
                })}
              >
                <div className={styles.mentorImage}>
                  <div className={styles.avatarWrapper}>
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      width={44}
                      height={44}
                      className={styles.mentorAvatar}
                    />
                  </div>
                </div>
                <h3 className={styles.mentorName}>{mentor.name}</h3>
                <p className={styles.mentorRole}>{mentor.role}</p>
                <p className={styles.mentorCompany}>{mentor.company}</p>
                <p className={styles.mentorBio}>{mentor.bio}</p>
              </div>
            ))
          ) : (
            mentors.map((mentor, index) => (
              <div key={index} className={styles.mentorCard}>
                <div className={styles.mentorImage}>
                  <div className={styles.avatarWrapper}>
                    <Image
                      src={mentor.image}
                      alt={mentor.name}
                      width={44}
                      height={44}
                      className={styles.mentorAvatar}
                    />
                  </div>
                </div>
                <h3 className={styles.mentorName}>{mentor.name}</h3>
                <p className={styles.mentorRole}>{mentor.role}</p>
                <p className={styles.mentorCompany}>{mentor.company}</p>
                <p className={styles.mentorBio}>{mentor.bio}</p>
              </div>
            ))
          )}
        </div>
        {/* Mobile pagination dots for mentor cards */}
        {isMobile && (
          <div className={styles.mentorDots} aria-hidden={false}>
            {mentors.map((_, i) => (
              <button
                key={i}
                className={`${styles.mentorDot} ${i === currentIndex ? styles.activeDot : ''}`}
                onClick={e => {
                  setCurrentIndex(i);
                  indexRef.current = i;
                  // Scroll the selected card into view (to the right), but prevent page jump
                  const cards = document.querySelectorAll('.' + styles.mentorCard);
                  if (cards[i]) {
                    cards[i].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
                    // Prevent focus/scroll jump
                    e.preventDefault();
                  }
                }}
                aria-label={`Go to mentor ${i + 1}`}
                tabIndex={-1}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
