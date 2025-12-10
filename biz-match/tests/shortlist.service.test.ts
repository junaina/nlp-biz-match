import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    request: { findUnique: vi.fn() },
    providerService: { findUnique: vi.fn() },
    shortlistItem: { findUniqueOrThrow: vi.fn() },
  },
}));

vi.mock("@/modules/auth/service/current-user.service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/modules/request/repo/shortlist.repo", () => ({
  createShortlistItem: vi.fn(),
  deleteShortlistItem: vi.fn(),
  getShortlistForRequest: vi.fn(),
}));

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import {
  createShortlistItem,
  deleteShortlistItem,
  getShortlistForRequest,
} from "@/modules/request/repo/shortlist.repo";
import {
  addToShortlist,
  removeFromShortlist,
  listShortlistForRequest,
} from "@/modules/request/service/shortlist.service";

const mockPrisma = prisma as unknown as {
  request: { findUnique: vi.Mock };
  providerService: { findUnique: vi.Mock };
  shortlistItem: { findUniqueOrThrow: vi.Mock };
};

const mockGetCurrentUser = getCurrentUser as unknown as vi.Mock;
const mockCreateShortlistItem = createShortlistItem as unknown as vi.Mock;
const mockDeleteShortlistItem = deleteShortlistItem as unknown as vi.Mock;
const mockGetShortlistForRequest = getShortlistForRequest as unknown as vi.Mock;

describe("shortlist.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function setupOwner() {
    mockGetCurrentUser.mockResolvedValue({
      id: "user1",
      businessId: "biz1",
    });

    mockPrisma.request.findUnique.mockResolvedValue({
      id: "req1",
      businessId: "biz1",
    });
  }

  it("removeFromShortlist deletes item when user owns the request", async () => {
    setupOwner();

    await removeFromShortlist("req1", "svc1");

    expect(mockDeleteShortlistItem).toHaveBeenCalledWith({
      requestId: "req1",
      providerServiceId: "svc1",
    });
  });

  it("addToShortlist creates and returns DTO", async () => {
    setupOwner();

    mockPrisma.providerService.findUnique.mockResolvedValue({
      id: "svc1",
      businessId: "biz2",
    });

    mockCreateShortlistItem.mockResolvedValue({
      id: "short1",
    });

    const dbShortlistRow = {
      id: "short1",
      requestId: "req1",
      providerServiceId: "svc1",
      providerBusinessId: "biz2",
      providerService: {
        title: "NLP Dev",
        category: "AI",
        industry: "Software",
        business: { name: "AI Studio" },
      },
      createdAt: new Date("2024-01-01"),
    };

    mockPrisma.shortlistItem.findUniqueOrThrow.mockResolvedValue(
      dbShortlistRow
    );

    const dto = await addToShortlist("req1", "svc1");

    expect(dto).toMatchObject({
      id: "short1",
      requestId: "req1",
      providerServiceId: "svc1",
      providerBusinessId: "biz2",
      providerBusinessName: "AI Studio",
      serviceTitle: "NLP Dev",
      category: "AI",
      industry: "Software",
    });
  });

  it("listShortlistForRequest maps items to DTOs", async () => {
    setupOwner();

    const row = {
      id: "short1",
      requestId: "req1",
      providerServiceId: "svc1",
      providerBusinessId: "biz2",
      providerService: {
        title: "NLP Dev",
        category: "AI",
        industry: "Software",
        business: { name: "AI Studio" },
      },
      createdAt: new Date("2024-01-01"),
    };

    mockGetShortlistForRequest.mockResolvedValue([row]);

    const result = await listShortlistForRequest("req1");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "short1",
      providerBusinessName: "AI Studio",
      serviceTitle: "NLP Dev",
    });
  });
});
