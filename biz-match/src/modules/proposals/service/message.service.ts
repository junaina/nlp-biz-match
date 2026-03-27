"use server";

import { getConversationById, incrementUnreadCount, resetUnreadCount } from "../repo/conversation.repo";
import { createMessage, listMessagesForConversation, markMessagesAsRead } from "../repo/message.repo";
import type { SendMessageInput } from "../domain/message.types";
import { MessageType } from "@prisma/client";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";

// ─── Pure logic ──────────────────────────────────────────────────────────────

export async function sendMessageLogic(input: SendMessageInput, businessId: string) {
  const conversation = await getConversationById(input.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const isParticipant =
    conversation.buyerBusinessId === businessId ||
    conversation.providerBusinessId === businessId;

  if (!isParticipant) throw new Error("You are not a participant in this conversation");

  const isBuyer = conversation.buyerBusinessId === businessId;
  const recipientRole = isBuyer ? "provider" : "buyer";

  const message = await createMessage({
    conversationId: input.conversationId,
    senderBusinessId: businessId,
    content: input.content,
    attachmentUrls: input.attachmentUrls || [],
    type: MessageType.TEXT,
  });

  await incrementUnreadCount(input.conversationId, recipientRole);
  return message;
}

export async function getMessagesForConversationLogic(conversationId: string, businessId: string) {
  const conversation = await getConversationById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const isBuyer = conversation.buyerBusinessId === businessId;
  const isProvider = conversation.providerBusinessId === businessId;

  if (!isBuyer && !isProvider) throw new Error("Access denied");

  const role = isBuyer ? "buyer" : "provider";
  await markMessagesAsRead(conversationId, role);
  await resetUnreadCount(conversationId, role);

  return listMessagesForConversation(conversationId);
}

// ─── Server Actions ──────────────────────────────────────────────────────────

export async function sendMessage(input: SendMessageInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return sendMessageLogic(input, user.businessId);
}

export async function getMessagesForConversation(conversationId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return getMessagesForConversationLogic(conversationId, user.businessId);
}
