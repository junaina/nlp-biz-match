import { NextResponse } from "next/server";
import { getMyConversations } from "@/modules/proposals/service/conversation.service";

export async function GET(req: Request) {
  try {
    const conversations = await getMyConversations();
    return NextResponse.json(conversations);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
