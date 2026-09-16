"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Login failed.");
        setSubmitting(false);
        return;
      }
      router.push(searchParams.get("next") || "/account/orders");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-ivory-100 text-near-black min-h-screen flex items-center justify-center px-4 pt-24">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-near-black/10 p-8">
        <p className="font-inter text-[11px] tracking-[0.16em] uppercase text-bronze mb-1">My Account</p>
        <h1 className="font-cormorant font-medium text-2xl text-near-black mb-6">Sign In</h1>
        <p className="font-inter text-[13px] text-near-black/60 mb-6">
          Use the email and password sent to you when you placed your order.
        </p>

        <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-near-black/60 mb-2" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border border-near-black/20 focus:border-bronze px-4 py-3 font-inter text-[14px] text-near-black outline-none transition-colors mb-4"
        />

        <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-near-black/60 mb-2" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full bg-transparent border border-near-black/20 focus:border-bronze px-4 py-3 font-inter text-[14px] text-near-black outline-none transition-colors mb-6"
        />

        {error && (
          <p role="alert" className="font-inter text-[13px] text-red-600 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
