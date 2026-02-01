import React, { useState, useRef, useEffect } from 'react';
import styles from './MultiSelectChips.module.css';

export default function MultiSelectChips({ options = [], value = [], onChange, placeholder = 'Select...' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const filtered = options
    .filter(o => !value.includes(o))
    .filter(o => o.toLowerCase().includes(query.trim().toLowerCase()));

  const add = (opt) => {
    const next = Array.from(new Set([...(value || []), opt]));
    onChange && onChange(next);
    setQuery('');
    setOpen(false);
  };

  const remove = (opt) => {
    const next = (value || []).filter(v => v !== opt);
    onChange && onChange(next);
  };

  const onInputKeyDown = (e) => {
    if (e.key === 'Enter' && query) {
      // if query exactly matches an option, add it; otherwise ignore
      const match = options.find(o => o.toLowerCase() === query.trim().toLowerCase());
      if (match) add(match);
      e.preventDefault();
    }
    if (e.key === 'Backspace' && !query && value && value.length) {
      // remove last
      remove(value[value.length - 1]);
    }
  };

  return (
    <div ref={containerRef} className={styles.root}>
      <div
        onClick={() => { setOpen(true); }}
        className={styles.control}
      >
        {(value || []).map(v => (
          <div key={v} className={styles.chip}>
            <span className={styles.chipText}>{v}</span>
            <button aria-label={`remove ${v}`} type="button" onClick={(e) => { e.stopPropagation(); remove(v); }} className={styles.removeBtn}>×</button>
          </div>
        ))}

        <input
          aria-label="expertise"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onInputKeyDown}
          placeholder={ (value && value.length) ? '' : placeholder }
          className={styles.input}
        />
      </div>

      {open && filtered.length > 0 && (
        <div className={styles.dropdown}>
          {filtered.map(opt => (
            <div key={opt} onClick={() => add(opt)} className={styles.option}>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
