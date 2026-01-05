import { useState } from 'react';
import styles from './CareerExpertPanel.module.css';

export default function CareerExpertPanel({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you! Our career expert will contact you shortly.');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.panelTitle}>Talk to a Career Expert</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close career expert panel">×</button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.expertInfo}>
            <div className={styles.expertAvatar}>
              <div className={styles.avatarPlaceholder}></div>
            </div>
            <div className={styles.expertDetails}>
              <h3 className={styles.expertName}>LearnBetter Career Advisor</h3>
              <p className={styles.expertDescription}>Get personalized guidance for your career journey with LearnBetter</p>
            </div>
          </div>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="phone" className={styles.formLabel}>Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={styles.formInput}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.formLabel}>Your Career Goals</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us about your career aspirations..."
                required
                className={styles.formTextarea}
              ></textarea>
            </div>
            
            <button type="submit" className={styles.submitButton} aria-label="Submit form to connect with career expert">
              Connect with Expert
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}