import React from 'react';
import useLockBodyScroll from '../hooks/useLockBodyScroll';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', danger }) {
  useLockBodyScroll(!!open);
  if (!open) return null;
  return (
    <div style={overlayStyle}>
      <div style={modalStyle} role="dialog" aria-modal="true">
        <h3 style={{marginTop:0}}>{title}</h3>
        <p style={{color:'#334155'}}>{message}</p>
        <div style={buttonRowStyle}>
          {cancelText ? (
            <button onClick={onCancel} style={cancelButtonStyle}>{cancelText}</button>
          ) : null}
          <button onClick={onConfirm} style={danger ? dangerButtonStyle : primaryButtonStyle}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(2,6,23,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
};
const modalStyle = {
  background: '#fff', padding: '1.25rem 1.5rem', borderRadius: '8px', width: 'min(560px, 92%)', boxShadow: '0 8px 30px rgba(2,6,23,0.12)'
};
const buttonRowStyle = { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' };
const primaryButtonStyle = { background:'#2563eb', color:'#fff', border:'none', padding:'0.5rem 0.75rem', borderRadius:6, cursor:'pointer', minWidth: 96 };
const dangerButtonStyle = { background:'#ef4444', color:'#fff', border:'none', padding:'0.5rem 0.75rem', borderRadius:6, cursor:'pointer', minWidth: 96 };
const cancelButtonStyle = { background:'#e6eef8', color:'#0f172a', border:'none', padding:'0.5rem 0.75rem', borderRadius:6, cursor:'pointer', minWidth: 96 };
