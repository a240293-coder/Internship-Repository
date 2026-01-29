import { useEffect } from 'react';

export default function useLockBodyScroll(active) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow || '';
    const prevPaddingRight = document.body.style.paddingRight || '';
    if (active) {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [active]);
}
