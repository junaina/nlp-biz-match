// src/app/(app)/app/provider/_components/ProviderOnboarding.tsx
"use client";

import { useState, useTransition } from "react";
import type { Business, ProviderService } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  becomeProvider,
  updateMyBusinessProfile,
} from "@/modules/provider/service/provider.service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  business: Business;
  services: ProviderService[];
};

export default function ProviderOnboarding({ business }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [locationCity, setLocationCity] = useState(business.locationCity ?? "");
  const [locationCountry, setLocationCountry] = useState(
    business.locationCountry ?? ""
  );
  const [website, setWebsite] = useState(business.website ?? "");
  const [bio, setBio] = useState(business.bio ?? "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        // Mark them as provider + update profile
        await becomeProvider();
        await updateMyBusinessProfile({
          locationCity,
          locationCountry,
          website,
          bio,
        } as any); // subset of BusinessProfileInput

        // ✅ Go to the next step (provider profile + services)
        router.push("/app/provider");
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to save provider profile.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back to brief */}
        <div>
          <Link
            href="/app/match"
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back to brief
          </Link>
        </div>

        <header className="space-y-2">
          <p className="text-xs text-blue-600 font-medium">Become a provider</p>
          <h1 className="text-2xl font-semibold">
            Set up your agency profile on BizMatch
          </h1>
          <p className="text-sm text-muted-foreground">
            Add a few details about your business. Next, you&apos;ll add the
            services you offer so buyers can find you in AI-powered matches.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">City</label>
              <Input
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="e.g. Lahore"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Country
              </label>
              <Input
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                placeholder="e.g. Pakistan"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Website (optional)
            </label>
            <Input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://youragency.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Short bio
            </label>
            <Textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="What does your agency specialise in? What kinds of projects are a great fit?"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground max-w-xs">
              You can edit these details anytime from your provider dashboard.
            </p>
            <Button type="submit" disabled={isPending} className="text-xs px-4">
              {isPending ? "Saving…" : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
