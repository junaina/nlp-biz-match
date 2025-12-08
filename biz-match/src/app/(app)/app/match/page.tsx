// src/app/(app)/app/match/page.tsx
import { MatchForm } from "./_components/MatchForm";

export const metadata = {
  title: "Find providers",
};

export default function MatchPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Tell us what you need</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Describe the project or service you&apos;re looking for. We&apos;ll
            analyse your brief and surface the best-matching providers based on
            their skills and services.
          </p>
        </header>

        <MatchForm />
      </div>
    </div>
  );
}
