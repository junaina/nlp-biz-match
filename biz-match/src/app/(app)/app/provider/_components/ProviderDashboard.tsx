// src/app/(app)/app/provider/_components/ProviderDashboard.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Minimal shapes for what the UI actually needs
type ProviderDashboardBusiness = {
  id: string;
  name: string;
};

type ProviderDashboardService = {
  id: string;
  title: string;
  category: string;
  industry: string | null;
  minBudget: number | null;
  maxBudget: number | null;
};

type Props = {
  business: ProviderDashboardBusiness;
  services: ProviderDashboardService[];
};

export default function ProviderDashboard({ business, services }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-emerald-600 font-medium">
              Provider dashboard
            </p>
            <h1 className="text-2xl font-semibold">
              {business.name || "Your agency"}
            </h1>
            <p className="text-sm text-muted-foreground">
              You&apos;re now visible to buyers searching for services that
              match your offerings.
            </p>
          </div>

          <div className="flex gap-2">
            <Link href={`/app/providers/${business.id}`}>
              <Button variant="outline" size="sm" className="text-xs">
                View public profile
              </Button>
            </Link>
            <Link href="/app/provider/services">
              <Button size="sm" className="text-xs">
                Add service
              </Button>
            </Link>
          </div>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold">Your services</h2>
          {services.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              You haven&apos;t created any services yet. Click &quot;Add
              service&quot; above to create your first one.
            </p>
          ) : (
            <ul className="space-y-3 text-sm">
              {services.map((svc) => (
                <li
                  key={svc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-slate-800">{svc.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {svc.category} · {svc.industry || "No industry set"}
                    </p>
                  </div>
                  <div className="text-xs text-slate-600">
                    {svc.minBudget != null && svc.maxBudget != null
                      ? `$${svc.minBudget}–$${svc.maxBudget}`
                      : "Budget not set"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
