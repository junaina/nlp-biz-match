import { NextResponse } from "next/server";
import { getShortlistItemProposal, submitProposal } from "@/modules/proposals/service/proposal.service";

export async function GET(req: Request, { params }: { params: Promise<{ shortlistItemId: string }> }) {
  try {
    const { shortlistItemId } = await params;
    const proposal = await getShortlistItemProposal(shortlistItemId);
    
    // Return 200 with null if proposal does not exist (valid case for UI checks)
    return NextResponse.json(proposal || null);
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

export async function POST(req: Request, { params }: { params: Promise<{ shortlistItemId: string }> }) {
  try {
    const { shortlistItemId } = await params;
    const body = await req.json();
    
    // Auto-inject the shortlistItemId from the URL into the payload
    const input = { ...body, shortlistItemId };
    
    const proposal = await submitProposal(input);
    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
