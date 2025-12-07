// src/components/provider/ProviderHero.tsx
import Image from "next/image";
import { Star, MapPin, BadgeCheck, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestProposalButton } from "./RequestProposalButton";
import { cn } from "@/lib/utils";

type ProviderHeroProps = {
  businessId: string;
  name: string;
  tagline: string;
  logoUrl?: string | null;
  locationText?: string;
  rating?: number | null;
  reviewCount?: number | null;
  verified?: boolean;
};

export function ProviderHero({
  businessId,
  name,
  tagline,
  logoUrl,
  locationText,
  rating,
  reviewCount,
  verified,
}: ProviderHeroProps) {
  const displayRating = rating && rating > 0;

  return (
    <section className="rounded-3xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg overflow-hidden mb-6">
      <div className="h-32 w-full" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pb-6 -mt-12">
        <div className="flex items-start gap-4">
          <div className="relative h-24 w-24 rounded-2xl overflow-hidden border-4 border-white bg-white/80 shadow">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                fill
                style={{ objectFit: "cover" }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-2xl font-semibold text-slate-700">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{name}</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                  <BadgeCheck className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>
            {tagline && (
              <p className="text-sm text-white/90 max-w-xl">{tagline}</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-white/90 pt-1">
              {displayRating && (
                <div className="inline-flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{rating!.toFixed(1)}</span>
                  {typeof reviewCount === "number" && (
                    <span className="text-white/80">
                      ({reviewCount} reviews)
                    </span>
                  )}
                </div>
              )}

              {locationText && (
                <div className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{locationText}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Global "Request proposal" */}
          <RequestProposalButton
            businessId={businessId}
            className="bg-white text-blue-600 hover:bg-slate-100"
          />

          {/* Add to shortlist – now transparent with white text */}
          <Button
            type="button"
            className="border border-white/60 bg-transparent text-white hover:bg-white/10"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add to shortlist
          </Button>
        </div>
      </div>
    </section>
  );
}
