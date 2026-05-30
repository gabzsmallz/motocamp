import { useEffect, useRef } from 'react';

/**
 * Calls `fn` after `delay` ms of no new calls.
 * Returns a cancel function.
 */
export function useDebounceCallback(fn, delay = 800) {
  const timer = useRef(null);

  function debounced(...args) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }

  // Clean up on unmount
  useEffect(() => () => clearTimeout(timer.current), []);

  return debounced;
}
