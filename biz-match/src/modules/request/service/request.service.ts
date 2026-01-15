// src/modules/request/service/request.service.ts
"use server";

import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import { createRequestForBusiness } from "../repo/request.repo";
import { listAllProviderServicesForMatching } from "../repo/provider-matching.repo";
import type { RequestStatus } from "@prisma/client";
import type { MatchResult, RequestSummary } from "../domain/request.types";
import { scoreServicesWithGroq } from "./llm-matcher.service"; // 👈 NEW import

type CreateMyRequestInput = {
  title?: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  industry?: string | null;
  timeline?: string | null;
  status?: RequestStatus;
};

export async function createRequestAndMatch(
  input: CreateMyRequestInput
): Promise<{ request: RequestSummary; matches: MatchResult[] }> {
  type MatcherServicesInput = Parameters<typeof scoreServicesWithGroq>[0];
  const services: MatcherServicesInput =
    await listAllProviderServicesForMatching();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthenticated");
  }

  const title =
    input.title?.trim() ||
    (input.description.length > 80
      ? input.description.slice(0, 77) + "..."
      : input.description);

  const request = await createRequestForBusiness(currentUser.businessId, {
    title,
    description: input.description,
    budgetMin: input.budgetMin ?? null,
    budgetMax: input.budgetMax ?? null,
    industry: input.industry ?? null,
    timeline: input.timeline ?? null,
    status: input.status ?? "MATCHING",
  });

  // 🔁 OLD (remove this):
  // const matches: MatchResult[] = scoreServicesAgainstPrompt(
  //   services,
  //   input.description
  // ).slice(0, 10);

  // ✅ NEW: use Groq-based matcher (falls back to naive if no key / error)
  const matches: MatchResult[] = await scoreServicesWithGroq(
    services,
    input.description
  );

  // If you still want to cap to top N:
  // const matches = (await scoreServicesWithGroq(services as any, input.description)).slice(0, 10);

  return {
    request: {
      id: request.id,
      title: request.title,
      description: request.description,
      status: request.status,
      createdAt: request.createdAt,
    },
    matches,
  };
}
