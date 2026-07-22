import { useCallback, useEffect, useState } from "react";

import SEO from "@/components/seo/SEO";
import type { AwardCategory, AwardProgramme } from "@/features/awards/types";
import { apiJson } from "@/lib/api";
import { subscribeToContentUpdates } from "@/lib/contentSync";
import AwardsBeneficiaries from "./components/AwardsBeneficiaries";
import AwardsBenefits from "./components/AwardsBenefits";
import AwardsFaq from "./components/AwardsFaq";
import AwardsFeatured from "./components/AwardsFeatured";
import AwardsFinalCta from "./components/AwardsFinalCta";
import AwardsFramework from "./components/AwardsFramework";
import AwardsHero from "./components/AwardsHero";
import AwardsIntegrity from "./components/AwardsIntegrity";
import AwardsInterest from "./components/AwardsInterest";
import AwardsPartnerships from "./components/AwardsPartnerships";
import AwardsTimeline from "./components/AwardsTimeline";
import AwardsUnavailable from "./components/AwardsUnavailable";
import { defaultAwardsContent } from "./components/constants";
import type { AwardPageContent } from "./types";

export default function Awards() {
  const [featuredAwards, setFeaturedAwards] = useState<AwardProgramme[] | null>(null);
  const [awardCategories, setAwardCategories] = useState<AwardCategory[] | null>(null);
  const [awardsError, setAwardsError] = useState("");
  const [awardContent, setAwardContent] = useState<AwardPageContent | null>(defaultAwardsContent);

  const loadFeaturedAwards = useCallback(async (signal?: AbortSignal) => {
    setFeaturedAwards(null);
    setAwardsError("");
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const programmes = await apiJson<AwardProgramme[]>("/api/award-programmes", undefined, { signal });
        setFeaturedAwards(programmes);
        return;
      } catch (error) {
        if (signal?.aborted) return;
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          continue;
        }
        setFeaturedAwards([]);
        setAwardsError(error instanceof Error ? error.message : "Award programmes could not be loaded.");
      }
    }
  }, []);

  const loadAwardCategories = useCallback(async (signal?: AbortSignal) => {
    try {
      const categories = await apiJson<AwardCategory[]>("/api/award-categories", undefined, { signal });
      setAwardCategories(categories);
    } catch {
      if (!signal?.aborted) setAwardCategories([]);
    }
  }, []);

  const loadAwardContent = useCallback(async () => {
    try {
      setAwardContent(await apiJson<AwardPageContent>("/api/awards/content", undefined, { cache: "no-store" }));
    } catch {
      setAwardContent(null);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadFeaturedAwards(controller.signal);
    void loadAwardCategories(controller.signal);
    void loadAwardContent();
    return () => controller.abort();
  }, [loadAwardCategories, loadAwardContent, loadFeaturedAwards]);

  useEffect(() => subscribeToContentUpdates("awards", () => {
    void loadAwardContent();
    void loadFeaturedAwards();
    void loadAwardCategories();
  }), [loadAwardCategories, loadAwardContent, loadFeaturedAwards]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [awardContent?.updated_at, awardCategories?.length, featuredAwards?.length]);

  if (awardContent === null) return <AwardsUnavailable />;

  const timeline = awardContent.nomination_timeline.filter((item) => item.is_active !== false);
  const benefits = awardContent.impact_benefits.filter((item) => item.is_active !== false);
  const beneficiaries = awardContent.beneficiaries.filter((item) => item.is_active !== false);
  const principles = awardContent.integrity_principles.filter((item) => item.is_active !== false);
  const partnerships = awardContent.partnerships.filter((item) => item.is_active !== false);

  return (
    <div>
      <SEO
        title={awardContent.seo.title}
        description={awardContent.seo.description}
        canonicalPath={awardContent.seo.canonical_path}
        noIndex={awardContent.seo.noindex || awardContent.seo.nofollow}
      />
      <AwardsHero content={awardContent.hero} />
      <AwardsFramework content={awardContent.framework_intro} categories={awardCategories} />
      <AwardsFeatured content={awardContent.featured_intro} programmes={featuredAwards} error={awardsError} onRetry={() => void loadFeaturedAwards()} />
      <AwardsTimeline content={awardContent.timeline_intro} steps={timeline} isLoading={false} error="" />
      <AwardsBenefits content={awardContent.benefits_intro} benefits={benefits} isLoading={false} error="" />
      <AwardsBeneficiaries content={awardContent.beneficiaries_intro} beneficiaries={beneficiaries} />
      <AwardsIntegrity content={awardContent.integrity_intro} principles={principles} isLoading={false} error="" />
      <AwardsPartnerships content={awardContent.partnerships_intro} partnerships={partnerships} />
      <AwardsFaq content={awardContent.faq} />
      <AwardsInterest content={awardContent.interest_intro} />
      <AwardsFinalCta content={awardContent.final_cta} />
    </div>
  );
}
