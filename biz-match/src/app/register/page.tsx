// src/app/register/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { registerAndLogin } from "@/modules/auth/client/auth.client";

type RegisterPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

// Server action that handles registration + sets cookie
async function registerAction(formData: FormData) {
  "use server";

  const name = formData.get("name");
  const businessName = formData.get("businessName");
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof name !== "string" ||
    typeof businessName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    redirect("/register?error=Invalid%20form%20data");
  }

  try {
    await registerAndLogin({ name, businessName, email, password });
  } catch (err) {
    console.error("Registration failed:", err);
    redirect("/register?error=Registration%20failed");
  }

  // On success, go straight to the brief page
  redirect("/app/match");
}

export default function RegisterPage({ searchParams }: RegisterPageProps) {
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-5">
        <header className="space-y-1">
          <h1 className="text-lg font-semibold">Create your account</h1>
          <p className="text-xs text-muted-foreground">
            We&apos;ll create a workspace for your business and your user
            profile.
          </p>
        </header>

        {errorMessage && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            {successMessage}
          </p>
        )}

        <form action={registerAction} className="space-y-3">
          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor="name"
            >
              Your name
            </label>
            <Input id="name" name="name" required className="h-9 text-sm" />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor="businessName"
            >
              Business name
            </label>
            <Input
              id="businessName"
              name="businessName"
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor="email"
            >
              Work email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-xs font-medium text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="h-9 text-sm"
            />
          </div>

          <Button type="submit" className="w-full h-9 text-xs font-medium">
            Sign up
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
