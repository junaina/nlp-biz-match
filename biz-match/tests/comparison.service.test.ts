import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: { findUnique: vi.fn() },
    shortlistItem: { findMany: vi.fn() },
  },
}));

vi.mock("@/modules/auth/service/current-user.service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/modules/request/repo/provider-matching.repo", () => ({
  getServicesForComparison: vi.fn(),
}));

vi.mock("@/modules/request/service/llm-comparison.service", () => ({
  buildComparisonUsingGroq: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import { getServicesForComparison } from "@/modules/request/repo/provider-matching.repo";
import { buildComparisonUsingGroq } from "@/modules/request/service/llm-comparison.service";
import { compareShortlistedServices } from "@/modules/request/service/comparison.service";

const mockPrisma = prisma as unknown as {
  request: { findUnique: vi.Mock };
  shortlistItem: { findMany: vi.Mock };
};

const mockGetCurrentUser = getCurrentUser as unknown as vi.Mock;
const mockGetServicesForComparison =
  getServicesForComparison as unknown as vi.Mock;
const mockBuildComparisonUsingGroq =
  buildComparisonUsingGroq as unknown as vi.Mock;

describe("compareShortlistedServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when no serviceIds are provided", async () => {
    await expect(compareShortlistedServices("req1", [])).rejects.toThrow(
      "At least one service id is required"
    );
  });

  it("returns comparison result when user owns the request", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user1",
      businessId: "biz1",
    });

    mockPrisma.request.findUnique.mockResolvedValue({
      id: "req1",
      businessId: "biz1",
      title: "Need NLP app",
      description: "Some description",
    });

    mockPrisma.shortlistItem.findMany.mockResolvedValue([
      { id: "short1", providerServiceId: "svc1" },
      { id: "short2", providerServiceId: "svc2" },
    ]);

    mockGetServicesForComparison.mockResolvedValue([
      { id: "svc1", businessId: "bizA", business: { name: "A" } },
      { id: "svc2", businessId: "bizB", business: { name: "B" } },
    ]);

    mockBuildComparisonUsingGroq.mockResolvedValue({
      services: [
        { serviceId: "svc1", businessId: "bizA", businessName: "A" },
        { serviceId: "svc2", businessId: "bizB", businessName: "B" },
      ],
      recommendation: {
        recommendedServiceId: "svc1",
        reason: "Best fit",
      },
    });

    const result = await compareShortlistedServices("req1", ["svc1", "svc2"]);

    expect(result.requestId).toBe("req1");
    expect(result.shortlistedCount).toBe(2);
    expect(result.services).toHaveLength(2);
    expect(result.recommendation.recommendedServiceId).toBe("svc1");
  });
});
