// src/modules/provider/repo/provider.repo.ts
import { prisma } from "@/lib/prisma";
import type {
  BusinessProfileInput,
  CreateServiceInput,
} from "../domain/provider.types";

export function getBusinessById(businessId: string) {
  return prisma.business.findUnique({
    where: { id: businessId },
    include: {
      providerServices: true,
      portfolioItems: true,
    },
  });
}

export function updateBusinessProfile(
  businessId: string,
  data: BusinessProfileInput
) {
  return prisma.business.update({
    where: { id: businessId },
    data,
  });
}

export function createProviderService(
  businessId: string,
  data: CreateServiceInput
) {
  return prisma.providerService.create({
    data: {
      businessId,
      title: data.title,
      description: data.description,
      category: data.category,
      industry: data.industry ?? null,
      skills: data.skills,
      minBudget: data.minBudget ?? null,
      maxBudget: data.maxBudget ?? null,
      // embedding will be filled later
    },
  });
}

export function listProviderServicesForBusiness(businessId: string) {
  return prisma.providerService.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}
