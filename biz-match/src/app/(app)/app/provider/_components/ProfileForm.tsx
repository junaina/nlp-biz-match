// src/app/(app)/app/provider/_components/ProfileForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

type ProviderProfileFormProps = {
  initial: {
    name: string;
    logoUrl: string;
    locationCity: string;
    locationCountry: string;
    website: string;
    bio: string;
    isBuyer: boolean;
    isProvider: boolean;
  };
};

export function ProviderProfileForm({ initial }: ProviderProfileFormProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<null | {
    type: "success" | "error";
    text: string;
  }>(null);

  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/provider/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMessage({
        type: "error",
        text: data.error ?? "Failed to save profile",
      });
      return;
    }

    setMessage({
      type: "success",
      text: "Profile saved",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business profile</CardTitle>
        <CardDescription>
          Basic information about your agency or business. This is shown to
          buyers on your public profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                placeholder="https://..."
                value={form.logoUrl}
                onChange={(e) => update("logoUrl", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.locationCity}
                onChange={(e) => update("locationCity", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.locationCountry}
                onChange={(e) => update("locationCountry", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://your-site.com"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short description</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Explain what you do, your niche, and ideal clients..."
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Switch
                id="isProvider"
                checked={form.isProvider}
                onCheckedChange={(checked) => update("isProvider", checked)}
              />
              <Label htmlFor="isProvider">Offer services (provider)</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="isBuyer"
                checked={form.isBuyer}
                onCheckedChange={(checked) => update("isBuyer", checked)}
              />
              <Label htmlFor="isBuyer">Post projects (buyer)</Label>
            </div>
          </div>

          {message && (
            <p
              className={
                message.type === "success"
                  ? "text-sm text-emerald-600"
                  : "text-sm text-red-500"
              }
            >
              {message.text}
            </p>
          )}

          <CardFooter className="px-0">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
