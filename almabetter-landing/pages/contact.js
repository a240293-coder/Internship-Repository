"use client";

import Head from 'next/head';
import styles from '../styles/Contact.module.css';
import { useEffect, useRef, useState } from 'react';

export default function Contact() {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [isCounting, setIsCounting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const reloadTimerRef = useRef(null);
  const statusRef = useRef(null);

  const validate = (formData) => {
    const errs = {};
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const phone = formData.get('phone')?.trim() || '';
    const domain = formData.get('domain') || '';
    const message = formData.get('message')?.trim() || '';

    if (!name) errs.name = 'Please enter your full name.';
    if (!email) errs.email = 'Please enter your email.';
    else {
      const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!re.test(email)) errs.email = 'Please enter a valid email address.';
    }
    if (!phone) errs.phone = 'Please enter your mobile number.';
    else if (!/^[+]?([0-9][ -]?){7,15}$/.test(phone)) errs.phone = 'Please enter a valid phone number.';
    if (!domain) errs.domain = 'Please select a domain of interest.';
    if (!message || message.length < 10) errs.message = 'Please enter a message (at least 10 characters).';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(formRef.current);
    const errs = validate(fd);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setStatusMessage('Scheduling your message...');
      setConfirmation('');
      setCountdown(5);
      setIsCounting(true);
    } else {
      // focus first invalid field
      const first = Object.keys(errs)[0];
      const el = formRef.current.querySelector(`[name="${first}"]`);
      if (el) el.focus();
    }
  };

  useEffect(() => {
    if (!isCounting || countdown === null) return undefined;
    if (countdown === 0) {
      setIsCounting(false);
      setCountdown(null);
      setStatusMessage('');
      setConfirmation('Thanks! Your message has been logged and our team will reach out shortly.');
      formRef.current?.reset();
      setErrors({});
      return undefined;
    }
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [isCounting, countdown]);

  const handleReset = () => {
    setErrors({});
    setIsCounting(false);
    setCountdown(null);
    setStatusMessage('');
    setConfirmation('');
    if (reloadTimerRef.current) {
      clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!confirmation) return undefined;
    reloadTimerRef.current = setTimeout(() => {
      window.location.reload();
    }, 5000);
    return () => {
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    };
  }, [confirmation]);

  useEffect(() => {
    if ((statusMessage || isCounting || confirmation) && statusRef.current) {
      statusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [statusMessage, isCounting, confirmation]);

  return (
    <>
      <Head>
        <title>Contact Us | LearnBetter</title>
        <meta name="description" content="Get in touch with LearnBetter - reach out for program details, partnerships, or support." />
      </Head>

      <main className={styles.contact}>
        <div className={styles.container}>
          <div className={styles.header}>
            <p className={styles.overline}>We respond within 24 hours</p>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>Contact</span> Us
            </h1>
            <p className={styles.subtitle}>Share your goals, partnership ideas, or product questions and we&#39;ll tailor a response for you.</p>
          </div>

          <div className={styles.card}>
            <form
              ref={formRef}
              className={styles.form}
              aria-label="Contact form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  className={styles.input}
                  type="text"
                  placeholder="Your name"
                  aria-invalid={errors.name ? 'true' : 'false'}
                  required
                  minLength={2}
                />
                {errors.name && <div className={styles.error} role="alert">{errors.name}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  className={styles.input}
                  type="email"
                  placeholder="you@company.com"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  required
                />
                {errors.email && <div className={styles.error} role="alert">{errors.email}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="phone">Mobile No</label>
                <input
                  id="phone"
                  name="phone"
                  className={styles.input}
                  type="tel"
                  placeholder="E.g. +91 98765 43210"
                  aria-invalid={errors.phone ? 'true' : 'false'}
                  required
                  pattern="[+]?([0-9][ -]?){7,15}"
                />
                {errors.phone && <div className={styles.error} role="alert">{errors.phone}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="domain">Interested In</label>
                <select
                  id="domain"
                  name="domain"
                  className={styles.select}
                  defaultValue=""
                  aria-invalid={errors.domain ? 'true' : 'false'}
                  required
                >
                  <option value="" disabled>Select domain</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="social-media">Social Media</option>
                  <option value="pr-outreach">Public Relation & Outreach</option>
                  <option value="ecommerce">Ecommerce</option>
                  <option value="web-development">Web Development – Strategic Partner</option>
                  <option value="app-development">App Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="logistics">Logistics & Operations</option>
                  <option value="designing">Designing</option>
                </select>
                {errors.domain && <div className={styles.error} role="alert">{errors.domain}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  className={styles.textarea}
                  rows="6"
                  placeholder="How can we help you?"
                  aria-invalid={errors.message ? 'true' : 'false'}
                  required
                  minLength={10}
                />
                {errors.message && <div className={styles.error} role="alert">{errors.message}</div>}
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary} disabled={isCounting}>Send Message</button>
                <button type="reset" className={styles.btnSecondary} onClick={handleReset}>Reset</button>
              </div>

              {(statusMessage || isCounting || confirmation) && (
                <p className={styles.countdown} ref={statusRef} role="status" aria-live="polite">
                  {isCounting && countdown !== null
                    ? `Sending in ${countdown} second${countdown === 1 ? '' : 's'}...`
                    : confirmation || statusMessage}
                </p>
              )}


            </form>
          </div>

          <div className={styles.footerNote}>
            <p>
              Prefer email? Write to <a href="mailto:support@learnbetter.com">support@learnbetter.com</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
