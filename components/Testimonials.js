import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Data science',
      company: 'Google',
      testimonial: 'learnBetter transformed my career completely. The hands-on projects and expert mentorship helped me land my dream job at Google. The program is worth every penny!',
      image: '/profile.jpg',
    },
    {
      name: 'Amit Patel',
      role: 'App development',
      company: 'Microsoft',
      testimonial: 'The curriculum is perfectly aligned with industry needs. I learned cutting-edge technologies and the placement support was exceptional. Got placed with a 40 LPA package!',
      image: '/profile.jpg',
    },
    {
      name: 'Neha Gupta',
      role: 'Solutions Architect at Amazon',
      company: 'Amazon',
      testimonial: 'Best decision of my career! The live classes, doubt support, and real-world projects gave me confidence to crack tough interviews. Highly recommended!',
      image: '/profile.jpg',
    },
    {
      name: 'Rohit Singh',
      role: 'Product Manager at Flipkart',
      company: 'Flipkart',
      testimonial: 'Transitioning into product was seamless with learnBetter. The practical product exercises and mentor reviews helped me build portfolio pieces that got noticed in interviews.',
      image: '/profile.jpg',
    },
    {
      name: 'Sara Khan',
      role: 'Data Scientist at IBM',
      company: 'IBM',
      testimonial: 'The data projects and one-on-one mentor sessions were the biggest differentiators. I gained confidence handling real datasets and secured a role at IBM.',
      image: '/profile.jpg',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);
  const touchCurrentX = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef(null);
  const trackRef = useRef(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  // Auto-play only on mobile viewports; ensure it stops if viewport grows
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    let id;
    const startAutoPlay = () => {
      if (id) clearInterval(id);
      id = setInterval(() => {
        // don't auto-advance while user is interacting
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    };

    startAutoPlay();

    const handleVisibility = () => {
      if (document.hidden) {
        if (id) clearInterval(id);
      } else {
        if (!id) startAutoPlay();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (id) clearInterval(id);
    };
  }, [testimonials.length]);

  // pause autoplay when hovered or dragging
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let id;
    if (!isHovered && !isDragging) {
      id = setInterval(() => setCurrentIndex((prev) => (prev + 1) % testimonials.length), 5000);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isHovered, isDragging, testimonials.length]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Touch / pointer swipe handlers (simple threshold-based swipe)
  const handleTouchStart = (e) => {
    setIsDragging(true);
    touchStartX.current = e.touches ? e.touches[0].clientX : e.clientX;
    touchCurrentX.current = touchStartX.current;
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    touchCurrentX.current = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = touchCurrentX.current - touchStartX.current;
    setDragOffset(delta);
  };

  // Keep track of wrapper width so translateX uses a stable value across renders
  useEffect(() => {
    function updateWidth() {
      if (wrapperRef.current) {
        setWrapperWidth(Math.floor(wrapperRef.current.clientWidth));
      }
    }

    updateWidth();
    if (typeof window !== 'undefined') {
      let rafId = null;
      const onResize = () => {
        // debounce via rAF for smoother updates
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          updateWidth();
        });
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, []);

  const handleTouchEnd = () => {
    if (!isDragging || touchStartX.current == null || touchCurrentX.current == null) {
      setIsDragging(false);
      setDragOffset(0);
      touchStartX.current = null;
      touchCurrentX.current = null;
      return;
    }

    const deltaX = touchCurrentX.current - touchStartX.current;
    const threshold = 50; // minimal swipe distance in px
    if (Math.abs(deltaX) > threshold) {
      if (deltaX < 0) {
        // swiped left -> next
        goNext();
      } else {
        // swiped right -> prev
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    touchCurrentX.current = null;
  };

  return (
    <section className={styles.testimonials} id="reviews">
      <div className={styles.container}>
        <h2 className={styles.title}>
          Student <span className={styles.titleHighlight}>Success</span> Stories
        </h2>
        <p className={styles.subtitle}>
          Hear from our graduates who transformed their careers
        </p>

        <div
          ref={wrapperRef}
          className={`${styles.testimonialWrapper} ${isDragging ? styles.dragging : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onPointerDown={(e) => { if (e.pointerType === 'mouse') { handleTouchStart(e); } }}
          onPointerMove={(e) => { if (e.pointerType === 'mouse') { handleTouchMove(e); } }}
          onPointerUp={(e) => { if (e.pointerType === 'mouse') { handleTouchEnd(e); } }}
        >
            <div
            ref={trackRef}
            className={styles.track}
            style={{
              transform: `translateX(${ -currentIndex * (wrapperWidth || (wrapperRef.current ? wrapperRef.current.clientWidth : 0)) + (isDragging ? dragOffset : 0) }px)`,
              transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(.22,.9,.31,1)'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.cardContent}>
                  <div className={styles.testimonialImage}>
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={72}
                      height={72}
                      className={styles.testimonialAvatar}
                    />
                  </div>
                  <p className={styles.testimonialText}>{testimonial.testimonial}</p>
                  <h4 className={styles.testimonialName}>{testimonial.name}</h4>
                  <p className={styles.testimonialRole}>{testimonial.role}</p>
                  <div className={styles.companyLogo}>{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.arrows}>
          <button className={styles.arrow} onClick={goPrev} aria-label="Previous testimonial">
            ‹
          </button>
          <button className={styles.arrow} onClick={goNext} aria-label="Next testimonial">
            ›
          </button>
        </div>

        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
