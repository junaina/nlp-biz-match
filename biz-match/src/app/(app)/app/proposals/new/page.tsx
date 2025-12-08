// src/app/(app)/app/proposals/new/page.tsx
import { redirect } from "next/navigation";
import { getProviderPublicProfile } from "@/modules/provider/service/provider.service";
import { NewProposalForm } from "./_components/NewProposalForm";

type PageProps = {
  searchParams: Promise<{
    businessId?: string;
    serviceId?: string;
  }>;
};

export default async function NewProposalPage({ searchParams }: PageProps) {
  const { businessId, serviceId } = await searchParams;

  if (!businessId) {
    redirect("/app/match");
  }

  const profile = await getProviderPublicProfile(businessId);
  if (!profile) {
    redirect("/app/match");
  }

  const { business, services } = profile;
  const selectedService =
    serviceId && services
      ? services.find((service: { id: string }) => service.id === serviceId)
      : undefined;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="space-y-1">
          <p className="text-xs text-slate-500">Request proposal from</p>
          <h1 className="text-2xl font-semibold">{business.name}</h1>

          {selectedService ? (
            <p className="text-sm text-muted-foreground">
              Service:{" "}
              <span className="font-medium">{selectedService.title}</span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tell {business.name} more about your project so they can send a
              proposal.
            </p>
          )}
        </header>

        <NewProposalForm
          businessId={business.id}
          serviceId={selectedService?.id}
          serviceTitle={selectedService?.title}
        />
      </div>
    </div>
  );
}
