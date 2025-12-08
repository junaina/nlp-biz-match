"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  MatchResult,
  RequestSummary,
} from "@/modules/request/domain/request.types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShortlistToggleButton } from "@/components/match/ShortlistToggleButton";

type Props = {
  request: RequestSummary | null;
  matches: MatchResult[];
  initiallyShortlistedServiceIds?: string[];
};

export function MatchResults({
  request,
  matches,
  initiallyShortlistedServiceIds = [],
}: Props) {
  const router = useRouter();

  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(
    () => new Set(initiallyShortlistedServiceIds)
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const categories = useMemo(
    () => Array.from(new Set(matches.map((m) => m.category))).sort(),
    [matches]
  );

  const filteredMatches = useMemo(
    () =>
      matches.filter(
        (m) => categoryFilter === "all" || m.category === categoryFilter
      ),
    [matches, categoryFilter]
  );

  const handleShortlistChange = (serviceId: string, isShortlisted: boolean) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (isShortlisted) {
        next.add(serviceId);
      } else {
        next.delete(serviceId);
      }
      return next;
    });
  };

  const canCompare = shortlistedIds.size >= 2;

  const handleCompareClick = () => {
    if (!request || !canCompare) return;
    const ids = Array.from(shortlistedIds);
    const params = new URLSearchParams();
    params.set("requestId", request.id);
    params.set("services", ids.join(","));
    router.push(`/app/match/compare?${params.toString()}`);
  };

  if (!request) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Matching providers</h2>
          <p className="text-xs text-muted-foreground">
            Based on your brief &quot;{request.title}&quot;.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div className="flex items-center gap-2">
            {categories.length > 1 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs rounded-md border bg-white px-2 py-1"
              >
                <option value="all">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            )}
            <span className="text-xs text-muted-foreground">
              {filteredMatches.length} of {matches.length} matches
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canCompare}
            onClick={handleCompareClick}
          >
            Compare ({shortlistedIds.size})
          </Button>
        </div>
      </div>

      {filteredMatches.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm text-sm text-muted-foreground">
          No matches after filters. Try clearing filters or adding more detail
          about the tech stack, industry or scope.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <article
              key={match.serviceId}
              className="rounded-2xl bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/app/providers/${match.businessId}?requestId=${request.id}&serviceId=${match.serviceId}`}
                    className="font-medium hover:underline"
                    prefetch={false}
                  >
                    {match.businessName}
                  </Link>
                  <Badge variant="outline" className="text-xs">
                    {match.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {match.serviceTitle}
                </p>
                <p className="text-xs text-muted-foreground">{match.why}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground">
                  Score: {match.score}
                </span>
                <div className="flex gap-2">
                  <Link
                    href={`/app/providers/${match.businessId}`}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    View profile
                  </Link>
                  <ShortlistToggleButton
                    requestId={request.id}
                    providerServiceId={match.serviceId}
                    initialShortlisted={shortlistedIds.has(match.serviceId)}
                    onChange={(isShortlisted) =>
                      handleShortlistChange(match.serviceId, isShortlisted)
                    }
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
