import { describe, it, expect, vi } from 'vitest';
import { submitProposal } from './proposal.service';

// Mock dependencies
vi.mock('@/modules/auth/service/current-user.service', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ businessId: 'buyer-org-123' })
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    shortlistItem: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'shortlist-123',
        buyerBusinessId: 'buyer-org-123',
        providerBusinessId: 'provider-org-456',
        providerServiceId: 'service-789',
        requestId: 'req-987'
      })
    }
  }
}));

vi.mock('../repo/proposal.repo', () => ({
  createProposal: vi.fn().mockImplementation((data) => ({ id: 'new-proposal-1', ...data })),
  getProposalById: vi.fn(),
  listProposalsByRequest: vi.fn(),
  listProposalsByProvider: vi.fn(),
  updateProposalStatus: vi.fn(),
}));

vi.mock('../repo/conversation.repo', () => ({
  createConversationForProposal: vi.fn().mockResolvedValue({ id: 'new-conversation-1' })
}));

vi.mock('../repo/message.repo', () => ({
  createMessage: vi.fn().mockResolvedValue({ id: 'new-message-1' })
}));

describe('Proposal Service - submitProposal', () => {
  it('should throw an error if cover letter is too short', async () => {
    const input = {
      shortlistItemId: 'shortlist-123',
      coverLetter: 'Too short', // less than 100 chars
      proposedBudget: 1000,
      timeline: '1 week',
      deliverables: 'Deliverable 1',
      kickoffMessage: 'This is a valid kickoff message with more than 20 chars.'
    };

    await expect(submitProposal(input)).rejects.toThrowError(/must be at least 100 characters/);
  });

  it('should throw error if kickoff message is too short', async () => {
    const input = {
      shortlistItemId: 'shortlist-123',
      coverLetter: 'A very long cover letter'.repeat(10), // > 100 chars
      proposedBudget: 1000,
      timeline: '1 week',
      deliverables: 'Deliverable 1',
      kickoffMessage: 'Short' // less than 20 chars
    };

    await expect(submitProposal(input)).rejects.toThrowError(/must be at least 20 characters/);
  });

  it('should pass and invoke dependencies when input is valid', async () => {
    const input = {
      shortlistItemId: 'shortlist-123',
      coverLetter: 'This is a very professional cover letter stating all the requirements clearly. '.repeat(5),
      proposedBudget: 5000,
      timeline: '2 weeks',
      deliverables: 'A fully working B2B portal',
      kickoffMessage: 'Hello provider, please find my proposal attached for your review.'
    };

    const proposal = await submitProposal(input);
    expect(proposal.id).toBe('new-proposal-1');
    expect(proposal.proposedBudget).toBe(5000);
  });
});
