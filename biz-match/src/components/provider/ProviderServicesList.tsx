// src/components/provider/ProviderServicesList.tsx
import { Badge } from "@/components/ui/badge";
import { RequestProposalButton } from "./RequestProposalButton";

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string | null;
  skills: string[];
  minBudget: number | null;
  maxBudget: number | null;
};

type ProviderServicesListProps = {
  businessId: string; // 👈 added
  services: Service[];
};

export function ProviderServicesList({
  businessId,
  services,
}: ProviderServicesListProps) {
  if (services.length === 0) {
    // unchanged ...
  }

  return (
    <section className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
      <h2 className="text-lg font-semibold">Service offerings</h2>
      <div className="space-y-4">
        {services.map((service) => (
          <article
            key={service.id}
            className="rounded-2xl border border-slate-100 p-4 flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-medium text-base">{service.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                {service.category}
              </Badge>
            </div>

            {/* existing industry/budget/skills content... */}

            <div className="flex justify-end">
              <RequestProposalButton
                businessId={businessId}
                serviceId={service.id} // 👈 specific service
                className="bg-blue-600 text-white hover:bg-blue-700"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
