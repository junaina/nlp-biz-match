import { describe, it, expect } from "vitest";
import { buildComparisonUsingGroq } from "@/modules/request/service/llm-comparison.service";

describe("buildComparisonUsingGroq", () => {
  const baseRequest = {
    id: "req1",
    title: "Need NLP app",
    description: "We want to build an AI-powered text analysis tool.",
    budgetMin: null,
    budgetMax: null,
    industry: "Software",
    timeline: "Q4",
  } as any;

  const services = [
    {
      id: "svc1",
      businessId: "biz1",
      business: {
        id: "biz1",
        name: "AI Studio",
        logoUrl: null,
        locationCity: "London",
        locationCountry: "UK",
        avgRating: 4.7,
        ratingCount: 10,
        verified: true,
      },
      title: "NLP Platform Development",
      description: "We build NLP platforms.",
      category: "AI",
      industry: "Software",
      minBudget: 10000,
      maxBudget: 50000,
      skills: ["nlp", "python"],
    },
  ] as any[];

  it("returns baseline comparison when GROQ_API_KEY is not set", async () => {
    const prevKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const result = await buildComparisonUsingGroq(baseRequest, services);

    expect(result.services).toHaveLength(1);
    expect(result.services[0]).toMatchObject({
      serviceId: "svc1",
      businessId: "biz1",
      businessName: "AI Studio",
    });
    expect(result.recommendation.reason).toContain(
      "LLM comparison is disabled"
    );

    if (prevKey !== undefined) {
      process.env.GROQ_API_KEY = prevKey;
    }
  });
});
