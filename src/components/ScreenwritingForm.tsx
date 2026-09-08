"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const projectFormats = ["Feature Film", "Web Series", "Short Film", "Other"];
const preferredContacts = ["Phone", "WhatsApp", "Email"];
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Status = "idle" | "submitting" | "success" | "error";

export default function ScreenwritingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const renderedAt = useRef(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      fullName: formData.get("fullName"),
      companyProductionHouse: formData.get("companyProductionHouse") || "",
      roleDesignation: formData.get("roleDesignation") || "",
      mobileNumber: formData.get("mobileNumber"),
      email: formData.get("email"),
      preferredContact: formData.get("preferredContact"),
      projectFormat: formData.get("projectFormat"),
      genre: formData.get("genre"),
      language: formData.get("language") || "",
      logline: formData.get("logline"),
      expectedTimeline: formData.get("expectedTimeline") || "",
      consent: formData.get("consent") === "on",
      website: formData.get("website") || "",
      formRenderedAt: renderedAt.current,
      turnstileToken:
        typeof window !== "undefined"
          ? (window as unknown as { __apr_screenwriting_turnstile_token?: string }).__apr_screenwriting_turnstile_token
          : undefined,
    };

    try {
      const res = await fetch("/api/screenwriting-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-bronze/50 px-8 py-12 text-center max-w-2xl">
        <p className="font-cormorant text-2xl text-ivory-100">Thank you — your enquiry has been received.</p>
        <p className="font-inter text-[13px] text-muted mt-4">
          We aim to respond within a reasonable time. Please do not send confidential material until a professional
          discussion has been arranged.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={turnstileSiteKey} data-callback="onAprTurnstileScreenwriting" />
          <Script id="apr-turnstile-screenwriting-callback" strategy="afterInteractive">
            {`window.onAprTurnstileScreenwriting = function(token) { window.__apr_screenwriting_turnstile_token = token; };`}
          </Script>
        </>
      )}

      <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1}>
        <label htmlFor="sw-website">Leave this field empty</label>
        <input type="text" id="sw-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Full Name *" name="fullName" required autoComplete="name" />
        <Field label="Company / Production House" name="companyProductionHouse" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Role / Designation" name="roleDesignation" />
        <Field label="Mobile Number (with country code) *" name="mobileNumber" type="tel" required autoComplete="tel" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Email *" name="email" type="email" required autoComplete="email" />
        <Select label="Preferred Contact Method" name="preferredContact" options={preferredContacts} />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Select label="Project Format *" name="projectFormat" options={projectFormats} required />
        <Field label="Genre *" name="genre" required placeholder="e.g. Crime Drama, Action Thriller" />
      </div>

      <Field label="Language" name="language" />

      <div>
        <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2" htmlFor="logline">
          Short Concept / Logline *
        </label>
        <textarea
          id="logline"
          name="logline"
          required
          minLength={20}
          maxLength={600}
          rows={5}
          placeholder="A brief concept or logline — please do not paste a full screenplay or confidential manuscript here."
          className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors resize-y placeholder:text-muted/50"
        />
      </div>

      <Field label="Expected Timeline" name="expectedTimeline" placeholder="e.g. Pre-production in Q1 2027" />

      <label className="flex items-start gap-3 font-inter text-[13px] text-muted">
        <input type="checkbox" name="consent" required className="mt-1 accent-bronze" />
        <span>I consent to being contacted regarding this enquiry, and confirm I have not included confidential material above. *</span>
      </label>

      {status === "error" && errorMessage && (
        <p role="alert" className="font-inter text-[13px] text-red-400">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 bg-bronze text-dark-950 hover:bg-bronze-light transition-colors duration-300 disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit Enquiry"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors placeholder:text-muted/50"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
  required,
}: {
  label: string;
  name: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-dark-900">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
