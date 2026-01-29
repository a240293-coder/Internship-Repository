import React from 'react';
import Link from 'next/link';

export default function PopupMessage({ message }) {
  if (!message) return null;

  // If a React node was provided render it directly
  if (typeof message !== 'string') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          marginTop: 64,
          background: 'linear-gradient(90deg,#ffffff,#f8fafc)',
          color: '#032f62',
          padding: '18px 28px',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(2,6,23,0.12)',
          fontWeight: 600,
          fontSize: 16,
          minWidth: 280,
          maxWidth: '92vw',
          textAlign: 'center',
          letterSpacing: 0.2,
          pointerEvents: 'auto',
          transition: 'all 0.22s',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {message}
        </div>
      </div>
    );
  }

  // For plain strings keep old behavior but with refined styling
  let displayMsg = message;
  if (/register successful/i.test(message)) displayMsg = 'Registration successful! You can now log in.';
  if (/login successful/i.test(message)) displayMsg = 'Login successful! Redirecting...';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        marginTop: 64,
        background: 'linear-gradient(90deg,#ffffff,#f8fafc)',
        color: '#032f62',
        padding: '18px 28px',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(2,6,23,0.12)',
        fontWeight: 600,
        fontSize: 16,
        minWidth: 280,
        maxWidth: '92vw',
        textAlign: 'center',
        letterSpacing: 0.2,
        pointerEvents: 'auto',
        transition: 'all 0.22s',
      }}>
        <span>{displayMsg}</span>
      </div>
    </div>
  );
}
