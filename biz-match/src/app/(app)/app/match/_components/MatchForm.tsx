"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRequestClient } from "@/modules/request/client/request.client";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

export function MatchForm() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [timeline, setTimeline] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Please describe what you are looking for.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        description,
        industry: industry || null,
        budgetMin: budgetMin ? Number(budgetMin) : null,
        budgetMax: budgetMax ? Number(budgetMax) : null,
        timeline: timeline || null,
      };

      const result = await createRequestClient(payload);

      // ✅ Redirect to dedicated results page
      router.push(`/app/match/results/${result.request.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-base font-semibold">Your brief</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            What are you looking to get done?
          </label>
          <Textarea
            rows={6}
            placeholder="E.g. We need an MVP web app for a B2B SaaS product, with user auth, billing, and an admin dashboard..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Industry (optional)</label>
            <Input
              placeholder="SaaS, eCommerce, Healthcare..."
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Timeline (optional)</label>
            <Input
              placeholder="e.g. 0–3 months, ASAP"
              value={timeline}
              onChange={(e) => setTimeline(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Min budget (optional)</label>
            <Input
              type="number"
              placeholder="e.g. 2000"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Max budget (optional)</label>
            <Input
              type="number"
              placeholder="e.g. 10000"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Find matches
        </Button>
      </form>
    </div>
  );
}
