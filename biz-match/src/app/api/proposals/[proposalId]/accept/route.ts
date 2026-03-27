import { NextResponse } from "next/server";
import { acceptProposal } from "@/modules/proposals/service/proposal.service";

export async function POST(req: Request, { params }: { params: Promise<{ proposalId: string }> }) {
  try {
    const { proposalId } = await params;
    const proposal = await acceptProposal(proposalId);
    return NextResponse.json(proposal);
  } catch (error: any) {
    if (error.message === "Not authenticated") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message === "Only the buyer can accept the proposal") {
         return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
