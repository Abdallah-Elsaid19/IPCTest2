import { useEffect } from "react";

export default function useScrollReveal(threshold = 0.1) {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [threshold]);
}