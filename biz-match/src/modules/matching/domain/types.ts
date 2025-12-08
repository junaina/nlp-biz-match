// src/modules/matching/domain/types.ts
export type MatchResult = {
  serviceId: string;
  businessId: string;
  businessName: string;
  serviceTitle: string;
  category: string;
  industry: string | null;
  score: number; // 0–100 from LLM
  why: string; // short explanation
};
