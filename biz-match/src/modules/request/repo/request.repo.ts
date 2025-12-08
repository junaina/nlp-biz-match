// src/modules/request/repo/request.repo.ts
import { prisma } from "@/lib/prisma";
import type { RequestStatus } from "@prisma/client";
import type { RequestSummary } from "../domain/request.types";

type CreateRequestInput = {
  title: string;
  description: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  industry?: string | null;
  timeline?: string | null;
  status?: RequestStatus;
};

export async function createRequestForBusiness(
  businessId: string,
  input: CreateRequestInput
) {
  return prisma.request.create({
    data: {
      businessId,
      title: input.title,
      description: input.description,
      budgetMin: input.budgetMin ?? null,
      budgetMax: input.budgetMax ?? null,
      industry: input.industry ?? null,
      timeline: input.timeline ?? null,
      status: input.status ?? "MATCHING",
    },
  });
}

export async function getRequestSummary(
  requestId: string
): Promise<RequestSummary | null> {
  const r = await prisma.request.findUnique({ where: { id: requestId } });
  if (!r) return null;

  return {
    id: r.id,
    title: r.title,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt,
  };
}
