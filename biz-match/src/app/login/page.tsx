// src/app/login/page.tsx
import { redirect } from "next/navigation";
import { loginAndSetCookie } from "@/modules/auth/client/auth.client";

type LoginPageProps = {
  searchParams?: {
    error?: string;
    success?: string;
  };
};

// This is the actual server action used by the <form>.
async function loginAction(formData: FormData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    redirect("/login?error=Invalid%20form%20data");
  }

  try {
    await loginAndSetCookie({ email, password });
  } catch (err) {
    console.error("Login failed:", err);
    redirect("/login?error=Invalid%20email%20or%20password");
  }

  redirect("/app/match");
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const errorMessage = searchParams?.error
    ? decodeURIComponent(searchParams.error)
    : "";
  const successMessage = searchParams?.success
    ? decodeURIComponent(searchParams.success)
    : "";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-sm border border-slate-200 p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-900">
            Sign in to BizMatch
          </h1>
          <p className="text-sm text-slate-500">
            Use your email and password to continue.
          </p>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">
            {successMessage}
          </p>
        )}

        {/* Use the wrapper server action, not loginAndSetCookie directly */}
        <form action={loginAction} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
