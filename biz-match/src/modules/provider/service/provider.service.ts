// src/modules/provider/service/provider.service.ts
"use server";

import type {
  BusinessProfileInput,
  CreateServiceInput,
} from "../domain/provider.types";
import {
  getBusinessById,
  updateBusinessProfile,
  createProviderService,
  listProviderServicesForBusiness,
} from "../repo/provider.repo";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";

export async function getMyBusiness() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getBusinessById(user.businessId);
}

export async function updateMyBusinessProfile(input: BusinessProfileInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const cleaned: BusinessProfileInput = {
    name: input.name ?? user.business.name,
    logoUrl: input.logoUrl ?? user.business.logoUrl ?? undefined,
    locationCity: input.locationCity ?? user.business.locationCity ?? undefined,
    locationCountry:
      input.locationCountry ?? user.business.locationCountry ?? undefined,
    website: input.website ?? user.business.website ?? undefined,
    bio: input.bio ?? user.business.bio ?? undefined,
    isBuyer: input.isBuyer ?? user.business.isBuyer,
    isProvider: input.isProvider ?? user.business.isProvider,
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
export async function getProviderPublicProfile(businessId: string) {
  const business = await getBusinessById(businessId);
  if (!business || !business.isProvider) return null;

  const services = await listProviderServicesForBusiness(businessId);

  return { business, services };
}
