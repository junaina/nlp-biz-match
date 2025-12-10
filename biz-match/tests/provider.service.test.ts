import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/modules/auth/service/current-user.service", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/modules/provider/repo/provider.repo", () => ({
  getBusinessById: vi.fn(),
  updateBusinessProfile: vi.fn(),
  createProviderService: vi.fn(),
  listProviderServicesForBusiness: vi.fn(),
  markBusinessAsProvider: vi.fn(),
}));

import {
  getMyBusiness,
  updateMyBusinessProfile,
  createMyService,
  becomeProvider,
} from "@/modules/provider/service/provider.service";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import {
  getBusinessById,
  updateBusinessProfile,
  createProviderService,
  markBusinessAsProvider,
} from "@/modules/provider/repo/provider.repo";

const mockGetCurrentUser = getCurrentUser as unknown as vi.Mock;
const mockGetBusinessById = getBusinessById as unknown as vi.Mock;
const mockUpdateBusinessProfile = updateBusinessProfile as unknown as vi.Mock;
const mockCreateProviderService = createProviderService as unknown as vi.Mock;
const mockMarkBusinessAsProvider = markBusinessAsProvider as unknown as vi.Mock;

describe("provider.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getMyBusiness returns null when user is not authenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const result = await getMyBusiness();

    expect(result).toBeNull();
    expect(mockGetBusinessById).not.toHaveBeenCalled();
  });

  it("updateMyBusinessProfile merges with existing business data", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user1",
      businessId: "biz1",
      business: {
        name: "Old Name",
        logoUrl: "old-logo.png",
        locationCity: "London",
        locationCountry: "UK",
        website: "https://old.com",
        bio: "Old bio",
        isBuyer: true,
        isProvider: false,
      },
    });

    mockUpdateBusinessProfile.mockResolvedValue({ id: "biz1" });

    await updateMyBusinessProfile({
      name: "New Name",
      // rest should be taken from existing business
    } as any);

    expect(mockUpdateBusinessProfile).toHaveBeenCalledWith("biz1", {
      name: "New Name",
      logoUrl: "old-logo.png",
      locationCity: "London",
      locationCountry: "UK",
      website: "https://old.com",
      bio: "Old bio",
      isBuyer: true,
      isProvider: false,
    });
  });

  it("createMyService marks business as provider then creates service", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "user1",
      businessId: "biz1",
    });

    mockCreateProviderService.mockResolvedValue({ id: "svc1" });

    const input = {
      title: "NLP consulting",
      category: "AI",
    } as any;

    const result = await createMyService(input);

    expect(mockMarkBusinessAsProvider).toHaveBeenCalledWith("biz1");
    expect(mockCreateProviderService).toHaveBeenCalledWith("biz1", input);
    expect(result).toEqual({ id: "svc1" });
  });

  it("becomeProvider throws when unauthenticated", async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    await expect(becomeProvider()).rejects.toThrow("Not authenticated");
  });
});
