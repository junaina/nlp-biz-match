/**
 * Proposal System – Full Test Suite (pure logic functions, no "use server", no live DB)
 *
 * Covers all business rules for:
 *  1. Proposal Service  – submit, view, list, accept, reject, withdraw
 *  2. Conversation Service – view, list
 *  3. Message Service   – send, read (with unread tracking)
 *  4. API Route Handlers – all 5 proposal routes
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageType, ProposalStatus, ConversationStage } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURES
// ─────────────────────────────────────────────────────────────────────────────
const BUYER_BIZ   = "buyer-biz-001";
const PROVIDER_BIZ = "provider-biz-002";
const REQUEST_ID   = "request-001";
const SL_ITEM_ID   = "shortlist-001";
const SERVICE_ID   = "service-001";
const PROPOSAL_ID  = "proposal-001";
const CONV_ID      = "conversation-001";
const MSG_ID       = "message-001";

const mockShortlistItem = {
  id: SL_ITEM_ID,
  buyerBusinessId: BUYER_BIZ,
  providerBusinessId: PROVIDER_BIZ,
  providerServiceId: SERVICE_ID,
  requestId: REQUEST_ID,
};

const mockProposal = {
  id: PROPOSAL_ID,
  shortlistItemId: SL_ITEM_ID,
  requestId: REQUEST_ID,
  buyerBusinessId: BUYER_BIZ,
  providerBusinessId: PROVIDER_BIZ,
  providerServiceId: SERVICE_ID,
  coverLetter: "X".repeat(120),
  proposedBudget: 5000,
  timeline: "4 weeks",
  deliverables: "Full app",
  termsAndConditions: null,
  attachmentUrls: [],
  status: ProposalStatus.PENDING,
  submittedAt: new Date(),
  reviewedAt: null,
  respondedAt: null,
  expiresAt: null,
  acceptedAt: null,
  rejectionReason: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  buyerBusiness: { id: BUYER_BIZ, name: "Buyer Corp" },
  providerBusiness: { id: PROVIDER_BIZ, name: "Provider LLC" },
  providerService: { id: SERVICE_ID, title: "Web Dev" },
  request: { id: REQUEST_ID, title: "Need e-commerce site" },
};

const mockConversation = {
  id: CONV_ID,
  proposalId: PROPOSAL_ID,
  requestId: REQUEST_ID,
  buyerBusinessId: BUYER_BIZ,
  providerBusinessId: PROVIDER_BIZ,
  stage: ConversationStage.INQUIRY,
  lastMessageAt: new Date(),
  isArchived: false,
  buyerUnreadCount: 0,
  providerUnreadCount: 0,
  messages: [],
  proposal: mockProposal,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockMessage = {
  id: MSG_ID,
  conversationId: CONV_ID,
  senderBusinessId: BUYER_BIZ,
  type: MessageType.TEXT,
  content: "Hello!",
  metadata: null,
  attachmentUrls: [],
  readByBuyer: false,
  readByProvider: false,
  readAt: null,
  createdAt: new Date(),
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────────────────────────────────────────
vi.mock("@/lib/prisma", () => ({
  prisma: {
    shortlistItem: { findUnique: vi.fn() },
    conversation:  { findUnique: vi.fn() },
  },
}));

vi.mock("@/modules/proposals/repo/proposal.repo", () => ({
  createProposal:            vi.fn(),
  getProposalById:           vi.fn(),
  listProposalsByRequest:    vi.fn(),
  listProposalsByProvider:   vi.fn(),
  updateProposalStatus:      vi.fn(),
  getProposalForShortlistItem: vi.fn(),
}));

vi.mock("@/modules/proposals/repo/conversation.repo", () => ({
  createConversationForProposal: vi.fn(),
  getConversationById:           vi.fn(),
  listConversationsForBusiness:  vi.fn(),
  updateConversationStage:       vi.fn(),
  incrementUnreadCount:          vi.fn(),
  resetUnreadCount:              vi.fn(),
}));

vi.mock("@/modules/proposals/repo/message.repo", () => ({
  createMessage:                vi.fn(),
  listMessagesForConversation:  vi.fn(),
  markMessagesAsRead:           vi.fn(),
}));

// Mock next/headers so API route imports don't crash outside Next.js runtime
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn() })),
}));

// Mock auth service (used by server action wrappers, not by logic functions)
vi.mock("@/modules/auth/service/current-user.service", () => ({
  getCurrentUser: vi.fn(),
}));

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS (after mocks are declared)
// ─────────────────────────────────────────────────────────────────────────────
import { prisma }               from "@/lib/prisma";
import * as proposalRepo        from "@/modules/proposals/repo/proposal.repo";
import * as conversationRepo    from "@/modules/proposals/repo/conversation.repo";
import * as messageRepo         from "@/modules/proposals/repo/message.repo";

// Import PURE logic functions (no "use server")
import {
  submitProposalLogic,
  getProposalDetailLogic,
  getMyProposalsLogic,
  getProposalsForMyServicesLogic,
  acceptProposalLogic,
  rejectProposalLogic,
  withdrawProposalLogic,
} from "@/modules/proposals/service/proposal.service";

import {
  getConversationDetailLogic,
  getMyConversationsLogic,
} from "@/modules/proposals/service/conversation.service";

import {
  sendMessageLogic,
  getMessagesForConversationLogic,
} from "@/modules/proposals/service/message.service";

// Import route handlers (server action wrapper calls are mocked via the service mock)
import * as proposalServiceModule from "@/modules/proposals/service/proposal.service";

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 1 – PROPOSAL SERVICE (submitProposalLogic)
// ══════════════════════════════════════════════════════════════════════════════
describe("📦 Proposal Service – submitProposalLogic()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[FAIL] shortlist item not found → throws error", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue(null);
    await expect(
      submitProposalLogic({ shortlistItemId: "bad", coverLetter: "X".repeat(120), proposedBudget: 5000, timeline: "1 week", deliverables: "App", kickoffMessage: "Looking forward to working with you." }, "uid", BUYER_BIZ)
    ).rejects.toThrowError("Shortlist item not found");
  });

  it("[FAIL] buyer doesn't own the shortlist item → throws error", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue({ ...mockShortlistItem, buyerBusinessId: "someone-else" } as any);
    await expect(
      submitProposalLogic({ shortlistItemId: SL_ITEM_ID, coverLetter: "X".repeat(120), proposedBudget: 5000, timeline: "1 week", deliverables: "App", kickoffMessage: "Looking forward to working with you." }, "uid", BUYER_BIZ)
    ).rejects.toThrowError("only send proposals for your own requests");
  });

  it("[FAIL] cover letter too short (< 100 chars) → throws error", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue(mockShortlistItem as any);
    await expect(
      submitProposalLogic({ shortlistItemId: SL_ITEM_ID, coverLetter: "Short", proposedBudget: 5000, timeline: "1 week", deliverables: "App", kickoffMessage: "Looking forward to working with you." }, "uid", BUYER_BIZ)
    ).rejects.toThrowError("Cover letter must be at least 100 characters");
  });

  it("[FAIL] budget is zero → throws error", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue(mockShortlistItem as any);
    await expect(
      submitProposalLogic({ shortlistItemId: SL_ITEM_ID, coverLetter: "X".repeat(120), proposedBudget: 0, timeline: "1w", deliverables: "App", kickoffMessage: "Looking forward to working with you." }, "uid", BUYER_BIZ)
    ).rejects.toThrowError("Proposed budget must be greater than 0");
  });

  it("[FAIL] kickoff message too short (< 20 chars) → throws error", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue(mockShortlistItem as any);
    await expect(
      submitProposalLogic({ shortlistItemId: SL_ITEM_ID, coverLetter: "X".repeat(120), proposedBudget: 5000, timeline: "1w", deliverables: "App", kickoffMessage: "Hi." }, "uid", BUYER_BIZ)
    ).rejects.toThrowError("Kickoff message must be at least 20 characters");
  });

  it("[PASS] valid input → creates proposal + conversation + kickoff message", async () => {
    vi.mocked(prisma.shortlistItem.findUnique).mockResolvedValue(mockShortlistItem as any);
    vi.mocked(proposalRepo.createProposal).mockResolvedValue(mockProposal as any);
    vi.mocked(conversationRepo.createConversationForProposal).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.createMessage).mockResolvedValue(mockMessage as any);

    const result = await submitProposalLogic({
      shortlistItemId: SL_ITEM_ID,
      coverLetter: "X".repeat(120),
      proposedBudget: 5000,
      timeline: "4 weeks",
      deliverables: "Full app",
      kickoffMessage: "Hello! Looking forward to your project.",
    }, "uid", BUYER_BIZ);

    expect(result.id).toBe(PROPOSAL_ID);
    expect(result.status).toBe(ProposalStatus.PENDING);

    // Verify all 3 creations happened in order
    expect(proposalRepo.createProposal).toHaveBeenCalledOnce();
    expect(conversationRepo.createConversationForProposal).toHaveBeenCalledWith({
      proposalId: PROPOSAL_ID,
      requestId: REQUEST_ID,
      buyerBusinessId: BUYER_BIZ,
      providerBusinessId: PROVIDER_BIZ,
    });
    expect(messageRepo.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.PROPOSAL_SUBMIT, conversationId: CONV_ID })
    );
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 2 – PROPOSAL SERVICE (getProposalDetailLogic)
// ══════════════════════════════════════════════════════════════════════════════
describe("📦 Proposal Service – getProposalDetailLogic()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[FAIL] proposal not found → throws error", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(null);
    await expect(getProposalDetailLogic("bad-id", BUYER_BIZ)).rejects.toThrowError("Proposal not found");
  });

  it("[FAIL] outsider accesses proposal → throws 'Access denied'", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    await expect(getProposalDetailLogic(PROPOSAL_ID, "outsider-biz")).rejects.toThrowError("Access denied");
  });

  it("[PASS] buyer can view proposal", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    const result = await getProposalDetailLogic(PROPOSAL_ID, BUYER_BIZ);
    expect(result.id).toBe(PROPOSAL_ID);
  });

  it("[PASS] provider can view proposal", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    const result = await getProposalDetailLogic(PROPOSAL_ID, PROVIDER_BIZ);
    expect(result.id).toBe(PROPOSAL_ID);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 3 – PROPOSAL SERVICE (list, accept, reject, withdraw)
// ══════════════════════════════════════════════════════════════════════════════
describe("📦 Proposal Service – list / accept / reject / withdraw", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[PASS] getMyProposalsLogic filters by buyer's businessId", async () => {
    vi.mocked(proposalRepo.listProposalsByRequest).mockResolvedValue([
      mockProposal,
      { ...mockProposal, id: "other", buyerBusinessId: "another-buyer" },
    ] as any);
    const result = await getMyProposalsLogic(REQUEST_ID, BUYER_BIZ);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(PROPOSAL_ID);
  });

  it("[PASS] getProposalsForMyServicesLogic queries by provider businessId", async () => {
    vi.mocked(proposalRepo.listProposalsByProvider).mockResolvedValue([mockProposal] as any);
    const result = await getProposalsForMyServicesLogic(PROVIDER_BIZ);
    expect(result).toHaveLength(1);
    expect(proposalRepo.listProposalsByProvider).toHaveBeenCalledWith(PROVIDER_BIZ);
  });

  it("[FAIL] acceptProposalLogic – provider tries to accept → throws error", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    await expect(acceptProposalLogic(PROPOSAL_ID, PROVIDER_BIZ)).rejects.toThrowError("Only the buyer can accept");
  });

  it("[PASS] acceptProposalLogic – buyer accepts → status ACCEPTED + system message", async () => {
    const accepted = { ...mockProposal, status: ProposalStatus.ACCEPTED, acceptedAt: new Date() };
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    vi.mocked(proposalRepo.updateProposalStatus).mockResolvedValue(accepted as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.createMessage).mockResolvedValue(mockMessage as any);

    const result = await acceptProposalLogic(PROPOSAL_ID, BUYER_BIZ);
    expect(result.status).toBe(ProposalStatus.ACCEPTED);
    expect(messageRepo.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.PROPOSAL_ACCEPTED })
    );
  });

  it("[FAIL] rejectProposalLogic – buyer tries to reject → throws error", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    await expect(rejectProposalLogic(PROPOSAL_ID, BUYER_BIZ)).rejects.toThrowError("Only the provider can reject");
  });

  it("[PASS] rejectProposalLogic – provider rejects with reason → status REJECTED + system message", async () => {
    const rejected = { ...mockProposal, status: ProposalStatus.REJECTED, rejectionReason: "Budget low" };
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    vi.mocked(proposalRepo.updateProposalStatus).mockResolvedValue(rejected as any);
    vi.mocked(prisma.conversation.findUnique).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.createMessage).mockResolvedValue(mockMessage as any);

    const result = await rejectProposalLogic(PROPOSAL_ID, PROVIDER_BIZ, "Budget low");
    expect(result.status).toBe(ProposalStatus.REJECTED);
    expect(proposalRepo.updateProposalStatus).toHaveBeenCalledWith(PROPOSAL_ID, ProposalStatus.REJECTED, "Budget low");
    expect(messageRepo.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ type: MessageType.PROPOSAL_REJECTED })
    );
  });

  it("[FAIL] withdrawProposalLogic – provider tries to withdraw → throws error", async () => {
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    await expect(withdrawProposalLogic(PROPOSAL_ID, PROVIDER_BIZ)).rejects.toThrowError("Only the buyer can withdraw");
  });

  it("[PASS] withdrawProposalLogic – buyer withdraws → status WITHDRAWN", async () => {
    const withdrawn = { ...mockProposal, status: ProposalStatus.WITHDRAWN };
    vi.mocked(proposalRepo.getProposalById).mockResolvedValue(mockProposal as any);
    vi.mocked(proposalRepo.updateProposalStatus).mockResolvedValue(withdrawn as any);

    const result = await withdrawProposalLogic(PROPOSAL_ID, BUYER_BIZ);
    expect(result.status).toBe(ProposalStatus.WITHDRAWN);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 4 – CONVERSATION SERVICE
// ══════════════════════════════════════════════════════════════════════════════
describe("💬 Conversation Service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[FAIL] getConversationDetailLogic – not found → throws error", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(null);
    await expect(getConversationDetailLogic("bad-id", BUYER_BIZ)).rejects.toThrowError("Conversation not found");
  });

  it("[FAIL] getConversationDetailLogic – outsider → throws 'Access denied'", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    await expect(getConversationDetailLogic(CONV_ID, "outsider")).rejects.toThrowError("Access denied");
  });

  it("[PASS] getConversationDetailLogic – buyer can view", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    const result = await getConversationDetailLogic(CONV_ID, BUYER_BIZ);
    expect(result.id).toBe(CONV_ID);
  });

  it("[PASS] getConversationDetailLogic – provider can view", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    const result = await getConversationDetailLogic(CONV_ID, PROVIDER_BIZ);
    expect(result.id).toBe(CONV_ID);
  });

  it("[PASS] getMyConversationsLogic – queries by businessId", async () => {
    vi.mocked(conversationRepo.listConversationsForBusiness).mockResolvedValue([mockConversation] as any);
    const result = await getMyConversationsLogic(BUYER_BIZ);
    expect(result).toHaveLength(1);
    expect(conversationRepo.listConversationsForBusiness).toHaveBeenCalledWith(BUYER_BIZ);
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 5 – MESSAGE SERVICE
// ══════════════════════════════════════════════════════════════════════════════
describe("✉️  Message Service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("[FAIL] sendMessageLogic – conversation not found → throws error", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(null);
    await expect(sendMessageLogic({ conversationId: "bad", content: "Hi" }, BUYER_BIZ))
      .rejects.toThrowError("Conversation not found");
  });

  it("[FAIL] sendMessageLogic – outsider → throws 'not a participant'", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    await expect(sendMessageLogic({ conversationId: CONV_ID, content: "Hi" }, "outsider"))
      .rejects.toThrowError("not a participant");
  });

  it("[PASS] sendMessageLogic – buyer sends → increments provider unread", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.createMessage).mockResolvedValue(mockMessage as any);
    vi.mocked(conversationRepo.incrementUnreadCount).mockResolvedValue(mockConversation as any);

    await sendMessageLogic({ conversationId: CONV_ID, content: "Hello provider!" }, BUYER_BIZ);

    expect(conversationRepo.incrementUnreadCount).toHaveBeenCalledWith(CONV_ID, "provider");
    expect(messageRepo.createMessage).toHaveBeenCalledWith(
      expect.objectContaining({ senderBusinessId: BUYER_BIZ, type: MessageType.TEXT })
    );
  });

  it("[PASS] sendMessageLogic – provider sends → increments buyer unread", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.createMessage).mockResolvedValue(mockMessage as any);
    vi.mocked(conversationRepo.incrementUnreadCount).mockResolvedValue(mockConversation as any);

    await sendMessageLogic({ conversationId: CONV_ID, content: "Hello buyer!" }, PROVIDER_BIZ);

    expect(conversationRepo.incrementUnreadCount).toHaveBeenCalledWith(CONV_ID, "buyer");
  });

  it("[FAIL] getMessagesForConversationLogic – outsider → throws 'Access denied'", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    await expect(getMessagesForConversationLogic(CONV_ID, "outsider"))
      .rejects.toThrowError("Access denied");
  });

  it("[PASS] getMessagesForConversationLogic – buyer reads → marks read + resets unread", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.listMessagesForConversation).mockResolvedValue([mockMessage] as any);
    vi.mocked(messageRepo.markMessagesAsRead).mockResolvedValue({ count: 1 } as any);
    vi.mocked(conversationRepo.resetUnreadCount).mockResolvedValue(mockConversation as any);

    const messages = await getMessagesForConversationLogic(CONV_ID, BUYER_BIZ);
    expect(messages).toHaveLength(1);
    expect(messageRepo.markMessagesAsRead).toHaveBeenCalledWith(CONV_ID, "buyer");
    expect(conversationRepo.resetUnreadCount).toHaveBeenCalledWith(CONV_ID, "buyer");
  });

  it("[PASS] getMessagesForConversationLogic – provider reads → marks read + resets unread", async () => {
    vi.mocked(conversationRepo.getConversationById).mockResolvedValue(mockConversation as any);
    vi.mocked(messageRepo.listMessagesForConversation).mockResolvedValue([mockMessage] as any);
    vi.mocked(messageRepo.markMessagesAsRead).mockResolvedValue({ count: 1 } as any);
    vi.mocked(conversationRepo.resetUnreadCount).mockResolvedValue(mockConversation as any);

    await getMessagesForConversationLogic(CONV_ID, PROVIDER_BIZ);
    expect(messageRepo.markMessagesAsRead).toHaveBeenCalledWith(CONV_ID, "provider");
    expect(conversationRepo.resetUnreadCount).toHaveBeenCalledWith(CONV_ID, "provider");
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// SUITE 6 – API ROUTE HANDLERS
// Tests that route handlers: parse body, return correct HTTP codes, forward errors
// ══════════════════════════════════════════════════════════════════════════════

// Mock the service module for route tests (routes call server-action wrappers)
vi.mock("@/modules/proposals/service/proposal.service", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/modules/proposals/service/proposal.service")>();
  return {
    ...original,                    // keep pure logic exports
    submitProposal: vi.fn(),        // mock server-action wrappers
    getProposalDetail: vi.fn(),
    getMyProposals: vi.fn(),
    acceptProposal: vi.fn(),
    rejectProposal: vi.fn(),
    withdrawProposal: vi.fn(),
    getShortlistItemProposal: vi.fn(),
  };
});

function makeRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/test", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("🌐 API Route – POST /api/proposals", () => {
  let POST: (req: Request) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/proposals/route");
    POST = mod.POST;
  });

  it("[PASS] returns 201 on successful proposal submission", async () => {
    vi.mocked(proposalServiceModule.submitProposal).mockResolvedValue(mockProposal as any);
    const res = await POST(makeRequest({ shortlistItemId: SL_ITEM_ID }));
    expect(res.status).toBe(201);
    expect((await res.json()).id).toBe(PROPOSAL_ID);
  });

  it("[FAIL] returns 400 when service throws validation error", async () => {
    vi.mocked(proposalServiceModule.submitProposal).mockRejectedValue(
      new Error("Cover letter must be at least 100 characters")
    );
    const res = await POST(makeRequest({ coverLetter: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toContain("100 characters");
  });

  it("[FAIL] returns 400 on 'Not authenticated'", async () => {
    vi.mocked(proposalServiceModule.submitProposal).mockRejectedValue(new Error("Not authenticated"));
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

describe("🌐 API Route – GET/PATCH /api/proposals/[proposalId]", () => {
  let GET: (req: Request, ctx: any) => Promise<Response>;
  let PATCH: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/proposals/[proposalId]/route");
    GET = mod.GET;
    PATCH = mod.PATCH;
  });

  it("[PASS] GET returns 200 with proposal", async () => {
    vi.mocked(proposalServiceModule.getProposalDetail).mockResolvedValue(mockProposal as any);
    const res = await GET(new Request("http://localhost"), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(PROPOSAL_ID);
  });

  it("[FAIL] GET returns 400 when proposal not found", async () => {
    vi.mocked(proposalServiceModule.getProposalDetail).mockRejectedValue(new Error("Proposal not found"));
    const res = await GET(new Request("http://localhost"), { params: { proposalId: "bad" } });
    expect(res.status).toBe(400);
  });

  it("[FAIL] GET returns 400 when access denied", async () => {
    vi.mocked(proposalServiceModule.getProposalDetail).mockRejectedValue(new Error("Access denied"));
    const res = await GET(new Request("http://localhost"), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toBe("Access denied");
  });

  it("[PASS] PATCH WITHDRAWN returns 200", async () => {
    vi.mocked(proposalServiceModule.withdrawProposal).mockResolvedValue({
      ...mockProposal, status: ProposalStatus.WITHDRAWN,
    } as any);
    const res = await PATCH(makeRequest({ status: "WITHDRAWN" }, "PATCH"), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(200);
    expect((await res.json()).status).toBe(ProposalStatus.WITHDRAWN);
  });

  it("[FAIL] PATCH with unsupported status → returns 400", async () => {
    const res = await PATCH(makeRequest({ status: "SOMETHING_RANDOM" }, "PATCH"), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(400);
  });
});

describe("🌐 API Route – POST /api/proposals/[proposalId]/accept", () => {
  let POST: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/proposals/[proposalId]/accept/route");
    POST = mod.POST;
  });

  it("[PASS] buyer accepts → 200 with ACCEPTED status", async () => {
    vi.mocked(proposalServiceModule.acceptProposal).mockResolvedValue({
      ...mockProposal, status: ProposalStatus.ACCEPTED, acceptedAt: new Date(),
    } as any);
    const res = await POST(makeRequest({}), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe(ProposalStatus.ACCEPTED);
    expect(json.acceptedAt).toBeDefined();
  });

  it("[FAIL] provider tries to accept → 400 with buyer-only error", async () => {
    vi.mocked(proposalServiceModule.acceptProposal).mockRejectedValue(
      new Error("Only the buyer can accept the proposal")
    );
    const res = await POST(makeRequest({}), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("buyer");
  });
});

describe("🌐 API Route – GET /api/proposals/by-request/[requestId]", () => {
  let GET: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/proposals/by-request/[requestId]/route");
    GET = mod.GET;
  });

  it("[PASS] returns 200 with list of proposals", async () => {
    vi.mocked(proposalServiceModule.getMyProposals).mockResolvedValue([mockProposal] as any);
    const res = await GET(new Request("http://localhost"), { params: { requestId: REQUEST_ID } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe(PROPOSAL_ID);
  });

  it("[FAIL] unauthenticated → returns 400", async () => {
    vi.mocked(proposalServiceModule.getMyProposals).mockRejectedValue(new Error("Not authenticated"));
    const res = await GET(new Request("http://localhost"), { params: { requestId: REQUEST_ID } });
    expect(res.status).toBe(401);
  });
});

describe("🌐 API Route – POST /api/proposals/[proposalId]/reject", () => {
  let POST: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/proposals/[proposalId]/reject/route");
    POST = mod.POST;
  });

  it("[PASS] provider rejects → 200 with REJECTED status", async () => {
    vi.mocked(proposalServiceModule.rejectProposal).mockResolvedValue({
      ...mockProposal, status: ProposalStatus.REJECTED, rejectionReason: "No capacity",
    } as any);
    const res = await POST(makeRequest({ reason: "No capacity" }), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe(ProposalStatus.REJECTED);
  });

  it("[FAIL] buyer tries to reject → 400 with provider-only error", async () => {
    vi.mocked(proposalServiceModule.rejectProposal).mockRejectedValue(
      new Error("Only the provider can reject the proposal")
    );
    const res = await POST(makeRequest({}), { params: { proposalId: PROPOSAL_ID } });
    expect(res.status).toBe(403);
    expect((await res.json()).error).toContain("provider");
  });
});

describe("🌐 API Route – GET/POST /api/shortlist/[shortlistItemId]/proposal", () => {
  let GET: (req: Request, ctx: any) => Promise<Response>;
  let POST: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/shortlist/[shortlistItemId]/proposal/route");
    GET = mod.GET;
    POST = mod.POST;
  });

  it("[PASS] GET returns 200 with proposal content", async () => {
    vi.mocked(proposalServiceModule.getShortlistItemProposal).mockResolvedValue(mockProposal as any);
    const res = await GET(new Request("http://localhost"), { params: { shortlistItemId: SL_ITEM_ID } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(PROPOSAL_ID);
  });

  it("[PASS] POST calls submitProposal and passes shortlistItemId safely", async () => {
    vi.mocked(proposalServiceModule.submitProposal).mockResolvedValue(mockProposal as any);
    const res = await POST(makeRequest({ coverLetter: "X".repeat(100) }), { params: { shortlistItemId: SL_ITEM_ID } });
    expect(res.status).toBe(201);
    expect(proposalServiceModule.submitProposal).toHaveBeenCalledWith(
      expect.objectContaining({ shortlistItemId: SL_ITEM_ID, coverLetter: "X".repeat(100) })
    );
  });
});
