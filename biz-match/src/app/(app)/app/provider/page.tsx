// src/app/(app)/app/provider/page.tsx
import { redirect } from "next/navigation";
import {
  getMyBusiness,
  listMyServices,
} from "@/modules/provider/service/provider.service";
import { ProviderProfileForm } from "./_components/ProfileForm";
import { ServicesManager } from "./_components/ServicesManager";

export default async function ProviderSetupPage() {
  const business = await getMyBusiness();
  if (!business) {
    redirect("/login?next=/app/provider");
  }

  const services = await listMyServices();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
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
