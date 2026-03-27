import { NextResponse } from "next/server";
import { rejectProposal } from "@/modules/proposals/service/proposal.service";

export async function POST(req: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const { proposalId } = await params;
    const body = await req.json().catch(() => ({}));
    const proposal = await rejectProposal(proposalId, body.reason);
    return NextResponse.json(proposal);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Only the provider can reject the proposal") {
         return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
