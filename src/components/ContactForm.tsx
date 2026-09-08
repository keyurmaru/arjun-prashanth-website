"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

const enquiryTypes = [
  "Film / Direction",
  "Screenwriting / Story",
  "Editing",
  "Publishing / Literary",
  "Media",
  "Speaking",
  "Adaptation Rights",
  "General / Collaboration",
];

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
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
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || "",
      enquiryType: formData.get("enquiryType"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
      website: formData.get("website") || "",
      formRenderedAt: renderedAt.current,
      turnstileToken:
        typeof window !== "undefined" ? (window as unknown as { __apr_contact_turnstile_token?: string }).__apr_contact_turnstile_token : undefined,
    };

    try {
      const res = await fetch("/api/contact", {
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
        <p className="font-cormorant text-2xl text-ivory-100">Thank you — your message has been received.</p>
        <p className="font-inter text-[13px] text-muted mt-4">We aim to respond within a reasonable time.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {turnstileSiteKey && (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-callback="onAprTurnstileContact"
          />
          <Script id="apr-turnstile-contact-callback" strategy="afterInteractive">
            {`window.onAprTurnstileContact = function(token) { window.__apr_contact_turnstile_token = token; };`}
          </Script>
        </>
      )}

      {/* Honeypot — hidden from real visitors, left blank by them */}
      <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 pointer-events-none" tabIndex={-1}>
        <label htmlFor="website">Leave this field empty</label>
        <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Name *" name="name" required autoComplete="name" />
        <Field label="Email *" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
        <div>
          <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2" htmlFor="enquiryType">
            Enquiry Type *
          </label>
          <select
            id="enquiryType"
            name="enquiryType"
            required
            className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors"
          >
            {enquiryTypes.map((t) => (
              <option key={t} value={t} className="bg-dark-900">
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Field label="Subject *" name="subject" required maxLength={150} />

      <div>
        <label className="block font-inter text-[11px] tracking-[0.1em] uppercase text-muted mb-2" htmlFor="message">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={6}
          className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors resize-y"
        />
      </div>

      <label className="flex items-start gap-3 font-inter text-[13px] text-muted">
        <input type="checkbox" name="consent" required className="mt-1 accent-bronze" />
        <span>I consent to being contacted regarding this enquiry. *</span>
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
        {status === "submitting" ? "Sending…" : "Send Message"}
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
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
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
        maxLength={maxLength}
        className="w-full bg-transparent border border-dark-800 focus:border-bronze px-4 py-3 font-inter text-[14px] text-ivory-100 outline-none transition-colors"
      />
    </div>
  );
}
