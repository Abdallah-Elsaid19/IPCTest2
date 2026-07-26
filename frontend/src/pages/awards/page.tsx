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
import AwardsRecognition from "./components/AwardsRecognition";
import AwardsTimeline from "./components/AwardsTimeline";
import AwardsUnavailable from "./components/AwardsUnavailable";
import { defaultAwardsContent } from "./components/constants";
import type { AwardPageContent } from "./types";

export default function Awards() {
  const [featuredAwards, setFeaturedAwards] = useState<AwardProgramme[] | null>(null);
  const [awardCategories, setAwardCategories] = useState<AwardCategory[] | null>(null);
  const [awardsError, setAwardsError] = useState("");
  const [awardContent, setAwardContent] = useState<AwardPageContent | null>(defaultAwardsContent);

  const loadAwardsPage = useCallback(async (signal?: AbortSignal) => {
    setFeaturedAwards(null);
    setAwardCategories(null);
    setAwardsError("");
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const content = await apiJson<AwardPageContent>(
          "/api/awards/content",
          undefined,
          { signal, cache: "no-store" },
        );
        setAwardContent(content);
        setFeaturedAwards(content.programmes || []);
        setAwardCategories(content.categories || []);
        return;
      } catch (error) {
        if (signal?.aborted) return;
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          continue;
        }
        setAwardContent(null);
        setFeaturedAwards([]);
        setAwardCategories([]);
        setAwardsError(error instanceof Error ? error.message : "Award programmes could not be loaded.");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadAwardsPage(controller.signal);
    return () => controller.abort();
  }, [loadAwardsPage]);

  useEffect(() => subscribeToContentUpdates("awards", () => {
    void loadAwardsPage();
  }), [loadAwardsPage]);

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
  const recognitionBenefits = awardContent.recognition_benefits.filter((item) => item.is_active !== false);
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
      <AwardsBenefits content={awardContent.benefits_intro} benefits={benefits} isLoading={false} error="" />
      <AwardsFramework content={awardContent.framework_intro} categories={awardCategories} />
      <AwardsFeatured content={awardContent.featured_intro} programmes={featuredAwards} error={awardsError} onRetry={() => void loadAwardsPage()} />
      <AwardsBeneficiaries content={awardContent.beneficiaries_intro} beneficiaries={beneficiaries} />
      <AwardsIntegrity content={awardContent.integrity_intro} principles={principles} isLoading={false} error="" />
      <AwardsTimeline content={awardContent.timeline_intro} steps={timeline} isLoading={false} error="" />
      <AwardsRecognition content={awardContent.recognition_intro} benefits={recognitionBenefits} />
      <AwardsPartnerships content={awardContent.partnerships_intro} partnerships={partnerships} />
      <AwardsFaq content={awardContent.faq} />
      <AwardsInterest content={awardContent.interest_intro} />
      <AwardsFinalCta content={awardContent.final_cta} />
    </div>
  );
}
