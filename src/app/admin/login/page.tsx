"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/auth/login", {
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
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#1A1A1A] flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-black/10 p-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-black/40 mb-1">Arjun Prashanth</p>
        <h1 className="text-xl font-medium mb-6">Admin Login</h1>

        <label className="block text-[12px] text-black/60 mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full border border-black/20 px-3 py-2 text-[14px] mb-4 outline-none focus:border-black"
        />

        <label className="block text-[12px] text-black/60 mb-1" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border border-black/20 px-3 py-2 text-[14px] mb-6 outline-none focus:border-black"
        />

        {error && (
          <p role="alert" className="text-[13px] text-red-600 mb-4">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white text-[13px] tracking-[0.08em] uppercase py-3 disabled:opacity-60"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
