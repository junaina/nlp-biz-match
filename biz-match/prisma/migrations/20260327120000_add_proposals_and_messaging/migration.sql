-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ConversationStage" AS ENUM ('INQUIRY', 'PROPOSAL_SENT', 'NEGOTIATING', 'HIRED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'PROPOSAL_SUBMIT', 'PROPOSAL_ACCEPTED', 'PROPOSAL_REJECTED', 'QUOTE_REVISED', 'MILESTONE_UPDATE', 'ATTACHMENT');

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL,
    "shortlistItemId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "buyerBusinessId" TEXT NOT NULL,
    "providerBusinessId" TEXT NOT NULL,
    "providerServiceId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "proposedBudget" INTEGER NOT NULL,
    "timeline" TEXT NOT NULL,
    "deliverables" TEXT NOT NULL,
    "termsAndConditions" TEXT,
    "attachmentUrls" TEXT[],
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "buyerBusinessId" TEXT NOT NULL,
    "providerBusinessId" TEXT NOT NULL,
    "stage" "ConversationStage" NOT NULL DEFAULT 'INQUIRY',
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "buyerUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "providerUnreadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderBusinessId" TEXT,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "attachmentUrls" TEXT[],
    "readByBuyer" BOOLEAN NOT NULL DEFAULT false,
    "readByProvider" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_shortlistItemId_key" ON "Proposal"("shortlistItemId");

-- CreateIndex
CREATE INDEX "Proposal_buyerBusinessId_status_createdAt_idx" ON "Proposal"("buyerBusinessId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Proposal_providerBusinessId_status_createdAt_idx" ON "Proposal"("providerBusinessId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Proposal_requestId_status_idx" ON "Proposal"("requestId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_proposalId_key" ON "Conversation"("proposalId");

-- CreateIndex
CREATE INDEX "Conversation_buyerBusinessId_lastMessageAt_idx" ON "Conversation"("buyerBusinessId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_providerBusinessId_lastMessageAt_idx" ON "Conversation"("providerBusinessId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "Conversation_requestId_idx" ON "Conversation"("requestId");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_senderBusinessId_createdAt_idx" ON "Message"("senderBusinessId", "createdAt");

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_shortlistItemId_fkey" FOREIGN KEY ("shortlistItemId") REFERENCES "ShortlistItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_providerBusinessId_fkey" FOREIGN KEY ("providerBusinessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposal" ADD CONSTRAINT "Proposal_providerServiceId_fkey" FOREIGN KEY ("providerServiceId") REFERENCES "ProviderService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderBusinessId_fkey" FOREIGN KEY ("senderBusinessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;


