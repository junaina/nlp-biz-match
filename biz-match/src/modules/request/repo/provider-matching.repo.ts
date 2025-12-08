// src/modules/request/repo/provider-matching.repo.ts
import { prisma } from "@/lib/prisma";
import type { ProviderService, Business } from "@prisma/client";
export type ServiceWithBusiness = ProviderService & { business: Business };

export async function listAllProviderServicesForMatching() {
  return prisma.providerService.findMany({
    where: {
      business: {
        isProvider: true,
      },
    },
    include: {
      business: true,
    },
  });
}
export async function getServicesForComparison(
  serviceIds: string[]
): Promise<ServiceWithBusiness[]> {
  if (!serviceIds.length) return [];

  return prisma.providerService.findMany({
    where: { id: { in: serviceIds } },
    include: {
      business: true,
    },
  });
}
