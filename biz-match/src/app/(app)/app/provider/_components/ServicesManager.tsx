// src/app/(app)/app/provider/_components/ServicesManager.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  industry: string | null;
  skills: string[];
  minBudget: number | null;
  maxBudget: number | null;
};

type ServicesManagerProps = {
  initialServices: Service[];
};

export function ServicesManager({ initialServices }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    industry: "",
    skillsInput: "",
    minBudget: "",
    maxBudget: "",
  });

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const skills =
      form.skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      industry: form.industry || null,
      skills,
      minBudget: form.minBudget ? Number(form.minBudget) : null,
      maxBudget: form.maxBudget ? Number(form.maxBudget) : null,
    };

    const res = await fetch("/api/provider/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setCreating(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create service");
      return;
    }

    const created: Service = await res.json();
    setServices((prev) => [created, ...prev]);

    setForm({
      title: "",
      description: "",
      category: "",
      industry: "",
      skillsInput: "",
      minBudget: "",
      maxBudget: "",
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service offerings</CardTitle>
          <CardDescription>
            Describe the main types of projects you take on. These are used for
            matching with buyer projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Service title</Label>
              <Input
                id="title"
                placeholder="e.g. MVP Web App Development"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="What’s included in this service? Ideal clients? Tech stack?"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Development, Design, Marketing..."
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Typical industry (optional)</Label>
                <Input
                  id="industry"
                  placeholder="SaaS, eCommerce, Healthcare..."
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skills">Skills / tags (comma separated)</Label>
                <Input
                  id="skills"
                  placeholder="React, Next.js, PostgreSQL, UX Audit..."
                  value={form.skillsInput}
                  onChange={(e) => update("skillsInput", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBudget">Min budget (optional)</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    min={0}
                    value={form.minBudget}
                    onChange={(e) => update("minBudget", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Max budget (optional)</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    min={0}
                    value={form.maxBudget}
                    onChange={(e) => update("maxBudget", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <CardFooter className="px-0">
              <Button type="submit" disabled={creating}>
                {creating ? "Adding..." : "Add service"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Existing services</h3>
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No services yet. Add your first one above.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className="text-base">{service.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {service.category}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {service.description}
                  </p>

                  {service.industry && (
                    <p className="text-xs text-muted-foreground">
                      Industry: {service.industry}
                    </p>
                  )}

                  {service.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {service.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {(service.minBudget || service.maxBudget) && (
                    <p className="text-xs text-muted-foreground pt-1">
                      Budget:{" "}
                      {service.minBudget
                        ? `from $${service.minBudget}`
                        : "flexible"}
                      {service.maxBudget ? ` up to $${service.maxBudget}` : ""}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
