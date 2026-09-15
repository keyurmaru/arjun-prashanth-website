import { NextRequest, NextResponse } from "next/server";
import { screenwritingFormSchema } from "@/lib/validation";
import { looksLikeSpam, verifyTurnstile } from "@/lib/spam";
import { isRateLimited, isBypassedIp } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { screenwritingEnquiryEmail } from "@/lib/email/templates";
import { site } from "@/content/site";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!isBypassedIp(ip) && isRateLimited(`screenwriting:${ip}`)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = screenwritingFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Please check the form for errors.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;

  if (looksLikeSpam({ honeypot: data.website, formRenderedAt: data.formRenderedAt })) {
    return NextResponse.json({ ok: true });
  }

  const turnstileOk = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json({ ok: false, error: "Spam check failed. Please try again." }, { status: 400 });
  }

  const to = process.env.SCREENWRITING_FORM_TO_EMAIL || site.email;
  const email = screenwritingEnquiryEmail(data);
  const sent = await sendMail({ to, subject: email.subject, text: email.text, html: email.html, replyTo: data.email });

  return NextResponse.json({ ok: true, delivered: sent });
}
