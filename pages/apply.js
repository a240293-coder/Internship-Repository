import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import styles from "../styles/Apply.module.css";
// Navbar is provided globally in pages/_app.js
// We'll use native selects for accessibility and consistent UX

const initialValues = {
  name: "",
  email: "",
  phone: "",
  interestedDomain: "",
  highestQualification: "",
  message: "",
};

export default function ApplyPage() {
  const [formValues, setFormValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reassuranceText = useMemo(
    () => "Takes less than 2 minutes · No payment required",
    []
  );

  useEffect(() => {
    document.body.classList.add("apply-theme");
    return () => document.body.classList.remove("apply-theme");
  }, []);

  const handleBrandReload = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }, []);

  const metaDetails = useMemo(
    () => [
      { label: "Next cohort", value: "20 January 2026" },
      { label: "Mode", value: "Hybrid · Bengaluru + Remote" },
      { label: "Seats", value: "Limited to 120" },
    ],
    []
  );

  const highlightDetails = useMemo(
    () => [
      {
        title: "Personalized mentorship",
        description:
          "Dedicated industry mentors keep you accountable with 1:1 guidance and career planning.",
      },
      {
        title: "Interview preparation",
        description:
          "Hands-on portfolio projects, mock interviews, and ATS-ready resume support.",
      },
      {
        title: "Scholarship assistance",
        description:
          "Merit-based tuition support plus zero-cost EMI guidance from our finance desk.",
      },
    ],
    []
  );

  const statsDetails = useMemo(
    () => [
      { value: "97%", label: "Placement rate" },
      { value: "4800+", label: "Hiring partners" },
      { value: "INR 32 LPA", label: "Top package 2024" },
    ],
    []
  );

  const handleFieldChange = useCallback((field) => (event) => {
    let { value } = event.target;

    // Special handling for phone: keep only digits, limit to 10, and format as '##### #####'
    if (field === "phone") {
      // keep only digits and use the last 10 digits (drops country code if present)
      const digits = value.replace(/\D/g, "").slice(-10);
      if (digits.length > 5) {
        value = `${digits.slice(0, 5)} ${digits.slice(5)}`;
      } else {
        value = digits;
      }
    }

    setFormValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  // no bottom sheets used; inline selects are used for domain/qualification

  const domainOptions = useMemo(() => [
    { label: 'Digital Marketing', value: 'Digital Marketing' },
    { label: 'Social Media', value: 'Social Media' },
    { label: 'Public Relation & Outreach', value: 'Public Relation & Outreach' },
    { label: 'Ecommerce', value: 'Ecommerce' },
    { label: 'Web Development – Strategic Partner', value: 'Web Development – Strategic Partner' },
    { label: 'App Development', value: 'App Development' },
    { label: 'Data Science', value: 'Data Science' },
    { label: 'Logistics & Operations', value: 'Logistics & Operations' },
    { label: 'Designing', value: 'Designing' }
  ], []);

  const qualificationOptions = useMemo(() => [
    { label: '10th Pass', value: '10th Pass' },
    { label: '12th Pass', value: '12th Pass' },
    { label: 'Diploma', value: 'Diploma' },
    { label: 'Undergraduate', value: 'Undergraduate' },
    { label: 'Postgraduate', value: 'Postgraduate' },
    { label: 'Working Professional', value: 'Working Professional' },
    { label: 'Other', value: 'Other' }
  ], []);

  const validate = useCallback(() => {
    const nextErrors = {};

    const sanitizedName = formValues.name.trim();

    if (!sanitizedName) {
      nextErrors.name = "Please enter your full name.";
    } else if (/\d/.test(sanitizedName)) {
      nextErrors.name = "Full name cannot contain numbers.";
    } else if (sanitizedName.length < 3) {
      nextErrors.name = "Full name should be at least 3 characters.";
    } else if (sanitizedName.split(/\s+/).length < 2) {
      nextErrors.name = "Include first and last name.";
    }

    if (!formValues.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(formValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formValues.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else {
      const digitsOnly = formValues.phone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        nextErrors.phone = "Enter a valid 10-digit phone number.";
      }
    }

    if (!formValues.interestedDomain || !formValues.interestedDomain.trim()) {
      nextErrors.interestedDomain = "Please select Domain.";
    }

    if (!formValues.highestQualification || !formValues.highestQualification.trim()) {
      nextErrors.highestQualification = "Please select your highest qualification.";
    }

    return nextErrors;
  }, [formValues]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      const validationErrors = validate();
      setErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      try {
        // Placeholder async task to mimic form handling latency
        await new Promise((resolve) => setTimeout(resolve, 600));
        setIsSubmitted(true);
        setFormValues(initialValues);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validate]
  );

  return (
    <>
      <Head>
        <title>Apply Now | LearnBetter</title>
      </Head>
      <main className={styles.page}>
        <div className={styles.container}>
          <section className={styles.panel} aria-labelledby="apply-hero">
            <div className={styles.panelMain}>
              <header className={styles.header} role="banner">
                <h1 id="apply-hero" className={styles.title}>Apply Now</h1>
                <p className={styles.subtitle}>{reassuranceText}</p>
                
              </header>

              <div className={styles.metaSection}>
                <span className={styles.badge}>Priority admissions window</span>
              </div>

              <div className={styles.highlights} aria-hidden={false}>
                {highlightDetails.map((card) => (
                  <article key={card.title} className={styles.highlightCard}>
                    <span className={styles.highlightTag}>Included</span>
                    <h3 className={styles.highlightTitle}>{card.title}</h3>
                    <p className={styles.highlightDescription}>{card.description}</p>
                  </article>
                ))}
              </div>

              <form id="apply-form" className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* SECTION 1: Personal Details */}
                <div className={styles.section} aria-labelledby="personal-heading">
                  <h3 id="personal-heading" className={styles.sectionHeading}>Personal details</h3>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="apply-name" className={styles.label}>
                        Full name <span className={styles.required}>*</span>
                      </label>
                      <input
                        id="apply-name"
                        name="name"
                        type="text"
                        value={formValues.name}
                        onChange={handleFieldChange("name")}
                        placeholder="E.g. Priya Sharma"
                        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                        aria-invalid={errors.name ? "true" : "false"}
                        aria-required="true"
                        aria-describedby={errors.name ? "apply-name-error" : undefined}
                        autoComplete="name"
                        required
                      />
                      {errors.name ? (
                        <p id="apply-name-error" className={styles.errorText} role="alert">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>

                    <div className={styles.column}>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="apply-email" className={styles.label}>
                          Email address <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="apply-email"
                          name="email"
                          type="email"
                          value={formValues.email}
                          onChange={handleFieldChange("email")}
                          placeholder="E.g. you@example.com"
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          aria-invalid={errors.email ? "true" : "false"}
                          aria-required="true"
                          aria-describedby={errors.email ? "apply-email-error" : undefined}
                          autoComplete="email"
                          required
                        />
                        {errors.email ? (
                          <p id="apply-email-error" className={styles.errorText} role="alert">
                            {errors.email}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.column}>
                      <div className={styles.fieldGroup}>
                        <label htmlFor="apply-phone" className={styles.label}>
                          Phone number <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="apply-phone"
                          name="phone"
                          type="tel"
                          value={formValues.phone}
                          onChange={handleFieldChange("phone")}
                          placeholder="E.g. +91 98765 43210"
                          className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                          aria-invalid={errors.phone ? "true" : "false"}
                          aria-required="true"
                          aria-describedby={errors.phone ? "apply-phone-error" : undefined}
                          autoComplete="tel"
                            required
                            maxLength={12}
                        />
                        {errors.phone ? (
                          <p id="apply-phone-error" className={styles.errorText} role="alert">
                            {errors.phone}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: Academic & Career Details */}
                <div className={styles.section} aria-labelledby="career-heading">
                  <h3 id="career-heading" className={styles.sectionHeading}>Academic & career</h3>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="qualification" className={styles.label}>Highest Qualification <span className={styles.required}>*</span></label>
                      <select
                        id="qualification"
                        name="highestQualification"
                        value={formValues.highestQualification}
                        onChange={handleFieldChange("highestQualification")}
                        className={`${styles.input} ${styles.select} ${errors.highestQualification ? styles.inputError : ""}`}
                        aria-invalid={errors.highestQualification ? "true" : "false"}
                        aria-required="true"
                        aria-describedby={errors.highestQualification ? "apply-qualification-error" : undefined}
                        required
                      >
                        <option value="">Select</option>
                        {qualificationOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.highestQualification ? (
                        <p id="apply-qualification-error" className={styles.errorText} role="alert">
                          {errors.highestQualification}
                        </p>
                      ) : null}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="domain" className={styles.label}>Interested Domain <span className={styles.required}>*</span></label>
                      <select
                        id="domain"
                        name="interestedDomain"
                        value={formValues.interestedDomain}
                        onChange={handleFieldChange("interestedDomain")}
                        className={`${styles.input} ${styles.select} ${errors.interestedDomain ? styles.inputError : ""}`}
                        aria-invalid={errors.interestedDomain ? "true" : "false"}
                        aria-required="true"
                        aria-describedby={errors.interestedDomain ? "apply-domain-error" : undefined}
                        size={1}
                        required
                      >
                        <option value="">Select</option>
                        {domainOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {errors.interestedDomain ? (
                        <p id="apply-domain-error" className={styles.errorText} role="alert">
                          {errors.interestedDomain}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: Additional */}
                <div className={styles.section} aria-labelledby="additional-heading">
                  <h3 id="additional-heading" className={styles.sectionHeading}>Additional information</h3>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="message" className={styles.label}>Optional message / career goal</label>
                      <textarea
                      id="message"
                      name="message"
                      value={formValues.message || ""}
                      onChange={(e) => setFormValues((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Briefly tell us your career goal or expectations"
                      className={`${styles.textarea} ${styles.input}`}
                      rows={4}
                    />
                  </div>
                </div>

                <div className={styles.ctaRow}>
                  <button
                    type="submit"
                    className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting ? "true" : "false"}
                  >
                    {isSubmitting ? "Submitting…" : "Submit Application"}
                  </button>
                </div>

                {isSubmitted && !isSubmitting ? (
                  <p className={styles.successMessage} role="status" aria-live="polite">
                    Thanks! Our admissions team will reach out shortly.
                  </p>
                ) : null}
              </form>

              {/* bottom sheets removed: inline selects used for predictable UX */}
            </div>

            <aside className={styles.panelAside} aria-labelledby="why-apply-title">
              <div className={styles.whyPanel}>
                <h3 id="why-apply-title" className={styles.whyTitle}>Why Apply to This Program</h3>
                <ul className={styles.whyList}>
                  <li className={styles.whyItem}>
                    <span className={styles.whyIcon} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12l2 2 4-4" stroke="#1E40AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div className={styles.whyText}>
                      <div className={styles.whyHeadline}>Outcome-Focused Learning</div>
                      <div className={styles.whySub}>Hands-on projects aligned with real industry roles.</div>
                    </div>
                  </li>

                  <li className={styles.whyItem}>
                    <span className={styles.whyIcon} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6M5 9a7 7 0 0014 0" stroke="#1E40AF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div className={styles.whyText}>
                      <div className={styles.whyHeadline}>Mentor Support</div>
                      <div className={styles.whySub}>Guidance from experienced industry professionals.</div>
                    </div>
                  </li>

                  <li className={styles.whyItem}>
                    <span className={styles.whyIcon} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="11" rx="2" stroke="#1E40AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 11h10" stroke="#1E40AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div className={styles.whyText}>
                      <div className={styles.whyHeadline}>Certification</div>
                      <div className={styles.whySub}>Recognized certificate upon successful completion.</div>
                    </div>
                  </li>

                  <li className={styles.whyItem}>
                    <span className={styles.whyIcon} aria-hidden>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12h18" stroke="#1E40AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3v18" stroke="#1E40AF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div className={styles.whyText}>
                      <div className={styles.whyHeadline}>Career Readiness</div>
                      <div className={styles.whySub}>Interview prep and practical skill validation.</div>
                    </div>
                  </li>
                </ul>

                <div className={styles.whyStats} aria-hidden>
                  <div className={styles.pill}>97% Placement Rate</div>
                  <div className={styles.pill}>4800+ Hiring Partners</div>
                  <div className={styles.pill}>INR 32 LPA Top Package</div>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

