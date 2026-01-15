"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Filter,
  Star,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShortlistToggleButton } from "@/components/match/ShortlistToggleButton";
import type {
  MatchResult,
  RequestSummary,
} from "@/modules/request/domain/request.types";

type Props = {
  request: RequestSummary | null;
  matches: MatchResult[];
  initiallyShortlistedServiceIds?: string[];
};

type RatingOption = {
  label: string;
  value: number;
};

const RATING_OPTIONS: RatingOption[] = [
  { label: "4.5+", value: 4.5 },
  { label: "4.0+", value: 4.0 },
  { label: "3.5+", value: 3.5 },
];

export function MatchResults({
  request,
  matches,
  initiallyShortlistedServiceIds = [],
}: Props) {
  const router = useRouter();

  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(
    () => new Set(initiallyShortlistedServiceIds)
  );
  const [minRating, setMinRating] = useState<number | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [industryFilter, setIndustryFilter] = useState<string>("all");

  const industries = useMemo(
    () =>
      Array.from(
        new Set(
          matches
            .map((m) => m.industry)
            .filter((i): i is string => Boolean(i && i.trim()))
        )
      ).sort(),
    [matches]
  );

  const totalVerified = useMemo(
    () => matches.filter((m) => m.isVerified).length,
    [matches]
  );
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      const rating = m.ratingValue ?? 0;

      if (minRating !== null && (rating || 0) < minRating) return false;
      if (verifiedOnly && !m.isVerified) return false;
      if (industryFilter !== "all" && m.industry !== industryFilter) {
        return false;
      }
      return true;
    });
  }, [matches, minRating, verifiedOnly, industryFilter]);
  if (!request) return null;

  const handleShortlistChange = (serviceId: string, isShortlisted: boolean) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (isShortlisted) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });
  };

  const canCompare = shortlistedIds.size >= 2;

  const handleCompareClick = () => {
    if (!canCompare) return;
    const ids = Array.from(shortlistedIds);
    const params = new URLSearchParams();
    params.set("requestId", request.id);
    params.set("services", ids.join(","));
    router.push(`/app/match/compare?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinRating(null);
    setVerifiedOnly(false);
    setIndustryFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Top nav / brand / compare button */}
      <nav className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/app/match")}
          className="inline-flex items-center text-xs text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to Brief
        </button>

        <div className="flex items-center gap-2">
          <div className="h-8 px-3 rounded-full bg-slate-900 text-white text-xs font-medium flex items-center justify-center shadow-sm">
            <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-[10px]">
              BM
            </span>
            BizMatch
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="rounded-full px-4 text-xs font-medium"
          disabled={!canCompare}
          onClick={handleCompareClick}
        >
          Compare ({shortlistedIds.size})
        </Button>
      </nav>

      {/* AI match summary */}
      <section className="space-y-1">
        <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3 w-3" />
          AI match complete
        </p>
        <p className="text-sm font-semibold">
          {totalVerified} verified agencies found
        </p>
        <p className="text-xs text-muted-foreground">
          Ranked by relevance and match score for your brief. All agencies are
          vetted providers in the marketplace.
        </p>
      </section>

      {/* Main content: sidebar + list */}
      <section className="flex flex-col gap-6 md:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full md:w-64 shrink-0 rounded-3xl bg-white shadow-sm border border-slate-100 p-4 space-y-4 self-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Filters
            </span>
            <Filter className="h-4 w-4 text-slate-400" />
          </div>

          {/* Minimum rating */}
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-slate-500">
              Minimum rating
            </p>
            <div className="space-y-1">
              {RATING_OPTIONS.map((opt) => {
                const active = minRating === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() =>
                      setMinRating((prev) =>
                        prev === opt.value ? null : opt.value
                      )
                    }
                    className={`flex w-full items-center gap-2 rounded-full border px-2.5 py-1.5 text-[11px] ${
                      active
                        ? "border-amber-400 bg-amber-50 text-amber-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verified only */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setVerifiedOnly((v) => !v)}
              className="flex items-center gap-2 text-[11px] text-slate-700"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-[6px] border ${
                  verifiedOnly
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-transparent"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
              </span>
              Verified only
            </button>
          </div>

          {/* Industry */}
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-[11px] font-medium text-slate-500">Industry</p>
            <div className="relative">
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear */}
          <div className="pt-2">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 text-[11px] text-slate-700 hover:bg-slate-100"
            >
              Clear all
            </button>
          </div>
        </aside>

        {/* Results list */}
        <div className="flex-1 space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="rounded-3xl bg-white border border-dashed border-slate-200 p-6 text-sm text-muted-foreground">
              No agencies match the current filters. Try relaxing the minimum
              rating or turning off “Verified only”.
            </div>
          ) : (
            filteredMatches.map((match, index) => (
              <ResultCard
                key={match.serviceId}
                rank={index + 1}
                requestId={request.id}
                match={match}
                isShortlisted={shortlistedIds.has(match.serviceId)}
                onShortlistChange={handleShortlistChange}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}

/* --- Individual agency card --- */

type ResultCardProps = {
  rank: number;
  requestId: string;
  match: MatchResult;
  isShortlisted: boolean;
  onShortlistChange: (serviceId: string, isShortlisted: boolean) => void;
};

function ResultCard({
  rank,
  requestId,
  match,
  isShortlisted,
  onShortlistChange,
}: ResultCardProps) {
  const rating = match.ratingValue ?? null;
  const ratingCount = match.ratingCount ?? 0;
  const location =
    match.locationCity && match.locationCountry
      ? `${match.locationCity}, ${match.locationCountry}`
      : match.locationCity || match.locationCountry || "Location not set";

  const budget =
    match.minBudget != null && match.maxBudget != null
      ? `$${match.minBudget.toLocaleString()} – $${match.maxBudget.toLocaleString()}`
      : "Pricing not specified";

  const skills = match.skills ?? [];

  return (
    <article className="rounded-3xl bg-white shadow-sm border border-slate-100 p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-b from-purple-500 to-purple-600 text-xs font-semibold text-white">
            #{rank}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{match.businessName}</h3>
              {match.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              {rating && (
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                  {ratingCount > 0 && (
                    <span className="text-slate-400">
                      ({ratingCount} reviews)
                    </span>
                  )}
                </span>
              )}
              <span>•</span>
              <span>{location}</span>
            </div>

            <p className="text-xs text-slate-600">{match.why}</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right">
          <span className="text-[11px] font-medium text-emerald-600">
            Match score
          </span>
          <span className="text-sm font-semibold text-emerald-700">
            {Math.round(match.score)}/100
          </span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 6).map((skill) => (
            <span
              key={skill}
              className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-600">
        <div className="flex items-center gap-1">
          <span className="font-medium text-slate-700">Pricing</span>
          <span className="text-slate-500">· {budget}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium text-slate-700">Category</span>
          <span className="text-slate-500">
            · {match.category || "Not set"}
          </span>
        </div>
        {match.industry && (
          <div className="flex items-center gap-1">
            <span className="font-medium text-slate-700">Industry</span>
            <span className="text-slate-500">· {match.industry}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <Link
            href={`/app/providers/${match.businessId}`}
            className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            View profile
          </Link>
        </div>

        <ShortlistToggleButton
          requestId={requestId}
          providerServiceId={match.serviceId}
          initialShortlisted={isShortlisted}
          onChange={(isShortlisted) =>
            onShortlistChange(match.serviceId, isShortlisted)
          }
        />
      </div>
    </article>
  );
}
