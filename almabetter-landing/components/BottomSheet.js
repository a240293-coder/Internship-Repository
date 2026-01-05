import { useEffect, useRef, useState } from 'react';
import styles from './BottomSheet.module.css';

export default function BottomSheet({ isOpen, onClose, title, options = [], selected, onSelect, anchorRef = null }) {
  const sheetRef = useRef(null);
  const [anchorStyle, setAnchorStyle] = useState(null);
  const repositionRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Swipe down to close on touch devices
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    const el = sheetRef.current;
    if (!el) return;

    let startY = 0;
    let currentY = 0;
    let touching = false;

    function onTouchStart(e) {
      if (e.touches && e.touches.length === 1) {
        startY = e.touches[0].clientY;
        touching = true;
      }
    }

    function onTouchMove(e) {
      if (!touching) return;
      currentY = e.touches[0].clientY;
    }

    function onTouchEnd() {
      if (!touching) return;
      const delta = currentY - startY;
      touching = false;
      startY = 0;
      currentY = 0;
      if (delta > 60) {
        onClose && onClose();
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      try { el.removeEventListener('touchstart', onTouchStart); } catch (_) {}
      try { el.removeEventListener('touchmove', onTouchMove); } catch (_) {}
      try { el.removeEventListener('touchend', onTouchEnd); } catch (_) {}
    };
  }, [isOpen, onClose]);

  // compute anchored position when opened and anchorRef provided
  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') return;
    if (!anchorRef || !anchorRef.current) {
      setAnchorStyle(null);
      return;
    }

    function compute() {
      const rect = anchorRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const left = Math.max(8, rect.left);
      const maxWidth = Math.min(rect.width || 360, vw - 16);
      const topBelow = rect.bottom + 6;
      const availableBelow = vh - rect.bottom - 12;
      const availableAbove = rect.top - 12;

      // preferred max height (mobile requirement)
      const preferredMax = 260;
      const maxHeightBelow = Math.min(preferredMax, Math.max(120, availableBelow - 8));
      const maxHeightAbove = Math.min(preferredMax, Math.max(120, availableAbove - 8));

      // choose placement: prefer below; if insufficient below but enough above, place above; else fallback to sheet
      if (availableBelow >= 120) {
        setAnchorStyle({ position: 'fixed', left: `${left}px`, top: `${topBelow}px`, width: `${maxWidth}px`, maxHeight: `${maxHeightBelow}px`, transform: 'none' });
        return;
      }

      if (availableAbove >= 120) {
        const topAbove = Math.max(8, rect.top - maxHeightAbove - 6);
        setAnchorStyle({ position: 'fixed', left: `${left}px`, top: `${topAbove}px`, width: `${maxWidth}px`, maxHeight: `${maxHeightAbove}px`, transform: 'none' });
        return;
      }

      // fallback to bottom sheet
      setAnchorStyle(null);
    }

    compute();

    // reposition on scroll/resize while open
    function onResizeScroll() {
      compute();
    }
    window.addEventListener('resize', onResizeScroll);
    window.addEventListener('scroll', onResizeScroll, { passive: true });

    repositionRef.current = onResizeScroll;

    return () => {
      try { window.removeEventListener('resize', onResizeScroll); } catch (_) {}
      try { window.removeEventListener('scroll', onResizeScroll); } catch (_) {}
    };
  }, [isOpen, anchorRef]);

  if (!isOpen) return null;

  const sheetClass = anchorStyle ? `${styles.sheet} ${styles.anchored}` : styles.sheet;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={sheetClass} ref={sheetRef} onClick={(e) => e.stopPropagation()} style={anchorStyle || undefined}>
        {!anchorStyle && <div className={styles.handle} />}
        <div className={styles.header}>
          {!anchorStyle ? (
            <h3 className={styles.title}>{title}</h3>
          ) : (
            <div className={styles.anchoredTitle}>{title}</div>
          )}
          <button className={`${styles.closeBtn} ${anchorStyle ? styles.anchoredClose : ''}`} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className={styles.list}>
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(selected);
            return (
              <button
                key={opt.value}
                className={`${styles.row} ${isSelected ? styles.selected : ''}`}
                onClick={() => { onSelect(opt.value); onClose(); }}
                type="button"
                aria-pressed={isSelected}
              >
                <span className={styles.rowLabel}>{opt.label}</span>
                <span className={styles.radioWrap} aria-hidden>
                  {isSelected ? <span className={styles.radioDot} /> : <span className={styles.radio} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

