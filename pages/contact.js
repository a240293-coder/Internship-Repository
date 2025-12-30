import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Contact.module.css';
import { useRef, useState } from 'react';

export default function Contact() {
  const formRef = useRef(null);
  const [errors, setErrors] = useState({});

  const validate = (formData) => {
    const errs = {};
    const name = formData.get('name')?.trim() || '';
    const email = formData.get('email')?.trim() || '';
    const domain = formData.get('domain') || '';
    const message = formData.get('message')?.trim() || '';

    if (!name) errs.name = 'Please enter your full name.';
    if (!email) errs.email = 'Please enter your email.';
    else {
      const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!re.test(email)) errs.email = 'Please enter a valid email address.';
    }
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
      // all good — submit the form which has target="_blank"
      formRef.current.submit();
    } else {
      // focus first invalid field
      const first = Object.keys(errs)[0];
      const el = formRef.current.querySelector(`[name="${first}"]`);
      if (el) el.focus();
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | LearnBetter</title>
        <meta name="description" content="Get in touch with LearnBetter - reach out for program details, partnerships, or support." />
      </Head>

      <main className={styles.contact}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.subtitle}>We&#39;d love to hear from you — questions, partnerships, or feedback.</p>
          </div>

          <div className={styles.card}>
            <form
              ref={formRef}
              className={styles.form}
              action="/api/contact"
              method="post"
              target="_blank"
              aria-label="Contact form"
              onSubmit={handleSubmit}
            >
              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="name">Full name</label>
                <input id="name" name="name" className={styles.input} type="text" placeholder="Your name" aria-invalid={errors.name ? 'true' : 'false'} />
                {errors.name && <div className={styles.error} role="alert">{errors.name}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="email">Email</label>
                <input id="email" name="email" className={styles.input} type="email" placeholder="you@company.com" aria-invalid={errors.email ? 'true' : 'false'} />
                {errors.email && <div className={styles.error} role="alert">{errors.email}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="domain">Interested In</label>
                <select id="domain" name="domain" className={styles.select} defaultValue="" aria-invalid={errors.domain ? 'true' : 'false'}>
                  <option value="" disabled>Select domain</option>
                  <option value="digital-marketing">Digital Marketing</option>
                  <option value="social-media">Social Media</option>
                  <option value="pr-outreach">Public Relation & Outreach</option>
                  <option value="ecommerce">Ecommerce</option>
                  <option value="web-development">Web Development</option>
                  <option value="app-development">App Development</option>
                  <option value="data-science">Data Science</option>
                  <option value="logistics">Logistics & Operations</option>
                  <option value="designing">Designing</option>
                </select>
                {errors.domain && <div className={styles.error} role="alert">{errors.domain}</div>}
              </div>

              <div className={styles.formRow}>
                <label className={styles.label} htmlFor="message">Message</label>
                <textarea id="message" name="message" className={styles.textarea} rows="6" placeholder="How can we help you?" aria-invalid={errors.message ? 'true' : 'false'} />
                {errors.message && <div className={styles.error} role="alert">{errors.message}</div>}
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}>Send Message</button>
                <button type="reset" className={styles.btnSecondary} onClick={() => setErrors({})}>Reset</button>
              </div>

              <p className={styles.note}>This form will be handled by our backend team — submissions open in a new tab for review.</p>
            </form>
          </div>

          <div className={styles.footerNote}>
            <p>
              Prefer email? Write to <a href="mailto:support@learnbetter.com">support@learnbetter.com</a>
            </p>
            <p>
              Return to <Link href="/" legacyBehavior><a className={styles.homeLink}>Home</a></Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
