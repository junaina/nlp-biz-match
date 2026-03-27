import { prisma } from "@/lib/prisma";
import { ConversationStage } from "@prisma/client";

export async function createConversationForProposal(data: {
  proposalId: string;
  requestId: string;
  buyerBusinessId: string;
  providerBusinessId: string;
}) {
  return prisma.conversation.create({
    data,
  });
}

export async function getConversationById(id: string) {
  return prisma.conversation.findUnique({
    where: { id },
    include: {
      proposal: true,
      messages: { orderBy: { createdAt: 'asc' } },
    }
  });
}

export async function listConversationsForBusiness(businessId: string) {
  return prisma.conversation.findMany({
    where: {
      OR: [
        { buyerBusinessId: businessId },
        { providerBusinessId: businessId },
      ]
    },
    include: {
      proposal: {
        include: {
          buyerBusiness: true,
          providerBusiness: true,
          request: true,
        }
      }
    },
    orderBy: { lastMessageAt: 'desc' }
  });
}

export async function updateConversationStage(id: string, stage: ConversationStage) {
  return prisma.conversation.update({
    where: { id },
    data: { stage }
  });
}

export async function incrementUnreadCount(conversationId: string, role: "buyer" | "provider") {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: role === 'buyer' 
      ? { buyerUnreadCount: { increment: 1 } }
      : { providerUnreadCount: { increment: 1 } }
  });
}

export async function resetUnreadCount(conversationId: string, role: "buyer" | "provider") {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: role === 'buyer' 
      ? { buyerUnreadCount: 0 }
      : { providerUnreadCount: 0 }
  });
}
