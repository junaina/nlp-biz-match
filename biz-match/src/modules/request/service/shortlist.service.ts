// src/modules/request/service/shortlist.service.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import {
  createShortlistItem,
  deleteShortlistItem,
  getShortlistForRequest,
} from "../repo/shortlist.repo";

export type ShortlistItemDto = {
  id: string;
  requestId: string;
  providerServiceId: string;
  providerBusinessId: string;
  providerBusinessName: string;
  serviceTitle: string;
  category: string;
  industry: string | null;
  createdAt: Date;
};

function mapToDto(
  item: Awaited<ReturnType<typeof getShortlistForRequest>>[0]
): ShortlistItemDto {
  return {
    id: item.id,
    requestId: item.requestId,
    providerServiceId: item.providerServiceId,
    providerBusinessId: item.providerBusinessId,
    providerBusinessName: item.providerService.business.name,
    serviceTitle: item.providerService.title,
    category: item.providerService.category,
    industry: item.providerService.industry ?? null,
    createdAt: item.createdAt,
  };
}

async function assertRequestBelongsToCurrentBuyer(requestId: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthenticated");

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, businessId: true },
  });

  if (!request) {
    throw new Error("Request not found");
  }

  if (request.businessId !== currentUser.businessId) {
    throw new Error("Not allowed to modify this request");
  }

  return { currentUser, request };
}

export async function addToShortlist(
  requestId: string,
  providerServiceId: string
): Promise<ShortlistItemDto> {
  const { currentUser } = await assertRequestBelongsToCurrentBuyer(requestId);

  const service = await prisma.providerService.findUnique({
    where: { id: providerServiceId },
    select: { id: true, businessId: true },
  });

  if (!service) throw new Error("Provider service not found");

  const item = await createShortlistItem({
    requestId,
    buyerBusinessId: currentUser.businessId,
    providerBusinessId: service.businessId,
    providerServiceId,
  });

  const enriched = await prisma.shortlistItem.findUniqueOrThrow({
    where: { id: item.id },
    include: {
      providerService: {
        include: { business: true },
      },
    },
  });

  return mapToDto(enriched);
}

export async function removeFromShortlist(
  requestId: string,
  providerServiceId: string
): Promise<void> {
  await assertRequestBelongsToCurrentBuyer(requestId);
  await deleteShortlistItem({ requestId, providerServiceId });
}

export async function listShortlistForRequest(
  requestId: string
): Promise<ShortlistItemDto[]> {
  const { currentUser } = await assertRequestBelongsToCurrentBuyer(requestId);

  const items = await getShortlistForRequest({
    requestId,
    buyerBusinessId: currentUser.businessId,
  });

  return items.map(mapToDto);
}
