import { useState, useEffect, useCallback, useRef } from "react";

interface ScrollProgressOptions {
  offset?: number;
  throttle?: number;
}

export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const { offset = 0, throttle = 16 } = options;
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastCallRef = useRef(0);

  const handleScroll = useCallback(() => {
    const now = Date.now();
    if (now - lastCallRef.current < throttle) return;
    lastCallRef.current = now;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      if (docHeight > 0) {
        setProgress(Math.min(1, Math.max(0, (currentScroll - offset) / docHeight)));
      }
    });
  }, [throttle, offset]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  return { progress, scrollY };
}

export function useElementProgress(elementId: string) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          const rect = entry.boundingClientRect;
          const elHeight = rect.height;
          const visibleStart = Math.max(0, -rect.top);
          const totalVisible = window.innerHeight + elHeight;
          const p = Math.min(1, Math.max(0, visibleStart / totalVisible));
          setProgress(p);
        }
      },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [elementId]);

  return { progress, isVisible };
}

export function useSectionEntrance(elementId: string, threshold = 0.2) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const el = document.getElementById(elementId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !entered) {
          setEntered(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [elementId, threshold, entered]);

  return entered;
}