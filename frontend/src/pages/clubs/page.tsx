import { useCallback, useEffect, useState } from "react";
import { ManagedContentProvider } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import MembershipGateModal from "@/components/feedback/MembershipGateModal";
import { pageSeo } from "@/config/pageSeo";
import { useAuth } from "@/features/auth/AuthContext";
import {
  ClubsAudiences,
  ClubsContribution,
  ClubsFaq,
  ClubsFinalCta,
  ClubsHero,
  ClubsLocations,
  ClubsPartners,
  ClubsPrinciples,
  ClubsProgramme,
  ClubsPurpose,
  ClubsUpcoming,
} from "./components/ClubsSections";

export default function Clubs() {
  const { user, isLoading } = useAuth();
  const [membershipGateOpen, setMembershipGateOpen] = useState(false);

  const protectedAction = useCallback(() => {
    if (isLoading) return;
    if (user?.membership_active) {
      window.location.assign("/information-session");
      return;
    }
    setMembershipGateOpen(true);
  }, [isLoading, user]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <ManagedContentProvider endpoint="/api/clubs/content" slug="clubs">
      <ManagedPageSeo fallback={{ ...pageSeo.clubs, canonical_path: pageSeo.clubs.canonicalPath }} />
      <ClubsHero onAction={protectedAction} />
      <ClubsPrinciples />
      <ClubsPurpose />
      <ClubsLocations onAction={protectedAction} />
      <ClubsProgramme onAction={protectedAction} />
      <ClubsAudiences onAction={protectedAction} />
      <ClubsUpcoming onAction={protectedAction} />
      <ClubsContribution onAction={protectedAction} />
      <ClubsPartners onAction={protectedAction} />
      <ClubsFaq />
      <ClubsFinalCta onAction={protectedAction} />
      <MembershipGateModal isOpen={membershipGateOpen} onClose={() => setMembershipGateOpen(false)} />
    </ManagedContentProvider>
  );
}
