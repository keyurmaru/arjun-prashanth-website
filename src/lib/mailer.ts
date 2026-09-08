import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
  return transporter;
}

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

/** Sends via SMTP when configured. Returns false (never throws to the
 * caller) when SMTP isn't configured yet, so the API route can still
 * acknowledge the enquiry was received and logged, without claiming an
 * email was sent that wasn't. */
export async function sendMail({ to, subject, text, replyTo }: SendMailInput): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured — skipping send. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD.");
    return false;
  }
  await t.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    replyTo,
  });
  return true;
}
