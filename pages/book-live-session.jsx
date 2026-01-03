"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./book-live-session.module.css";
import api from "../lib/api";

const features = [
  {
    icon: "🎯",
    title: "Career clarity",
    description: "Validate your goals, define the next steps, and tell a confident story employers will remember.",
  },
  {
    icon: "🧭",
    title: "Program guidance",
    description: "Discover which LearnBetter paths, projects, and mentors match your background and timeline.",
  },
  {
    icon: "🗺️",
    title: "Personalized roadmap",
    description: "Leave with a mentor-reviewed plan that keeps momentum flowing even after the call.",
  },
];

const agendaItems = [
  {
    title: "Career conversation",
    description: "Share aspirations, wins, and roadblocks so mentors can listen before advising.",
  },
  {
    title: "Program walkthrough",
    description: "Review the LearnBetter roadmap, projects, and support you will receive step by step.",
  },
  {
    title: "Placement roadmap",
    description: "Understand how internship matching, interview prep, and outcomes are handled.",
  },
  {
    title: "Live Q&A",
    description: "Get clarity on timelines, scholarships, campus partnerships, and life after LearnBetter.",
  },
];

const audiences = [
  {
    title: "Students",
    description: "Freshers and graduates who want clarity before committing to a cohort or internship.",
  },
  {
    title: "Working professionals",
    description: "People mapping promotions, switching to product roles, or moving into data-driven careers.",
  },
  {
    title: "Career switchers",
    description: "Transitioners who need to translate past experience into high-impact resumes.",
  },
];

const mentors = [
  {
    initials: "RS",
    name: "Ravi Sharma",
    experience: "12+ yrs in career strategy",
    company: "Meta",
  },
  {
    initials: "PM",
    name: "Priya Menon",
    experience: "Mentored 400+ professionals",
    company: "LearnBetter",
  },
  {
    initials: "AK",
    name: "Ankit Khanna",
    experience: "Product & growth leader",
    company: "Stripe",
  },
  {
    initials: "NL",
    name: "Nikita Lal",
    experience: "Hiring panelist & coach",
    company: "Zoho",
  },
];

const initialFormState = {
  fullName: "",
  email: "",
  phone: "",
  preferredDate: "",
  preferredTime: "",
};

