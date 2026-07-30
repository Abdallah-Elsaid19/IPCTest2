import { useEffect } from "react";
import { ManagedContentProvider } from "@/components/content/ManagedContentProvider";
import ScholarshipsGateway from "./ScholarshipsGateway";

export default function Scholarships() {
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
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <ManagedContentProvider endpoint="/api/scholarships" slug="scholarships">
      <ScholarshipsGateway />
    </ManagedContentProvider>
  );
}
