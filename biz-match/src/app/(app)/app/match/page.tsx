// src/app/(app)/app/match/page.tsx
import Link from "next/link";
import { MatchForm } from "./_components/MatchForm";

export const metadata = {
  title: "Find providers",
};

export default function MatchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Top bar: title + Become provider CTA */}
        <div className="flex items-center justify-between gap-3">
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold">Tell us what you need</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Describe the project or service you&apos;re looking for.
              We&apos;ll analyse your brief and surface the best-matching
              providers based on their skills and services.
            </p>
          </header>

          <Link
            href="/app/provider"
            className="hidden sm:inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            Become a provider
          </Link>
        </div>

        {/* On mobile, show CTA under the header */}
        <div className="sm:hidden -mt-2">
          <Link
            href="/app/provider"
            className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100"
          >
            Become a provider
          </Link>
        </div>

        <MatchForm />
      </div>
    </div>
  );
}