export default function BookLiveSession() {
  const [mentorIndex, setMentorIndex] = useState(0);
  const mentorWrapperRef = useRef(null);
  const mentorTouchStartX = useRef(null);
  const mentorTouchCurrentX = useRef(null);
  const [mentorDragOffset, setMentorDragOffset] = useState(0);
  const [mentorIsDragging, setMentorIsDragging] = useState(false);
  const [mentorWrapperWidth, setMentorWrapperWidth] = useState(0);
  const [isMobileMentor, setIsMobileMentor] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const evaluate = () => setIsMobileMentor(window.innerWidth <= 768);
    evaluate();
    window.addEventListener("resize", evaluate);
    window.addEventListener("orientationchange", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      window.removeEventListener("orientationchange", evaluate);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isMobileMentor) {
      setMentorWrapperWidth(0);
      return undefined;
    }

    const updateWidth = () => {
      if (mentorWrapperRef.current) {
        setMentorWrapperWidth(Math.floor(mentorWrapperRef.current.clientWidth));
      }
    };

    updateWidth();
    let rafId = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateWidth);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isMobileMentor]);

  const validators = {
    fullName: (value) => (value.trim().length >= 2 ? "" : "Enter your full name"),
    email: (value) => (value && /^\S+@\S+\.[A-Za-z]{2,}$/.test(value) ? "" : "Use a valid email"),
    phone: (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Include at least 10 digits";
    },
    preferredDate: (value) => (value ? "" : "Pick a date"),
    preferredTime: (value) => (value ? "" : "Pick a time"),
  };

  const validateField = (name, value) => {
    const validator = validators[name];
    if (!validator) return "";
    return validator(value);
  };

  const validateForm = () => {
    const errors = {};
    Object.entries(formData).forEach(([field, value]) => {
      const message = validateField(field, value);
      if (message) errors[field] = message;
    });
    return errors;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleInputBlur = (event) => {
    const { name, value } = event.target;
    setFormErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      try {
        await api.post('/live-session/book', formData);
        setFormStatus("Thanks! We'll confirm your slot by email shortly.");
        setFormData(initialFormState);
      } catch (err) {
        setFormStatus("Something went wrong. Please try again.");
      }
    } else {
      setFormStatus("");
    }
  };

  useEffect(() => {
    if (!isMobileMentor) return undefined;
    if (mentorIsDragging) return undefined;
    const interval = setInterval(() => {
      setMentorIndex((prev) => (prev + 1) % mentors.length);
    }, 4800);
    return () => clearInterval(interval);
  }, [isMobileMentor, mentorIsDragging, mentors.length]);

  useEffect(() => {
    if (!isMobileMentor) {
      setMentorIndex(0);
      setMentorDragOffset(0);
      setMentorIsDragging(false);
    }
  }, [isMobileMentor]);

  const handleMentorTouchStart = (event) => {
    if (!isMobileMentor) return;
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    mentorTouchStartX.current = clientX;
    mentorTouchCurrentX.current = clientX;
    setMentorIsDragging(true);
    setMentorDragOffset(0);
  };

  const handleMentorTouchMove = (event) => {
    if (!mentorIsDragging) return;
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    mentorTouchCurrentX.current = clientX;
    setMentorDragOffset(clientX - mentorTouchStartX.current);
  };

  const handleMentorTouchEnd = () => {
    if (!mentorIsDragging || mentorTouchStartX.current == null || mentorTouchCurrentX.current == null) {
      setMentorIsDragging(false);
      setMentorDragOffset(0);
      mentorTouchStartX.current = null;
      mentorTouchCurrentX.current = null;
      return;
    }

    const delta = mentorTouchCurrentX.current - mentorTouchStartX.current;
    const threshold = 40;
    if (Math.abs(delta) > threshold) {
      setMentorIndex((prev) => {
        const next = delta < 0 ? prev + 1 : prev - 1;
        return (next + mentors.length) % mentors.length;
      });
    }

    setMentorIsDragging(false);
    setMentorDragOffset(0);
    mentorTouchStartX.current = null;
    mentorTouchCurrentX.current = null;
  };

  const mentorBaseTranslate = -(mentorIndex * (mentorWrapperWidth || (mentorWrapperRef.current ? mentorWrapperRef.current.clientWidth : 0)));
  const mentorTransform = mentorBaseTranslate + (mentorIsDragging ? mentorDragOffset : 0);

  const getMentorCardContents = (mentor) => (
    <>
      <div className={styles.mentorAvatar}>{mentor.initials}</div>
      <p className={styles.mentorName}>{mentor.name}</p>
      <p className={styles.mentorExperience}>{mentor.experience}</p>
      <p className={styles.mentorCompany}>{mentor.company}</p>
    </>
  );
  return (
    <main className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.heroLabel}>Live Career Guidance</p>
            <h1 className={styles.heroTitle}>Book a Live Career Guidance Session</h1>
            <p className={styles.heroSubtext}>
              Have a focused, 1:1 mentor conversation that maps your next steps, whether you are planning to join a cohort, switch fields, or strengthen your placement story.
            </p>
            <div className={styles.heroActions}>
              <button 
                className={styles.heroButton} 
                type="button"
                onClick={() => {
                  const element = document.getElementById('book-live-session-formcard');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Book Your Live Session
              </button>
              <span className={styles.heroHint}>Slots go quickly—lock in a time today to receive the prep kit.</span>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <p className={styles.heroCardTag}>Upcoming slot</p>
              <p className={styles.heroCardTitle}>Jan 27, 2026</p>
              <p className={styles.heroCardText}>
                Mentors walk you through the roadmap, outcomes, and live Q&A for your path.
              </p>
              <div className={styles.heroStatRow}>
                <div className={styles.heroStatGroup}>
                  <span className={styles.heroStatValue}>1:1</span>
                  <span className={styles.heroStatLabel}>Mentorship</span>
                </div>
                <div className={styles.heroStatGroup}>
                  <span className={styles.heroStatValue}>3x</span>
                  <span className={styles.heroStatLabel}>Outcome clarity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Why book a live session</p>
            <h2 className={styles.sectionTitle}>Clear the fog around your next move</h2>
            <p className={styles.sectionSubtitle}>
              We focus on actionable recommendations, practical program guidance, and a personalized commitment plan so you know exactly what to do next.
            </p>
          </div>
          <div className={styles.featureGrid}>
            {features.map((feature) => (
              <article className={styles.featureCard} key={feature.title}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <p className={styles.featureTitle}>{feature.title}</p>
                <p className={styles.featureDescription}>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Session agenda</p>
            <h2 className={styles.sectionTitle}>Structured, mentor-led discussion</h2>
          </div>
          <ul className={styles.agendaList}>
            {agendaItems.map((item, index) => (
              <li className={styles.agendaItem} key={item.title}>
                <div className={styles.agendaIndex}>{index + 1}</div>
                <div className={styles.agendaBody}>
                  <p className={styles.agendaTitle}>{item.title}</p>
                  <p className={styles.agendaText}>{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Who is this for</p>
            <h2 className={styles.sectionTitle}>Anyone pursuing serious career moves</h2>
          </div>
          <div className={styles.audienceGrid}>
            {audiences.map((audience) => (
              <article className={styles.audienceCard} key={audience.title}>
                <p className={styles.audienceTitle}>{audience.title}</p>
                <p className={styles.audienceDescription}>{audience.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Mentor highlights</p>
            <h2 className={styles.sectionTitle}>Meet the people who guide you</h2>
          </div>
          <div
            ref={mentorWrapperRef}
            className={styles.mentorSliderWrapper}
            onTouchStart={handleMentorTouchStart}
            onTouchMove={handleMentorTouchMove}
            onTouchEnd={handleMentorTouchEnd}
          >
            <div
              className={styles.mentorTrack}
              style={{
                transform: `translateX(${mentorTransform}px)`,
                transition: mentorIsDragging ? "none" : "transform 350ms cubic-bezier(.22,.9,.31,1)",
              }}
            >
              {mentors.map((mentor) => (
                <div key={`slide-${mentor.name}`} className={styles.mentorSlide}>
                  <article className={styles.mentorCard}>{getMentorCardContents(mentor)}</article>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.mentorGrid}>
            {mentors.map((mentor) => (
              <article className={styles.mentorCard} key={`grid-${mentor.name}`}>
                {getMentorCardContents(mentor)}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionContent}>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Booking form</p>
            <h2 className={styles.sectionTitle}>Reserve your live slot</h2>
          </div>
          <div id="book-live-session-formcard" className={styles.formCard}>
            <form id="bookingForm" className={styles.formGrid} onSubmit={handleFormSubmit} noValidate>
              <label className={styles.formGroup}>
                Full name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Aditi Sharma"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={Boolean(formErrors.fullName)}
                />
                {formErrors.fullName && <span className={styles.formError}>{formErrors.fullName}</span>}
              </label>
              <label className={styles.formGroup}>
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="hi@learnbetter.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={Boolean(formErrors.email)}
                />
                {formErrors.email && <span className={styles.formError}>{formErrors.email}</span>}
              </label>
              <label className={styles.formGroup}>
                Phone
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 90000 00000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={Boolean(formErrors.phone)}
                />
                {formErrors.phone && <span className={styles.formError}>{formErrors.phone}</span>}
              </label>
              <label className={styles.formGroup}>
                Preferred date
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={Boolean(formErrors.preferredDate)}
                />
                {formErrors.preferredDate && <span className={styles.formError}>{formErrors.preferredDate}</span>}
              </label>
              <label className={styles.formGroup}>
                Preferred time
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  aria-invalid={Boolean(formErrors.preferredTime)}
                />
                {formErrors.preferredTime && <span className={styles.formError}>{formErrors.preferredTime}</span>}
              </label>
            </form>
            <div className={styles.formFooter}>
              <button className={styles.submitButton} type="submit" form="bookingForm">
                Confirm Live Session
              </button>
              {formStatus && (
                <p className={styles.formStatus} role="status">
                  {formStatus}
                </p>
              )}
              <p className={styles.sectionSubtitle}>
                We will send a confirmation email with the video link and a short prep worksheet for your mentor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
