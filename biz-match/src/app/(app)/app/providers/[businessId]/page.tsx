// src/app/(app)/app/providers/[businessId]/page.tsx
import { notFound } from "next/navigation";
import { getProviderPublicProfile } from "@/modules/provider/service/provider.service";
import { ProviderHero } from "@/components/provider/ProviderHero";
import { ProviderSkillsSection } from "@/components/provider/ProviderSkillsSection";
import { ProviderServicesList } from "@/components/provider/ProviderServicesList";

type RouteParams = {
  businessId: string;
  searchParams: { requestId?: string; serviceId?: string };
};

export default async function ProviderPublicPage(props: {
  params: RouteParams;
  searchParams: { requestId?: string; serviceId?: string };
}) {
  // 👇 THIS is the important line
  const { businessId } = await props.params;
  const { requestId, serviceId } = await props.searchParams;

  const result = await getProviderPublicProfile(businessId);

  if (!result) {
    notFound();
  }

  const { business, services } = result;

  const skills = services.flatMap((s) => s.skills ?? []);
  const categories = services.map((s) => s.category);
  const industries = services.map((s) => s.industry ?? "");

  const locationParts = [
    business.locationCity ?? "",
    business.locationCountry ?? "",
  ].filter(Boolean);
  const locationText = locationParts.join(", ");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ProviderHero
          businessId={businessId}
          name={business.name}
          tagline={business.bio ?? ""}
          logoUrl={business.logoUrl}
          locationText={locationText}
          rating={business.avgRating}
          reviewCount={business.ratingCount}
          verified={business.verified}
          requestId={requestId} // No request context here
          primaryServiceId={serviceId} // No request context here
        />

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <ProviderSkillsSection
              skills={skills}
              categories={categories}
              industries={industries}
            />
            <ProviderServicesList services={services} businessId={businessId} />
          </div>

          <aside className="space-y-4">
            {/* right-hand cards, can keep simple for now */}
          </aside>
        </div>
      </div>
    </div>
  );
}
