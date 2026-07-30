import { useCallback, useEffect, useState } from "react";
import { ManagedContentProvider, ManagedSectionGate } from "@/components/content/ManagedContentProvider";
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
      <ManagedSectionGate name="hero"><ClubsHero onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="principles"><ClubsPrinciples /></ManagedSectionGate>
      <ManagedSectionGate name="purpose"><ClubsPurpose /></ManagedSectionGate>
      <ManagedSectionGate name="locations_intro"><ClubsLocations onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="programme_intro"><ClubsProgramme onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="audiences_intro"><ClubsAudiences onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="upcoming"><ClubsUpcoming onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="contribution"><ClubsContribution onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="partners"><ClubsPartners onAction={protectedAction} /></ManagedSectionGate>
      <ManagedSectionGate name="faq"><ClubsFaq /></ManagedSectionGate>
      <ManagedSectionGate name="final_cta"><ClubsFinalCta onAction={protectedAction} /></ManagedSectionGate>
      <MembershipGateModal isOpen={membershipGateOpen} onClose={() => setMembershipGateOpen(false)} />
    </ManagedContentProvider>
  );
}
