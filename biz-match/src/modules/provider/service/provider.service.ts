// src/modules/provider/service/provider.service.ts
"use server";

import type {
  BusinessProfileInput,
  CreateServiceInput,
  BusinessProfileUpdateInput,
} from "../domain/provider.types";
import {
  getBusinessById,
  updateBusinessProfile,
  createProviderService,
  listProviderServicesForBusiness,
  markBusinessAsProvider,
} from "../repo/provider.repo";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";

export async function getMyBusiness() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getBusinessById(user.businessId);
}

export async function updateMyBusinessProfile(
  input: BusinessProfileUpdateInput,
) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const cleaned: BusinessProfileInput = {
    // name is required in BusinessProfileInput, so we always supply it
    name: input.name ?? user.business.name,

    // undefined => keep existing, null => set null
    logoUrl:
      input.logoUrl !== undefined
        ? input.logoUrl
        : (user.business.logoUrl ?? undefined),

    locationCity:
      input.locationCity !== undefined
        ? input.locationCity
        : (user.business.locationCity ?? undefined),

    locationCountry:
      input.locationCountry !== undefined
        ? input.locationCountry
        : (user.business.locationCountry ?? undefined),

    website:
      input.website !== undefined
        ? input.website
        : (user.business.website ?? undefined),

    bio: input.bio !== undefined ? input.bio : (user.business.bio ?? undefined),

    isBuyer:
      input.isBuyer !== undefined ? input.isBuyer : user.business.isBuyer,

    isProvider:
      input.isProvider !== undefined
        ? input.isProvider
        : user.business.isProvider,
  };

  return updateBusinessProfile(user.businessId, cleaned);
}
export async function createServiceForMyBusiness(input: CreateServiceInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  return createProviderService(user.businessId, input);
}

export async function listMyServices() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  return listProviderServicesForBusiness(user.businessId);
}
export type ProviderPublicService = {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string | null;
  skills: string[];
  minBudget: number | null;
  maxBudget: number | null;
};
export type ProviderPublicBusiness = {
  id: string;
  name: string;
  bio?: string | null;
  logoUrl?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  avgRating?: number | null;
  ratingCount?: number | null;
  verified?: boolean | null;
  [key: string]: unknown;
};

export type ProviderPublicProfile = {
  business: ProviderPublicBusiness;
  services: ProviderPublicService[];
};

export async function getProviderPublicProfile(
  businessId: string,
): Promise<ProviderPublicProfile | null> {
  const business = (await getBusinessById(
    businessId,
  )) as ProviderPublicBusiness | null;
  if (!business || !business.isProvider) return null;

  const services = (await listProviderServicesForBusiness(
    businessId,
  )) as ProviderPublicService[];

  return { business, services };
}

export async function createMyService(input: CreateServiceInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  // Ensure this business is marked as a provider
  await markBusinessAsProvider(user.businessId);

  // Then create the service itself
  return createProviderService(user.businessId, input);
}
export async function becomeProvider() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  await markBusinessAsProvider(user.businessId);
}
