import { NextResponse } from "next/server";
import { getConversationDetail } from "@/modules/proposals/service/conversation.service";

export async function GET(req: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  try {
    const { conversationId } = await params;
    const conversation = await getConversationDetail(conversationId);
    return NextResponse.json(conversation);
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
