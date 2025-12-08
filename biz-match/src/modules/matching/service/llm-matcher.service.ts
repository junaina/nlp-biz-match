// src/modules/matching/service/llm-matcher.service.ts
import { groq } from "@/src/lib/groq";
import type { ProviderService, Business } from "@prisma/client";
import { naiveScoreServices } from "./naive-matcher.service"; // your existing function
import type { MatchResult } from "../domain/types";

type ServiceWithBusiness = ProviderService & { business: Business };

type LlmMatch = {
  serviceId: string;
  score: number; // 0–100
  why: string;
};

export async function scoreServicesWithGroq(
  services: ServiceWithBusiness[],
  brief: string
): Promise<MatchResult[]> {
  // Fallback if no key configured
  if (!process.env.GROQ_API_KEY) {
    return naiveScoreServices(services, brief);
  }

  // Build a compact summary list to send to the model
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
    response_format: { type: "json_object" }, // ask for strict JSON
    messages: [
      {
        role: "system",
        content: [
          "You are a B2B services matching engine.",
          "You receive:",
          " - a buyer brief describing what they want",
          " - a list of provider services (id, title, description, category, industry, skills, businessName)",
          "",
          "For EACH service, give:",
          "  - serviceId: the id you were given",
          "  - score: integer 0-100 (80+ = excellent, 60-79 = good, 40-59 = maybe, <40 = poor)",
          "  - why: 1 short sentence explaining why it matches or not, referring to skills/industry/description.",
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
      return {
        serviceId: svc.id,
        businessId: svc.businessId,
        businessName: svc.business.name,
        serviceTitle: svc.title,
        category: svc.category,
        industry: svc.industry ?? null,
        score: m.score,
        why: m.why,
      };
    });

  // Filter low scores and sort descending
  return results
    .filter((m) => m.score >= 40) // tweak threshold as you like
    .sort((a, b) => b.score - a.score);
}
