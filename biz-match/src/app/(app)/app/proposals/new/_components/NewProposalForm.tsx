// src/app/(app)/app/proposals/new/_components/NewProposalForm.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type Props = {
  businessId: string;
  serviceId?: string;
  serviceTitle?: string;
};

export function NewProposalForm({
  businessId,
  serviceId,
  serviceTitle,
}: Props) {
  const router = useRouter();

  const [projectTitle, setProjectTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      businessId,
      serviceId,
      projectTitle,
      summary,
      budget,
      timeline,
    };

    // FRONTEND-ONLY STUB
    console.log("[Proposal request payload - stub only]", payload);
    alert(
      "Proposal request captured (frontend only).\n\n" +
        "In the next version, this will be sent to the provider via email or API."
    );

    router.push(`/app/providers/${businessId}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl bg-white p-6 shadow-sm"
    >
      {serviceTitle && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          You&apos;re requesting a proposal for{" "}
          <span className="font-medium">{serviceTitle}</span>.
        </p>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="projectTitle"
          className="text-xs font-medium text-slate-700"
        >
          Project title
        </label>
        <Input
          id="projectTitle"
          className="h-9 text-sm"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          placeholder="e.g. New marketing website for B2B SaaS"
          required
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="summary" className="text-xs font-medium text-slate-700">
          Brief description
        </label>
        <Textarea
          id="summary"
          rows={5}
          className="text-sm"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Describe what you need, any goals, and links to reference material."
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="budget"
            className="text-xs font-medium text-slate-700"
          >
            Budget (optional)
          </label>
          <Input
            id="budget"
            className="h-9 text-sm"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. $3,000–$5,000"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="timeline"
            className="text-xs font-medium text-slate-700"
          >
            Timeline (optional)
          </label>
          <Input
            id="timeline"
            className="h-9 text-sm"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g. 6–8 weeks, start in May"
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-4 text-xs font-medium"
        >
          {isSubmitting ? "Sending…" : "Send request"}
        </Button>
      </div>
    </form>
  );
}
