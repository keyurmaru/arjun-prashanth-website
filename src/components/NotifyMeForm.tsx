"use client";

import { useState } from "react";

export default function NotifyMeForm({ bookId }: { bookId: number }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const email = new FormData(e.currentTarget).get("email");
    try {
      const res = await fetch("/api/notify-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="font-inter text-[13px] text-near-black/70 mt-6">We&apos;ll let you know when this book is available.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mt-6">
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        className="border border-near-black/20 focus:border-bronze px-4 py-3 font-inter text-[14px] text-near-black outline-none transition-colors"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="font-inter text-[11px] tracking-[0.16em] uppercase px-6 py-3.5 bg-near-black text-ivory-100 hover:bg-bronze hover:text-near-black transition-colors duration-300 disabled:opacity-60"
      >
        Notify Me
      </button>
      {status === "error" && <p className="font-inter text-[12px] text-red-600 w-full">Could not save that — please try again.</p>}
    </form>
  );
}
