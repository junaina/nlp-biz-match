import { prisma } from "@/lib/prisma";
import { ProposalStatus, Prisma } from "@prisma/client";

export async function createProposal(data: Prisma.ProposalUncheckedCreateInput) {
  return prisma.proposal.create({
    data,
    include: {
      providerBusiness: true,
      buyerBusiness: true,
      providerService: true,
    }
  });
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      providerBusiness: true,
      buyerBusiness: true,
      request: true,
      providerService: true,
    }
  });
}

export async function listProposalsByRequest(requestId: string) {
  return prisma.proposal.findMany({
    where: { requestId },
    include: {
      providerBusiness: true,
      buyerBusiness: true,
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function listProposalsByProvider(providerBusinessId: string) {
  return prisma.proposal.findMany({
    where: { providerBusinessId },
    include: {
      buyerBusiness: true,
      request: true,
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateProposalStatus(id: string, status: ProposalStatus, rejectionReason?: string) {
  return prisma.proposal.update({
    where: { id },
    data: { status, rejectionReason, ...(status === 'ACCEPTED' ? { acceptedAt: new Date() } : {}) }
  });
}

export async function getProposalForShortlistItem(shortlistItemId: string) {
  return prisma.proposal.findUnique({
    where: { shortlistItemId }
  });
}
