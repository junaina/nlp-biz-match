// src/modules/request/service/llm-matcher.service.ts
import type { ProviderService, Business } from "@prisma/client";
import { groq } from "@/lib/groq";
import { naiveScoreServices } from "./naive-matcher.service";
import type { MatchResult } from "../domain/request.types";

type ServiceWithBusiness = ProviderService & { business: Business };

type LlmMatch = {
  serviceId: string;
  score: number; // 0-100
  why: string;
};

export async function scoreServicesWithGroq(
  services: ServiceWithBusiness[],
  brief: string
): Promise<MatchResult[]> {
  // If no key, fall back immediately
  if (!process.env.GROQ_API_KEY) {
    return naiveScoreServices(services, brief);
  }

  const serviceSummaries = services.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    category: s.category,
    industry: s.industry,
    skills: s.skills,
    businessName: s.business.name,
  }));

  const model = process.env.GROQ_MODEL ?? "llama-3.1-8b-instant";

  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: [
          "You are a B2B services matching engine.",
          "You receive:",
          " - a buyer brief describing what they want",
          " - a list of provider services (id, title, description, category, industry, skills, businessName)",
          "",
          "Your job is to judge **relevance only**.",
          "",
          "Scoring rules (very important):",
          "- 90–100: Extremely strong match. The service directly and clearly offers exactly what the brief describes.",
          "- 70–89: Good match. Service obviously can deliver what the brief needs.",
          "- 40–69: Weak or partial match. Some overlap, but not a good fit.",
          "- 0–39: Not a real match. Different domain, industry, or needs.",
          "",
          "If the brief is clearly about something unrelated to the service (for example: brief about food/catering/restaurant, but service is software development or design) you MUST give a score <= 10 and explain that it is not relevant.",
          "",
          "It is **allowed** (and encouraged) for all services to be low-score (<= 39) if none are good fits.",
          "",
          "For EACH service, give:",
          "  - serviceId: the id you were given",
          "  - score: integer 0-100 using the rules above",
          "  - why: 1 short sentence explaining why it matches or why it does not.",
          "",
          "Return STRICT JSON in this shape:",
          '{ "matches": [ { "serviceId": string, "score": number, "why": string }, ... ] }',
          "Do not include any extra keys or commentary.",
        ].join("\n"),
      },

      {
        role: "user",
        content: JSON.stringify({
          brief,
          services: serviceSummaries,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    console.warn("Groq returned no content, falling back to naive matcher");
    return naiveScoreServices(services, brief);
  }

  let parsed: { matches: LlmMatch[] };
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error(
      "Failed to parse Groq JSON, falling back to naive matcher",
      err,
      content
    );
    return naiveScoreServices(services, brief);
  }

  const byId = new Map(services.map((s) => [s.id, s]));

  const results: MatchResult[] = parsed.matches
    .filter((m) => byId.has(m.serviceId))
    .map((m) => {
      const svc = byId.get(m.serviceId)!;
      const biz = svc.business;
      return {
        serviceId: svc.id,
        businessId: svc.businessId,
        businessName: svc.business.name,
        serviceTitle: svc.title,
        category: svc.category,
        industry: svc.industry ?? null,
        score: m.score,
        why: m.why,
        // NEW: card/filter data
        ratingValue: biz.avgRating ?? null,
        ratingCount: biz.ratingCount ?? 0,
        isVerified: biz.verified,
        locationCity: biz.locationCity ?? null,
        locationCountry: biz.locationCountry ?? null,
        minBudget: svc.minBudget ?? null,
        maxBudget: svc.maxBudget ?? null,
        skills: svc.skills ?? [],
      };
    });

  return results
    .filter((m) => m.score >= 70) // tweak threshold if needed
    .sort((a, b) => b.score - a.score);
}
