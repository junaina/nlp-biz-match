import { NextResponse } from "next/server";
import { sendMessage, getMessagesForConversation } from "@/modules/proposals/service/message.service";

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    const messages = await getMessagesForConversation(conversationId);
    return NextResponse.json(messages);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Access denied") {
         return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    const body = await req.json();
    
    if (!body.content || typeof body.content !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const message = await sendMessage({
      conversationId: conversationId,
      content: body.content,
      attachmentUrls: body.attachmentUrls,
    });
    
    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "You are not a participant in this conversation") {
         return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
