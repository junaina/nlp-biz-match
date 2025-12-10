import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/modules/auth/service/current-user.service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/modules/request/repo/request.repo", () => ({
  createRequestForBusiness: vi.fn(),
}));

vi.mock("@/modules/request/repo/provider-matching.repo", () => ({
  listAllProviderServicesForMatching: vi.fn(),
}));

vi.mock("@/modules/request/service/llm-matcher.service", () => ({
  scoreServicesWithGroq: vi.fn(),
}));

import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import { createRequestForBusiness } from "@/modules/request/repo/request.repo";
import { listAllProviderServicesForMatching } from "@/modules/request/repo/provider-matching.repo";
import { scoreServicesWithGroq } from "@/modules/request/service/llm-matcher.service";
import { createRequestAndMatch } from "@/modules/request/service/request.service";

const mockGetCurrentUser = getCurrentUser as unknown as vi.Mock;
const mockCreateRequestForBusiness =
  createRequestForBusiness as unknown as vi.Mock;
const mockListAllProviderServicesForMatching =
  listAllProviderServicesForMatching as unknown as vi.Mock;
const mockScoreServicesWithGroq = scoreServicesWithGroq as unknown as vi.Mock;

describe("request.service - createRequestAndMatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when user is unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(
      createRequestAndMatch({
        description: "Some project",
      } as any)
    ).rejects.toThrow("Unauthenticated");
  });

  it("creates request and returns matches", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user1",
      businessId: "biz1",
    });

    mockCreateRequestForBusiness.mockResolvedValue({
      id: "req1",
      title: "My project",
      description: "Build an NLP system",
      status: "MATCHING",
      createdAt: new Date("2024-01-01"),
    });

    mockListAllProviderServicesForMatching.mockResolvedValue([
      { id: "svc1" },
      { id: "svc2" },
    ]);

    mockScoreServicesWithGroq.mockResolvedValue([
      { serviceId: "svc1", score: 90, why: "Great match" },
    ]);

    const result = await createRequestAndMatch({
      title: "My project",
      description: "Build an NLP system",
    });

    expect(mockCreateRequestForBusiness).toHaveBeenCalledWith("biz1", {
      title: "My project",
      description: "Build an NLP system",
      budgetMin: null,
      budgetMax: null,
      industry: null,
      timeline: null,
      status: "MATCHING",
    });

    expect(mockScoreServicesWithGroq).toHaveBeenCalled();
    expect(result.request.id).toBe("req1");
    expect(result.matches[0]).toMatchObject({
      serviceId: "svc1",
      score: 90,
    });
  });
});
