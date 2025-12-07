// src/components/provider/ProviderSkillsSection.tsx
import { Badge } from "@/components/ui/badge";

type ProviderSkillsSectionProps = {
  skills: string[];
  categories: string[];
  industries: string[];
};

export function ProviderSkillsSection({
  skills,
  categories,
  industries,
}: ProviderSkillsSectionProps) {
  const uniqueSkills = Array.from(new Set(skills));
  const uniqueCategories = Array.from(new Set(categories));
  const uniqueIndustries = Array.from(new Set(industries.filter(Boolean)));

  return (
    <section className="rounded-3xl bg-white shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Skills &amp; Services</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {uniqueSkills.length === 0 && (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        )}
        {uniqueSkills.map((skill) => (
          <Badge key={skill} variant="secondary" className="text-xs px-3 py-1">
            {skill}
          </Badge>
        ))}
      </div>

      {(uniqueCategories.length > 0 || uniqueIndustries.length > 0) && (
        <div className="grid gap-4 text-sm pt-2 md:grid-cols-2">
          {uniqueCategories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Service categories
              </p>
              <p>{uniqueCategories.join(" • ")}</p>
            </div>
          )}
          {uniqueIndustries.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Typical industries
              </p>
              <p>{uniqueIndustries.join(" • ")}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
