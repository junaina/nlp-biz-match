type SearchParams = { [key: string]: string | string[] | undefined };

export default function ComparePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const requestId =
    typeof searchParams.requestId === "string" ? searchParams.requestId : "";
  const servicesParam = searchParams.services;
  const serviceIds =
    typeof servicesParam === "string" && servicesParam.length > 0
      ? servicesParam.split(",")
      : [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold">Compare providers</h1>
        <p className="text-sm text-muted-foreground">
          This is a placeholder comparison view. You can now use{" "}
          <code>requestId</code> and <code>serviceIds</code> to load provider
          details side-by-side.
        </p>

        <div className="rounded-2xl bg-white p-4 shadow-sm text-sm">
          <p>
            <strong>Request:</strong> {requestId || "—"}
          </p>
          <p className="mt-2">
            <strong>Services:</strong>{" "}
            {serviceIds.length > 0 ? serviceIds.join(", ") : "none selected"}
          </p>
        </div>
      </div>
    </div>
  );
}
