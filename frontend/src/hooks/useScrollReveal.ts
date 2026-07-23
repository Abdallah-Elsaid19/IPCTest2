import { useEffect } from "react";

export default function useScrollReveal(threshold = 0.1) {
  useEffect(() => {
    const selector = ".reveal, .reveal-left, .reveal-right, .reveal-scale";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observedElements = new WeakSet<Element>();

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

    const register = (element: Element) => {
      if (observedElements.has(element)) return;
      observedElements.add(element);
      if (reducedMotion) {
        element.classList.add("visible");
        return;
      }
      observer.observe(element);
    };

    const registerTree = (root: ParentNode) => {
      if (root instanceof Element && root.matches(selector)) register(root);
      root.querySelectorAll(selector).forEach(register);
    };

    registerTree(document);

    const mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof Element) registerTree(node);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutationObserver.disconnect();
      observer.disconnect();
    };
  }, [threshold]);
}
