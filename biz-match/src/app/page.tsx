// src/app/page.tsx
import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Background gradient */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),_transparent_55%)]" />

      <div className="relative z-10">
        {/* Top nav */}
        <header className="border-b border-white/5">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 text-xs font-semibold">
                BM
              </div>
              <span className="text-sm font-semibold tracking-tight">
                BizMatch
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-xs text-slate-200 hover:text-white"
              >
                Sign in
              </Link>
              <Link href="/register?next=/app/match">
                <Button
                  size="sm"
                  className="h-8 rounded-full px-4 text-xs font-medium"
                >
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <main className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16 sm:pb-24">
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-medium text-sky-100">
                <Sparkles className="h-3 w-3" />
                AI-first marketplace for small business projects
              </p>

              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.7rem]">
                Find the right agency for your next project — in minutes, not
                months.
              </h1>

              <p className="max-w-xl text-sm text-slate-300">
                BizMatch reads your project brief, understands what you&apos;re
                trying to build, and matches you with specialised service
                providers that actually fit your scope, budget, and timeline.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/register?next=/app/match">
                  <Button className="h-9 rounded-full px-4 text-xs font-medium">
                    Start as buyer
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>

                <Link href="/register?next=/app/provider?step=onboarding">
                  <Button
                    variant="outline"
                    className="h-9 rounded-full border-slate-700 bg-slate-900/60 px-4 text-xs font-medium text-slate-50 hover:bg-slate-800"
                  >
                    List your services
                  </Button>
                </Link>

                <p className="w-full text-[11px] text-slate-400 sm:w-auto">
                  No setup fees. Designed for small teams and solo agencies.
                </p>
              </div>

              {/* Social proof / stats */}
              <div className="flex flex-wrap gap-6 pt-4 text-[11px] text-slate-400">
                <div>
                  <span className="block text-sm font-semibold text-slate-100">
                    10x faster
                  </span>
                  Matching vs manual agency hunting.
                </div>
                <div>
                  <span className="block text-sm font-semibold text-slate-100">
                    Built-in shortlist
                  </span>
                  Compare providers side-by-side in one place.
                </div>
              </div>
            </div>

            {/* Right column: simple card with buyer & provider views */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-900/40 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">
                    Buyer view
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                    AI match complete
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  “I need a React + Next.js agency to build an MVP for my B2B
                  SaaS product.”
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-50">
                        TechCraft Studio
                      </p>
                      <p className="text-[11px] text-slate-400">
                        MVP web app development • Pakistan
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-300">
                      Match 92/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2">
                    <div>
                      <p className="text-xs font-semibold text-slate-50">
                        LaunchPad Digital
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Product design + frontend
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-300">
                      Match 88/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-[11px] text-slate-300">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-100">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  <span>For providers</span>
                </div>
                <p>
                  Create a profile once, list your services, and get discovered
                  whenever a brief matches your skills and pricing.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mt-16 space-y-6">
            <h2 className="text-sm font-semibold text-slate-100">
              Why BizMatch?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 text-[11px] text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-50">
                  <Search className="h-3.5 w-3.5 text-sky-300" />
                  <span>Brief-aware matching</span>
                </div>
                <p>
                  We interpret your free-text brief, extract skills, budget,
                  industry and complexity, then match you to services that
                  actually fit.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-50">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                  <span>Structured shortlists</span>
                </div>
                <p>
                  Save providers you like, compare them side-by-side, and keep
                  your project history organised in one place.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-50">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                  <span>Built for small teams</span>
                </div>
                <p>
                  Simple email login, no heavy onboarding, and workflows
                  optimised for founders, PMs, and agency owners.
                </p>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="mt-16 space-y-4">
            <h2 className="text-sm font-semibold text-slate-100">
              How it works
            </h2>
            <ol className="grid gap-4 text-[11px] text-slate-300 sm:grid-cols-3">
              <li className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-1 text-xs font-semibold text-slate-50">
                  1. Share your brief
                </p>
                <p>
                  Describe what you&apos;re building in plain language — tech
                  stack, goals, budget and timeline if you have them.
                </p>
              </li>
              <li className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-1 text-xs font-semibold text-slate-50">
                  2. Review matches
                </p>
                <p>
                  We rank providers by relevance, credibility and fit. Shortlist
                  favourites and compare them side-by-side.
                </p>
              </li>
              <li className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                <p className="mb-1 text-xs font-semibold text-slate-50">
                  3. Request proposals
                </p>
                <p>
                  Reach out with one click to request proposals from your
                  shortlist. Keep everything in one place.
                </p>
              </li>
            </ol>
          </section>

          {/* Footer-ish */}
          <section className="mt-16 flex flex-col items-center gap-3 text-center">
            <p className="text-xs font-medium text-slate-100">
              Ready to try BizMatch?
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/register?next=/app/match">
                <Button className="h-9 rounded-full px-4 text-xs font-medium">
                  Start as buyer
                </Button>
              </Link>
              <Link href="/register?next=/app/provider?step=onboarding">
                <Button
                  variant="outline"
                  className="h-9 rounded-full border-slate-700 bg-slate-900/60 px-4 text-xs font-medium text-slate-50 hover:bg-slate-800"
                >
                  I&apos;m a service provider
                </Button>
              </Link>
            </div>
            <p className="text-[11px] text-slate-500">
              You can switch between buying and providing services from your
              profile at any time.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
