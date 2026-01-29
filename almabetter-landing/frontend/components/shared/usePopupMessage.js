import { useState, useCallback, useRef } from 'react';

export default function usePopupMessage(timeout = 3500) {
  const [popup, setPopup] = useState(null);
  const timerRef = useRef(null);

  const showPopup = useCallback((msg) => {
    // Clear any previous timer
    if (timerRef.current) clearTimeout(timerRef.current);
    setPopup(msg);
    timerRef.current = setTimeout(() => setPopup(null), timeout);
  }, [timeout]);

  const closePopup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPopup(null);
  }, []);

  return [popup, showPopup, closePopup];
}
