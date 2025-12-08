import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/auth/service/current-user.service";
import { listAllProviderServicesForMatching } from "@/modules/request/repo/provider-matching.repo";
import { scoreServicesWithGroq } from "@/modules/request/service/llm-matcher.service";
import type { RequestSummary } from "@/modules/request/domain/request.types";
import { MatchResults } from "../../_components/MatchResults";

export const dynamic = "force-dynamic";

export default async function MatchResultsPage(props: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await props.params;

  if (!requestId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-red-600">
          Invalid request id in the URL. Please go back to the match form and
          run a new search.
        </p>
      </div>
    );
  }

  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          You need to be signed in to view this page.
        </p>
      </div>
    );
  }

  const request = await prisma.request.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      businessId: true,
    },
  });

  if (!request || request.businessId !== currentUser.businessId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Request not found or you don&apos;t have access to it.
        </p>
      </div>
    );
  }

  const services = await listAllProviderServicesForMatching();

  const matches = await scoreServicesWithGroq(
    services as any,
    request.description
  );

  const shortlistItems = await prisma.shortlistItem.findMany({
    where: {
      requestId,
      buyerBusinessId: currentUser.businessId,
    },
    select: { providerServiceId: true },
  });

  const initiallyShortlistedServiceIds = shortlistItems.map(
    (item) => item.providerServiceId
  );

  const requestSummary: RequestSummary = {
    id: request.id,
    title: request.title,
    description: request.description,
    status: request.status,
    createdAt: request.createdAt,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <MatchResults
          request={requestSummary}
          matches={matches}
          initiallyShortlistedServiceIds={initiallyShortlistedServiceIds}
        />
      </div>
    </div>
  );
}
