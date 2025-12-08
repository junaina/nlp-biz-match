// src/modules/request/domain/comparison.types.ts

export type ComparedService = {
  serviceId: string;
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
  locationCity: string | null;
  locationCountry: string | null;

  serviceTitle: string;
  category: string;
  industry: string | null;

  // From DB
  ratingValue: number | null; // Business.avgRating
  ratingCount: number; // Business.ratingCount
  minBudget: number | null; // ProviderService.minBudget
  maxBudget: number | null; // ProviderService.maxBudget
  skills: string[];

  // From LLM (all *estimated* for this brief)
  credibilityScore: number | null; // 0–100
  pricingComment: string | null;
  projectsExperience: string | null;
  successLikelihood: number | null; // 0–100
  responseSpeed: string | null;

  skillsHighlights: string[];
  specialisationHighlights: string[];
  communicationHighlights: string[];
};

export type ComparisonRecommendation = {
  recommendedServiceId: string | null;
  reason: string;
};

export type ComparisonResult = {
  requestId: string;
  requestTitle: string;
  requestDescription: string;
  shortlistedCount: number;
  services: ComparedService[];
  recommendation: ComparisonRecommendation;
};
