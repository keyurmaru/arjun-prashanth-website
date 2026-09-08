import { NextRequest, NextResponse } from "next/server";
import { screenwritingFormSchema } from "@/lib/validation";
import { looksLikeSpam, verifyTurnstile } from "@/lib/spam";
import { isRateLimited } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { site } from "@/content/site";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(`screenwriting:${ip}`)) {
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
  const text = [
    `New screenwriting enquiry from arjunprashanth.com`,
    ``,
    `Full name: ${data.fullName}`,
    `Company / Production House: ${data.companyProductionHouse || "—"}`,
    `Role / Designation: ${data.roleDesignation || "—"}`,
    `Mobile: ${data.mobileNumber}`,
    `Email: ${data.email}`,
    `Preferred contact: ${data.preferredContact}`,
    `Project format: ${data.projectFormat}`,
    `Genre: ${data.genre}`,
    `Language: ${data.language || "—"}`,
    `Expected timeline: ${data.expectedTimeline || "—"}`,
    ``,
    `Short concept / logline:`,
    data.logline,
  ].join("\n");

  const sent = await sendMail({ to, subject: `[Screenwriting Enquiry] ${data.fullName}`, text, replyTo: data.email });

  return NextResponse.json({ ok: true, delivered: sent });
}
