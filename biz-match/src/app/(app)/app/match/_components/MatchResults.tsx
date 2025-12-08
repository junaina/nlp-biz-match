// src/app/(app)/app/match/_components/MatchResults.tsx
"use client";

import type {
  MatchResult,
  RequestSummary,
} from "@/modules/request/domain/request.types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShortlistToggleButton } from "@/components/match/ShortlistToggleButton";

type Props = {
  request: RequestSummary | null;
  matches: MatchResult[];
};

export function MatchResults({ request, matches }: Props) {
  if (!request) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Matching providers</h2>
          <p className="text-xs text-muted-foreground">
            Based on your brief &quot;{request.title}&quot;.
          </p>
        </div>
        <span className="text-xs text-muted-foreground">
          {matches.length} matches
        </span>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 shadow-sm text-sm text-muted-foreground">
          No matches yet. Try adding a bit more detail about the tech stack,
          industry or scope.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
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
                  />{" "}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
