// src/modules/request/repo/shortlist.repo.ts
import { prisma } from "@/lib/prisma";

export async function createShortlistItem(params: {
  requestId: string;
  buyerBusinessId: string;
  providerBusinessId: string;
  providerServiceId: string;
}) {
  const { requestId, buyerBusinessId, providerBusinessId, providerServiceId } =
    params;

  // thanks to the unique constraint, upsert avoids duplicates
  return prisma.shortlistItem.upsert({
    where: {
      requestId_providerServiceId: {
        requestId,
        providerServiceId,
      },
    },
    update: {
      buyerBusinessId,
      providerBusinessId,
    },
    create: {
      requestId,
      buyerBusinessId,
      providerBusinessId,
      providerServiceId,
    },
  });
}

export async function deleteShortlistItem(params: {
  requestId: string;
  providerServiceId: string;
}) {
  const { requestId, providerServiceId } = params;

  // deleteIfExists pattern: we don't care if it wasn't there
  await prisma.shortlistItem
    .delete({
      where: {
        requestId_providerServiceId: {
          requestId,
          providerServiceId,
        },
      },
    })
    .catch(() => {});
}

export async function getShortlistForRequest(params: {
  requestId: string;
  buyerBusinessId: string;
}) {
  const { requestId, buyerBusinessId } = params;

  return prisma.shortlistItem.findMany({
    where: {
      requestId,
      buyerBusinessId,
    },
    include: {
      providerService: {
        include: {
          business: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
