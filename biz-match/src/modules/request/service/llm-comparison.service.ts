// src/modules/request/service/llm-comparison.service.ts
import type { Request } from "@prisma/client";
import { groq } from "@/lib/groq";
import type {
  ComparedService,
  ComparisonRecommendation,
} from "../domain/comparison.domain";
import type { ServiceWithBusiness } from "../repo/provider-matching.repo";

type LlmServiceComparison = {
  serviceId: string;
  credibilityScore?: number | null; // 0–100
  pricingComment?: string | null;
  projectsExperience?: string | null;
  successLikelihood?: number | null; // 0–100
  responseSpeed?: string | null;
  skillsHighlights?: string[];
  specialisationHighlights?: string[];
  communicationHighlights?: string[];
};

type LlmComparisonResponse = {
  services: LlmServiceComparison[];
  recommendation: ComparisonRecommendation;
};

export type LlmComparisonResult = {
  services: ComparedService[];
  recommendation: ComparisonRecommendation;
};

/**
 * Build the base ComparedService objects using only DB data
 * (no LLM fields filled yet).
 */
function buildBaselineComparedServices(
  services: ServiceWithBusiness[]
): ComparedService[] {
  return services.map((svc) => ({
    serviceId: svc.id,
    businessId: svc.businessId,
    businessName: svc.business.name,
    businessLogoUrl: svc.business.logoUrl ?? null,
    locationCity: svc.business.locationCity ?? null,
    locationCountry: svc.business.locationCountry ?? null,

    serviceTitle: svc.title,
    category: svc.category,
    industry: svc.industry ?? null,

    ratingValue: svc.business.avgRating ?? null,
    ratingCount: svc.business.ratingCount ?? 0,
    minBudget: svc.minBudget ?? null,
    maxBudget: svc.maxBudget ?? null,
    skills: svc.skills,

    // LLM-estimated fields (start empty)
    credibilityScore: null,
    pricingComment: null,
    projectsExperience: null,
    successLikelihood: null,
    responseSpeed: null,
    skillsHighlights: [],
    specialisationHighlights: [],
    communicationHighlights: [],
  }));
}

function rateLimitFallbackReason(): string {
  return (
    "The AI comparison is temporarily unavailable due to rate limiting. " +
    "You can still use the table above to compare providers manually."
  );
}

/**
 * Call Groq to enrich the baseline services with comparison metrics.
 * If anything goes wrong (including 429 rate limit), we fall back to baseline.
 */
