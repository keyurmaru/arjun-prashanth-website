import { NextRequest, NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation";
import { looksLikeSpam, verifyTurnstile } from "@/lib/spam";
import { isRateLimited } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { site } from "@/content/site";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`contact:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (looksLikeSpam({ honeypot: data.website, formRenderedAt: data.formRenderedAt })) {
    // Silently accept — do not tip off bots that they were detected.
    return NextResponse.json({ ok: true });
  }

  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Spam check failed. Please try again." }, { status: 400 });
  }

  const to = process.env.CONTACT_FORM_TO_EMAIL || site.email;
  const text = [
    `New contact enquiry from arjunprashanth.com`,
    ``,
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || "—"}`,
    `Enquiry type: ${data.enquiryType}`,
    `Subject: ${data.subject}`,
    ``,
    `Message:`,
    data.message,
  ].join("\n");

  const sent = await sendMail({ to, subject: `[Contact] ${data.subject}`, text, replyTo: data.email });

  return NextResponse.json({ ok: true, delivered: sent });
}
