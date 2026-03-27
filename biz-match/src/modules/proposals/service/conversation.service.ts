"use server";

import { getConversationById, listConversationsForBusiness } from "../repo/conversation.repo";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";

// ─── Pure logic ──────────────────────────────────────────────────────────────

export async function getConversationDetailLogic(id: string, businessId: string) {
  const conversation = await getConversationById(id);
  if (!conversation) throw new Error("Conversation not found");

  const isParticipant =
    conversation.buyerBusinessId === businessId ||
    conversation.providerBusinessId === businessId;

  if (!isParticipant) throw new Error("Access denied");
  return conversation;
}

export async function getMyConversationsLogic(businessId: string) {
  return listConversationsForBusiness(businessId);
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function getConversationDetail(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getConversationDetailLogic(id, user.businessId);
}

export async function getMyConversations() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getMyConversationsLogic(user.businessId);
}
