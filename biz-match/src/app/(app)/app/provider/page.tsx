// src/app/(app)/app/provider/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  getMyBusiness,
  listMyServices,
} from "@/modules/provider/service/provider.service";
import { ProviderProfileForm } from "./_components/ProfileForm";
import { ServicesManager } from "./_components/ServicesManager";
import ProviderOnboarding from "./_components/ProviderOnboarding";

type PageProps = {
  searchParams: Promise<{ step?: string }>;
};

export default async function ProviderSetupPage({ searchParams }: PageProps) {
  // ✅ unwrap the Promise from Next 16
  const { step } = await searchParams;

  const business = await getMyBusiness();
  if (!business) {
    redirect("/login?next=/app/provider");
  }

  const services = await listMyServices();

  const forceOnboarding = step === "onboarding";

  // If they force onboarding OR haven’t finished basic provider setup yet,
  // show the onboarding step.
  const needsOnboarding =
    forceOnboarding ||
    !business.isProvider ||
    !business.locationCity ||
    !business.locationCountry;

  if (needsOnboarding) {
    return <ProviderOnboarding business={business} />;
  }

  // Otherwise show the provider profile + services manager (existing UI)
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* 🔙 Back to previous provider step */}
        <div>
          <Link
            href="/app/provider?step=onboarding"
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to setup
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">
            Provider profile for {business.name}
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Set up your public profile and define the services you offer. This
            information will be used when buyers are matched with you.
          </p>
        </header>

        <section>
          <ProviderProfileForm
            initial={{
              name: business.name,
              logoUrl: business.logoUrl ?? "",
              locationCity: business.locationCity ?? "",
              locationCountry: business.locationCountry ?? "",
              website: business.website ?? "",
              bio: business.bio ?? "",
              isBuyer: business.isBuyer,
              isProvider: business.isProvider,
            }}
          />
        </section>

        <section>
          <ServicesManager initialServices={services} />
        </section>
      </div>
    </div>
  );
}
