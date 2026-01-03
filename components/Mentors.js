import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Mentors.module.css';

export default function Mentors() {
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const resumeTimeoutRef = useRef(null);
  const directionRef = useRef(1); // 1 = forward, -1 = backward
  const indexRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchRef = useRef({ startX: 0, deltaX: 0, dragging: false });

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

  return (
    <section className={styles.mentors} id="mentors">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Learn from Industry <span className={styles.titleHighlight}>Experts</span>
        </h2>
        <p className={styles.subtitle}>
          Get mentored by professionals from top tech companies
        </p>

        <div
          className={styles.grid}
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={pauseAndResume}
        >
          {isMobile ? (
            <div
              className={styles.mentorTrack}
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: 'transform 0.45s ease-in-out',
                width: `${mentors.length * 100}%`,
              }}
            >
              {mentors.map((mentor, index) => (
                <div key={index} className={`${styles.mentorCard} ${styles.mentorCardMobile}`}>
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
              ))}
            </div>
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
        {/* Mobile pagination dots */}
        {isMobile && (
          <div className={styles.mentorDots} aria-hidden={false}>
            {mentors.map((_, i) => (
              <button
                key={i}
                className={`${styles.mentorDot} ${i === currentIndex ? styles.activeDot : ''}`}
                onClick={() => {
                  setCurrentIndex(i);
                  indexRef.current = i;
                  pauseAndResume();
                }}
                aria-label={`Go to mentor ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
