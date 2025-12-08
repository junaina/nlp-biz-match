// src/modules/request/service/comparison.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import type { ComparisonResult } from "../domain/comparison.domain";
import { getServicesForComparison } from "../repo/provider-matching.repo";
import { buildComparisonUsingGroq } from "./llm-comparison.service";

/**
 * Core server-side entrypoint: given a request and a set of service IDs,
 * validate access and return a structured comparison.
 */
export async function compareShortlistedServices(
  requestId: string,
  serviceIds: string[]
): Promise<ComparisonResult> {
  if (!serviceIds.length) {
    throw new Error("At least one service id is required");
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthenticated");
  }

  // 1) Load request and ensure it belongs to this buyer.
  const request = await prisma.request.findUnique({
    where: { id: requestId },
    include: {
      business: true,
    },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.businessId !== currentUser.businessId) {
    throw new Error("You are not allowed to view this request");
  }

  // 2) Ensure all serviceIds are actually shortlisted for this request+buyer.
  const shortlistItems = await prisma.shortlistItem.findMany({
    where: {
      requestId,
      buyerBusinessId: currentUser.businessId,
      providerServiceId: { in: serviceIds },
    },
    select: {
      providerServiceId: true,
    },
  });

  const shortlistedIds = new Set(
    shortlistItems.map((i) => i.providerServiceId)
  );
  const notShortlisted = serviceIds.filter((id) => !shortlistedIds.has(id));
  if (notShortlisted.length > 0) {
    throw new Error(
      "You can only compare services that are shortlisted for this request"
    );
  }

  // 3) Load the services with their business data.
  const services = await getServicesForComparison(serviceIds);

  if (services.length < 2) {
    throw new Error(
      "Please select at least two shortlisted services to compare"
    );
  }

  // 4) Delegate to the LLM helper.
  const llmResult = await buildComparisonUsingGroq(request, services);

  return {
    requestId: request.id,
    requestTitle: request.title,
    requestDescription: request.description,
    shortlistedCount: shortlistItems.length,
    services: llmResult.services,
    recommendation: llmResult.recommendation,
  };
}
