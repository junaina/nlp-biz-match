import { ProposalStatus } from "@prisma/client";

export type CreateProposalInput = {
  shortlistItemId: string;
  coverLetter: string;
  proposedBudget: number;
  timeline: string;
  deliverables: string;
  termsAndConditions?: string;
  attachmentUrls?: string[];
  kickoffMessage: string;
};

export type UpdateProposalStatusInput = {
  status: 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  rejectionReason?: string;
};
