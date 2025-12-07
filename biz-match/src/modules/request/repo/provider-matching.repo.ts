// src/modules/request/repo/provider-matching.repo.ts
import { prisma } from "@/lib/prisma";

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
