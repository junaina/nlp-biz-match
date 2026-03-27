import { describe, it, expect, vi, beforeEach } from "vitest";
import { MessageType, ConversationStage } from "@prisma/client";

// Mocks
const CONVERSATION_ID = "conversation-123";
const MESSAGE_ID = "message-123";

const mockConversation = {
  id: CONVERSATION_ID,
  stage: ConversationStage.INQUIRY,
  buyerBusinessId: "buyer-1",
  providerBusinessId: "provider-1"
};

const mockMessage = {
  id: MESSAGE_ID,
  conversationId: CONVERSATION_ID,
  content: "Hello",
  type: MessageType.TEXT
};

// Mock service layer
vi.mock("@/modules/proposals/service/conversation.service", () => ({
  getMyConversations: vi.fn(),
  getConversationDetail: vi.fn(),
}));

vi.mock("@/modules/proposals/service/message.service", () => ({
  sendMessage: vi.fn(),
  getMessagesForConversation: vi.fn(),
}));

import * as convService from "@/modules/proposals/service/conversation.service";
import * as msgService from "@/modules/proposals/service/message.service";

function makeRequest(body: unknown, method = "POST"): Request {
  return new Request("http://localhost/api/test", {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("🌐 API Route – GET /api/conversations", () => {
  let GET: (req: Request) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/conversations/route");
    GET = mod.GET;
  });

  it("[PASS] returns 200 with list of conversations", async () => {
    vi.mocked(convService.getMyConversations).mockResolvedValue([mockConversation] as any);
    const res = await GET(new Request("http://localhost"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe(CONVERSATION_ID);
  });

  it("[FAIL] returns 401 when not authenticated", async () => {
    vi.mocked(convService.getMyConversations).mockRejectedValue(new Error("Not authenticated"));
    const res = await GET(new Request("http://localhost"));
    expect(res.status).toBe(401);
  });
});

describe("🌐 API Route – GET /api/conversations/[conversationId]", () => {
  let GET: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/conversations/[conversationId]/route");
    GET = mod.GET;
  });

  it("[PASS] returns 200 with conversation detail", async () => {
    vi.mocked(convService.getConversationDetail).mockResolvedValue(mockConversation as any);
    const res = await GET(new Request("http://localhost"), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe(CONVERSATION_ID);
  });

  it("[FAIL] returns 403 when access denied", async () => {
    vi.mocked(convService.getConversationDetail).mockRejectedValue(new Error("Access denied"));
    const res = await GET(new Request("http://localhost"), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(403);
  });
});

describe("🌐 API Route – POST/GET /api/conversations/[conversationId]/messages", () => {
  let GET: (req: Request, ctx: any) => Promise<Response>;
  let POST: (req: Request, ctx: any) => Promise<Response>;
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("@/app/api/conversations/[conversationId]/messages/route");
    GET = mod.GET;
    POST = mod.POST;
  });

  it("[PASS] GET returns 200 with messages", async () => {
    vi.mocked(msgService.getMessagesForConversation).mockResolvedValue([mockMessage] as any);
    const res = await GET(new Request("http://localhost"), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json[0].id).toBe(MESSAGE_ID);
  });

  it("[FAIL] POST returns 400 when content is missing", async () => {
    const res = await POST(makeRequest({}), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(400);
  });

  it("[PASS] POST returns 201 when message creates successfully", async () => {
    vi.mocked(msgService.sendMessage).mockResolvedValue(mockMessage as any);
    const res = await POST(makeRequest({ content: "Hello" }), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(201);
    expect((await res.json()).id).toBe(MESSAGE_ID);
  });

  it("[FAIL] POST returns 403 when not a participant", async () => {
    vi.mocked(msgService.sendMessage).mockRejectedValue(new Error("You are not a participant in this conversation"));
    const res = await POST(makeRequest({ content: "Hi" }), { params: { conversationId: CONVERSATION_ID } });
    expect(res.status).toBe(403);
  });
});
