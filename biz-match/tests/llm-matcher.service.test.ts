import { describe, it, expect } from "vitest";
import { scoreServicesWithGroq } from "@/modules/request/service/llm-matcher.service";
import { naiveScoreServices } from "@/modules/request/service/naive-matcher.service";

describe("scoreServicesWithGroq", () => {
  const services = [
    {
      id: "svc1",
      title: "NLP platform",
      description: "We build NLP platforms and chatbots",
      category: "AI",
      industry: "Software",
      skills: ["nlp"],
      minBudget: null,
      maxBudget: null,
      business: {
        id: "biz1",
        name: "AI Studio",
        avgRating: 4.7,
        ratingCount: 12,
        verified: true,
        locationCity: "London",
        locationCountry: "UK",
      },
    },
  ] as any[];

  it("falls back to naiveScoreServices when GROQ_API_KEY is not set", async () => {
    const prevKey = process.env.GROQ_API_KEY;
    delete process.env.GROQ_API_KEY;

    const brief = "Need NLP experts";
    const naive = naiveScoreServices(services as any, brief);
    const result = await scoreServicesWithGroq(services as any, brief);

    expect(result).toEqual(naive);

    if (prevKey !== undefined) {
      process.env.GROQ_API_KEY = prevKey;
    }
  });
});
