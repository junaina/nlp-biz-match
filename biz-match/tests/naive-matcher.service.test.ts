import { describe, it, expect } from "vitest";
import { naiveScoreServices } from "@/modules/request/service/naive-matcher.service";

describe("naiveScoreServices", () => {
  const business = { id: "biz1", name: "AI Agency" } as any;

  const services = [
    {
      id: "svc-strong",
      businessId: "biz1",
      title: "Custom NLP model development",
      description: "We build custom AI and NLP models",
      category: "AI",
      industry: "Software",
      skills: ["nlp", "machine learning", "python"],
      business,
    },
    {
      id: "svc-weak",
      businessId: "biz1",
      title: "Logo design",
      description: "Branding and visual identity",
      category: "Design",
      industry: "Marketing",
      skills: ["illustrator"],
      business,
    },
  ] as any[];

  it("gives higher score to more relevant service", () => {
    const brief = "Need NLP and machine learning experts for custom AI model";

    const results = naiveScoreServices(services, brief);

    // Strong one should be first
    expect(results[0].serviceId).toBe("svc-strong");

    const strong = results.find((r) => r.serviceId === "svc-strong")!;
    const weak = results.find((r) => r.serviceId === "svc-weak")!;

    // Strong service must have a strictly higher score
    expect(strong.score).toBeGreaterThan(weak.score);
  });

  it("returns empty list when nothing matches", () => {
    const brief = "Looking for restaurant catering";

    const results = naiveScoreServices(services, brief);

    expect(results).toHaveLength(0);
  });
});
