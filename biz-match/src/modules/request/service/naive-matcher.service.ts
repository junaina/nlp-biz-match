// src/modules/request/service/naive-matcher.service.ts
import type { ProviderService, Business } from "@prisma/client";
import type { MatchResult } from "../domain/request.types";

type ServiceWithBusiness = ProviderService & { business: Business };

export function naiveScoreServices(
  services: ServiceWithBusiness[],
  brief: string
): MatchResult[] {
  const promptTokens = tokenize(brief);

  const results: MatchResult[] = services.map((service) => {
    const combined = [
      service.title,
      service.description,
      service.category,
      service.industry ?? "",
      ...(service.skills ?? []),
    ].join(" ");

    const serviceTokens = tokenize(combined);
    const overlap = promptTokens.filter((t) => serviceTokens.includes(t));
    const score = overlap.length;

    const why =
      overlap.length > 0
        ? `Matches on: ${overlap.slice(0, 5).join(", ")}`
        : "General capability match based on service description.";

    return {
      serviceId: service.id,
      businessId: service.businessId,
      businessName: service.business.name,
      serviceTitle: service.title,
      category: service.category,
      industry: service.industry ?? null,
      score,
      why,
    };
  });

  return results
    .filter((m) => m.score > 0) // hide totally irrelevant services
    .sort((a, b) => b.score - a.score);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
