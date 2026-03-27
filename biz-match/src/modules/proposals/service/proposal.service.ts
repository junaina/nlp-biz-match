"use server";

import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import {
  createProposal,
  getProposalById,
  listProposalsByRequest,
  listProposalsByProvider,
  updateProposalStatus,
  getProposalForShortlistItem
} from "../repo/proposal.repo";
import { prisma } from "@/lib/prisma";
import type { CreateProposalInput } from "../domain/proposal.types";
import { createConversationForProposal, updateConversationStage } from "../repo/conversation.repo";
import { createMessage } from "../repo/message.repo";
import { MessageType, ProposalStatus, ConversationStage } from "@prisma/client";

// ─── Pure business logic (testable without "use server") ───────────────────

export async function submitProposalLogic(
  input: CreateProposalInput,
  userId: string,
  businessId: string
) {
  const shortlistItem = await prisma.shortlistItem.findUnique({
    where: { id: input.shortlistItemId }
  });
  if (!shortlistItem) throw new Error("Shortlist item not found");

  if (shortlistItem.buyerBusinessId !== businessId) {
    throw new Error("You can only send proposals for your own requests");
  }

  if (!input.coverLetter || input.coverLetter.length < 100) {
    throw new Error("Cover letter must be at least 100 characters");
  }

  if (!input.proposedBudget || input.proposedBudget <= 0) {
    throw new Error("Proposed budget must be greater than 0");
  }

  if (!input.kickoffMessage || input.kickoffMessage.length < 20) {
    throw new Error("Kickoff message must be at least 20 characters");
  }

  const proposal = await createProposal({
    shortlistItemId: input.shortlistItemId,
    requestId: shortlistItem.requestId,
    buyerBusinessId: businessId,
    providerBusinessId: shortlistItem.providerBusinessId,
    providerServiceId: shortlistItem.providerServiceId,
    coverLetter: input.coverLetter,
    proposedBudget: input.proposedBudget,
    timeline: input.timeline,
    deliverables: input.deliverables,
    termsAndConditions: input.termsAndConditions,
    attachmentUrls: input.attachmentUrls || [],
    status: ProposalStatus.PENDING
  });

  const conversation = await createConversationForProposal({
    proposalId: proposal.id,
    requestId: shortlistItem.requestId,
    buyerBusinessId: businessId,
    providerBusinessId: shortlistItem.providerBusinessId,
  });

  await createMessage({
    conversationId: conversation.id,
    senderBusinessId: businessId,
    content: input.kickoffMessage,
    type: MessageType.PROPOSAL_SUBMIT,
  });

  return proposal;
}

export async function getProposalDetailLogic(id: string, businessId: string) {
  const proposal = await getProposalById(id);
  if (!proposal) throw new Error("Proposal not found");

  const hasAccess =
    proposal.buyerBusinessId === businessId ||
    proposal.providerBusinessId === businessId;

  if (!hasAccess) throw new Error("Access denied");
  return proposal;
}

export async function getProposalForShortlistItemLogic(shortlistItemId: string, businessId: string) {
  const proposal = await getProposalForShortlistItem(shortlistItemId);
  if (proposal) {
     if (proposal.buyerBusinessId !== businessId && proposal.providerBusinessId !== businessId) {
        throw new Error("Access denied");
     }
  }
  return proposal;
}

export async function getMyProposalsLogic(requestId: string, businessId: string) {
  const proposals = await listProposalsByRequest(requestId);
  return proposals.filter(p => p.buyerBusinessId === businessId);
}

export async function getProposalsForMyServicesLogic(businessId: string) {
  return listProposalsByProvider(businessId);
}

export async function acceptProposalLogic(id: string, businessId: string) {
  const proposal = await getProposalById(id);
  if (!proposal) throw new Error("Proposal not found");

  if (proposal.buyerBusinessId !== businessId) {
    throw new Error("Only the buyer can accept the proposal");
  }

  const updated = await updateProposalStatus(id, ProposalStatus.ACCEPTED);

  const conversation = await prisma.conversation.findUnique({ where: { proposalId: id } });
  if (conversation) {
    await updateConversationStage(conversation.id, ConversationStage.HIRED);
    await createMessage({
      conversationId: conversation.id,
      content: "Proposal was accepted by the buyer. Project can now start.",
      type: MessageType.PROPOSAL_ACCEPTED,
    });
  }

  return updated;
}

export async function rejectProposalLogic(id: string, businessId: string, reason?: string) {
  const proposal = await getProposalById(id);
  if (!proposal) throw new Error("Proposal not found");

  if (proposal.providerBusinessId !== businessId) {
    throw new Error("Only the provider can reject the proposal");
  }

  const updated = await updateProposalStatus(id, ProposalStatus.REJECTED, reason);

  const conversation = await prisma.conversation.findUnique({ where: { proposalId: id } });
  if (conversation) {
    await updateConversationStage(conversation.id, ConversationStage.CANCELLED);
    await createMessage({
      conversationId: conversation.id,
      content: reason ? `Proposal was rejected by the provider: ${reason}` : "Proposal was rejected by the provider.",
      type: MessageType.PROPOSAL_REJECTED,
    });
  }

  return updated;
}

export async function withdrawProposalLogic(id: string, businessId: string) {
  const proposal = await getProposalById(id);
  if (!proposal) throw new Error("Proposal not found");

  if (proposal.buyerBusinessId !== businessId) {
    throw new Error("Only the buyer can withdraw the proposal");
  }

  return updateProposalStatus(id, ProposalStatus.WITHDRAWN);
}

// ─── Server Actions (thin wrappers that call the logic functions) ───────────

export async function submitProposal(input: CreateProposalInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return submitProposalLogic(input, user.id, user.businessId);
}

export async function getProposalDetail(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getProposalDetailLogic(id, user.businessId);
}

export async function getMyProposals(requestId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getMyProposalsLogic(requestId, user.businessId);
}

export async function getProposalsForMyServices() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getProposalsForMyServicesLogic(user.businessId);
}

export async function acceptProposal(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return acceptProposalLogic(id, user.businessId);
}

export async function rejectProposal(id: string, reason?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return rejectProposalLogic(id, user.businessId, reason);
}

export async function withdrawProposal(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return withdrawProposalLogic(id, user.businessId);
}

export async function getShortlistItemProposal(shortlistItemId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getProposalForShortlistItemLogic(shortlistItemId, user.businessId);
}
