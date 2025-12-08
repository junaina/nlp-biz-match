// src/app/(app)/app/match/compare/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { compareShortlistedServices } from "@/modules/request/service/comparison.service";

type SearchParams = {
  requestId?: string;
  services?: string; // comma-separated serviceIds
};

export const metadata = {
  title: "Compare agencies",
};

export default async function ComparePage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const { requestId, services } = await props.searchParams;

  if (!requestId || !services) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600">
          Missing request or services in the URL. Please go back to the results
          and select at least two providers to compare.
        </p>
      </div>
    );
  }

  const serviceIds = services.split(",").filter(Boolean);

  if (serviceIds.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600">
          Please select at least two shortlisted services to compare.
        </p>
      </div>
    );
  }

  let comparison;
  try {
    comparison = await compareShortlistedServices(requestId, serviceIds);
  } catch (err: any) {
    console.error(err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm text-red-600">
          {err?.message ?? "Could not load comparison."}
        </p>
      </div>
    );
  }

  const { services: compared, recommendation } = comparison;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Back link */}
        <Link
          href={`/app/match/results/${requestId}`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-blue-600"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to results
        </Link>

        {/* Header */}
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Compare agencies</h1>
          <p className="text-sm text-muted-foreground">
            Side-by-side comparison of {compared.length} shortlisted providers
            for your brief &quot;{comparison.requestTitle}&quot;.
          </p>
        </header>

        {/* Comparison table */}
        <div className="rounded-3xl bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 w-40">
                    Category
                  </th>
                  {compared.map((svc) => (
                    <th key={svc.serviceId} className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200 flex items-center justify-center text-xs font-medium">
                          {svc.businessName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <div className="font-medium">{svc.businessName}</div>
                          <div className="text-xs text-muted-foreground">
                            {svc.locationCity ?? "—"}
                            {svc.locationCountry
                              ? `, ${svc.locationCountry}`
                              : ""}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {svc.serviceTitle}
                          </div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Rating */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Rating
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      {svc.ratingValue ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {svc.ratingValue.toFixed(1)}/5
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ({svc.ratingCount} ratings)
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Not rated yet
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Credibility */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Credibility (estimated)
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      {svc.credibilityScore != null ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {svc.credibilityScore}/100
                            </span>
                            <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                              <div
                                className="h-1.5 rounded-full bg-emerald-500"
                                style={{
                                  width: `${Math.min(
                                    Math.max(svc.credibilityScore, 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                          {svc.projectsExperience && (
                            <p className="text-xs text-muted-foreground">
                              {svc.projectsExperience}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Not evaluated
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Pricing range */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Pricing range
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div className="text-sm">
                          {svc.minBudget != null && svc.maxBudget != null
                            ? `$${svc.minBudget.toLocaleString()} – $${svc.maxBudget.toLocaleString()}`
                            : "Not specified"}
                        </div>
                        {svc.pricingComment && (
                          <p className="text-xs text-muted-foreground">
                            {svc.pricingComment}
                          </p>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Success likelihood */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Success likelihood (estimated)
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      {svc.successLikelihood != null ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {svc.successLikelihood}%
                          </span>
                          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                            <div
                              className="h-1.5 rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.min(
                                  Math.max(svc.successLikelihood, 0),
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Not evaluated
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Response time */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Response time (estimated)
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      <div className="text-sm">
                        {svc.responseSpeed ?? "Not specified"}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Skills */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Skills
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        {(svc.skillsHighlights.length
                          ? svc.skillsHighlights
                          : svc.skills
                        ).map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Specialisation */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Specialisation
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      {svc.specialisationHighlights.length ? (
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          {svc.specialisationHighlights.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-muted-foreground">—</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Communication */}
                <tr className="border-b">
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Communication
                  </td>
                  {compared.map((svc) => (
                    <td key={svc.serviceId} className="px-6 py-4 align-top">
                      {svc.communicationHighlights.length ? (
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          {svc.communicationHighlights.map((x) => (
                            <li key={x}>{x}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-muted-foreground">—</div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">
                    Actions
                  </td>
                  {compared.map((svc) => (
                    <td
                      key={svc.serviceId}
                      className="px-6 py-4 align-top space-y-2"
                    >
                      <div>
                        {/* You can wire this to a proposal flow later */}
                        <button className="w-full rounded-full bg-blue-600 text-white text-xs font-medium py-2">
                          Request proposal
                        </button>
                      </div>
                      <div>
                        <Link
                          href={`/app/providers/${svc.businessId}`}
                          className="block w-full rounded-full border text-xs text-center py-2 text-slate-700 hover:bg-slate-50"
                        >
                          View full profile
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AI recommendation */}
        <section className="rounded-3xl bg-blue-50 border border-blue-100 px-5 py-4 space-y-2">
          <h2 className="text-sm font-semibold">AI recommendation</h2>
          <p className="text-xs text-muted-foreground">
            {recommendation.reason}
          </p>
        </section>
      </div>
    </div>
  );
}
