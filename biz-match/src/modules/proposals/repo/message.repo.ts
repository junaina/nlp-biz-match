import { prisma } from "@/lib/prisma";
import { MessageType } from "@prisma/client";

export async function createMessage(data: {
  conversationId: string;
  senderBusinessId?: string;
  content: string;
  type?: MessageType;
  attachmentUrls?: string[];
  metadata?: any;
}) {
  return prisma.$transaction(async (tx) => {
    const message = await tx.message.create({
      data: {
        conversationId: data.conversationId,
        senderBusinessId: data.senderBusinessId,
        content: data.content,
        type: data.type,
        attachmentUrls: data.attachmentUrls,
        metadata: data.metadata,
      }
    });

    await tx.conversation.update({
      where: { id: data.conversationId },
      data: { lastMessageAt: new Date() }
    });

    return message;
  });
}

export async function listMessagesForConversation(conversationId: string) {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' }
  });
}

export async function markMessagesAsRead(conversationId: string, role: "buyer" | "provider") {
  return prisma.message.updateMany({
    where: { conversationId },
    data: role === 'buyer'
      ? { readByBuyer: true, readAt: new Date() }
      : { readByProvider: true, readAt: new Date() }
  });
}