export async function buildComparisonUsingGroq(
  request: Request,
  services: ServiceWithBusiness[]
): Promise<LlmComparisonResult> {
  const baseline = buildBaselineComparedServices(services);

  // If there is no key, just return baseline + a generic note.
  if (!process.env.GROQ_API_KEY) {
    return {
      services: baseline,
      recommendation: {
        recommendedServiceId: null,
        reason:
          "LLM comparison is disabled (no GROQ_API_KEY configured). " +
          "Please choose based on the table above.",
      },
    };
  }

  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  const payload = {
    request: {
      title: request.title,
      description: request.description,
      budgetMin: request.budgetMin,
      budgetMax: request.budgetMax,
      industry: request.industry,
      timeline: request.timeline,
    },
    services: services.map((s) => ({
      id: s.id,
      businessName: s.business.name,
      locationCity: s.business.locationCity,
      locationCountry: s.business.locationCountry,
      avgRating: s.business.avgRating,
      ratingCount: s.business.ratingCount,
      title: s.title,
      description: s.description,
      category: s.category,
      industry: s.industry,
      minBudget: s.minBudget,
      maxBudget: s.maxBudget,
      skills: s.skills,
    })),
  };

  let content: string | null = null;

  try {
    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: [
            "You are an assistant that compares B2B service providers for a specific buyer brief.",
            "",
            "You receive:",
            "- the buyer request (title, description, budget, industry, timeline)",
            "- a list of provider services with details (businessName, location, rating, ratingCount, title, description, category, industry, skills, minBudget, maxBudget).",
            "",
            "Your job is to estimate relative suitability for this project on several axes:",
            "- credibilityScore (0–100): expertise & trustworthiness for THIS brief (text-based heuristic).",
            "- pricingComment: how well their budget range aligns with the brief.",
            "- projectsExperience: short sentence about how their past work / description aligns.",
            "- successLikelihood (0–100): how likely they are to deliver a good outcome.",
            "- responseSpeed: qualitative guess like 'very fast', 'normal', etc.",
            "- skillsHighlights: up to 5 key skills that matter for this brief.",
            "- specialisationHighlights: up to 5 industries / niches they seem strong in.",
            "- communicationHighlights: up to 5 phrases about comms style / collaboration.",
            "",
            "These are heuristics based ONLY on the text provided, not real-world data.",
            "Do not invent exact numbers of completed projects or real KPIs.",
            "",
            "Also choose ONE recommended provider for this request and explain why.",
            "",
            "Return STRICT JSON in this exact shape:",
            "{",
            '  "services": [',
            "    {",
            '      "serviceId": string,',
            '      "credibilityScore": number,',
            '      "pricingComment": string,',
            '      "projectsExperience": string,',
            '      "successLikelihood": number,',
            '      "responseSpeed": string,',
            '      "skillsHighlights": string[],',
            '      "specialisationHighlights": string[],',
            '      "communicationHighlights": string[]',
            "    },",
            "    ...",
            "  ],",
            '  "recommendation": {',
            '    "recommendedServiceId": string | null,',
            '    "reason": string',
            "  }",
            "}",
          ].join("\n"),
        },
        {
          role: "user",
          content: JSON.stringify(payload),
        },
      ],
    });

    content = completion.choices[0]?.message?.content ?? null;
  } catch (err: any) {
    console.error("Groq comparison error:", err);

    const maybeStatus = err?.status ?? err?.response?.status;
    if (maybeStatus === 429) {
      return {
        services: baseline,
        recommendation: {
          recommendedServiceId: null,
          reason: rateLimitFallbackReason(),
        },
      };
    }

    return {
      services: baseline,
      recommendation: {
        recommendedServiceId: null,
        reason:
          "The AI comparison is temporarily unavailable. " +
          "Please compare providers manually.",
      },
    };
  }

  if (!content) {
    return {
      services: baseline,
      recommendation: {
        recommendedServiceId: null,
        reason:
          "The AI comparison did not return a usable response. " +
          "Please compare providers manually.",
      },
    };
  }

  let parsed: LlmComparisonResponse;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error("Failed to parse Groq comparison JSON:", err, content);
    return {
      services: baseline,
      recommendation: {
        recommendedServiceId: null,
        reason:
          "The AI comparison response could not be parsed. " +
          "Please compare providers manually.",
      },
    };
  }

  const baselineById = new Map<string, ComparedService>(
    baseline.map((b) => [b.serviceId, b])
  );

  // Merge LLM metrics into the baseline objects.
  const merged: ComparedService[] = parsed.services
    .filter((s) => baselineById.has(s.serviceId))
    .map((s) => {
      const base = baselineById.get(s.serviceId)!;
      return {
        ...base,
        credibilityScore:
          s.credibilityScore != null
            ? s.credibilityScore
            : base.credibilityScore,
        pricingComment: s.pricingComment ?? base.pricingComment,
        projectsExperience: s.projectsExperience ?? base.projectsExperience,
        successLikelihood:
          s.successLikelihood != null
            ? s.successLikelihood
            : base.successLikelihood,
        responseSpeed: s.responseSpeed ?? base.responseSpeed,
        skillsHighlights: s.skillsHighlights ?? base.skillsHighlights,
        specialisationHighlights:
          s.specialisationHighlights ?? base.specialisationHighlights,
        communicationHighlights:
          s.communicationHighlights ?? base.communicationHighlights,
      };
    });

  // Ensure services not mentioned by the LLM still appear.
  const missing = baseline.filter(
    (b) => !merged.find((m) => m.serviceId === b.serviceId)
  );
  const allServices = [...merged, ...missing];

  return {
    services: allServices,
    recommendation: parsed.recommendation,
  };
}
