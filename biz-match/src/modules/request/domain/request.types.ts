// src/modules/request/domain/request.types.ts
import type { Request, RequestStatus } from "@prisma/client";

export type { RequestStatus };

export type RequestSummary = Pick<
  Request,
  "id" | "title" | "description" | "status" | "createdAt"
> & {
  // extend later if needed
};

export type MatchResult = {
  serviceId: string;
  businessId: string;
  businessName: string;
  serviceTitle: string;
  category: string;
  industry: string | null;
  score: number;
  why: string;
  // NEW: for cards + filters
  ratingValue?: number | null;
  ratingCount?: number;
  isVerified?: boolean;
  locationCity?: string | null;
  locationCountry?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  skills?: string[];
};

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  DRAFT: "Draft",
  MATCHING: "Matching",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};
