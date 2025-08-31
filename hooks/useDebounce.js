"use client";
import { useEffect, useState } from "react";

/**
 * Hook debounce untuk menunda update value
 * @param {any} value - nilai asli (misal input search)
 * @param {number} delay - delay dalam ms (default 400ms)
 * @returns {any} - nilai yang sudah didebounce
 */
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
