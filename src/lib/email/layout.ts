// Every email the site sends goes through this shell — table-based markup
// and inline styles throughout (not a <style> block), since that's what
// actually survives Gmail/Outlook/Apple Mail's HTML stripping. Colors
// match the site's own palette (src/app/globals.css) exactly.
const COLORS = {
  darkBg: "#0d0f10",
  ivory: "#f3efe7",
  bronze: "#b58a62",
  bronzeLight: "#c9a07a",
  bodyText: "#2a2a2a",
  muted: "#6b6b6b",
  border: "#e8e4dc",
  pageBg: "#f5f5f3",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Renders a plain multi-line string as HTML paragraphs — used for the
 * body content of simpler emails so callers don't have to hand-write
 * markup for every line. */
export function textToHtml(text: string): string {
  return text
    .split("\n\n")
    .map((para) =>
      para
        .split("\n")
        .map((line) => escapeHtml(line))
        .join("<br>"),
    )
    .map((p) => `<p style="margin:0 0 16px; font-size:14px; line-height:1.6; color:${COLORS.bodyText};">${p}</p>`)
    .join("");
}

export function emailButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="background:${COLORS.darkBg}; border-radius:2px;">
          <a href="${href}" style="display:inline-block; padding:12px 28px; font-family:Arial,Helvetica,sans-serif; font-size:12px; letter-spacing:1px; text-transform:uppercase; color:${COLORS.ivory}; text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

/** A labeled key/value row, for order summaries and enquiry details. */
export function emailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; font-size:12px; color:${COLORS.muted}; vertical-align:top; width:150px;">${escapeHtml(label)}</td>
      <td style="padding:6px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:${COLORS.bodyText};">${escapeHtml(value)}</td>
    </tr>`;
}

export function emailRowsTable(rows: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">${rows}</table>`;
}

export interface EmailLayoutOptions {
  preheader?: string; // hidden preview text shown in inbox lists
  eyebrow: string; // small label above the heading, e.g. "New Enquiry"
  heading: string;
  bodyHtml: string;
}

export function renderEmail({ preheader, eyebrow, heading, bodyHtml }: EmailLayoutOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(heading)}</title>
  </head>
  <body style="margin:0; padding:0; background:${COLORS.pageBg};">
    ${preheader ? `<div style="display:none; max-height:0; overflow:hidden; opacity:0;">${escapeHtml(preheader)}</div>` : ""}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.pageBg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#ffffff;">
            <tr>
              <td style="background:${COLORS.darkBg}; padding:28px 36px;">
                <div style="font-family:Georgia,'Times New Roman',serif; color:${COLORS.ivory}; font-size:13px; letter-spacing:3px; text-transform:uppercase;">Arjun Prashanth</div>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 36px 8px;">
                <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:2px; text-transform:uppercase; color:${COLORS.bronze}; margin-bottom:10px;">${escapeHtml(eyebrow)}</div>
                <h1 style="margin:0 0 24px; font-family:Georgia,'Times New Roman',serif; font-weight:500; font-size:24px; color:${COLORS.darkBg};">${escapeHtml(heading)}</h1>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 36px 32px; border-top:1px solid ${COLORS.border}; margin-top:24px;">
                <p style="margin:20px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:11px; color:${COLORS.muted};">
                  This is an automated message from arjunprashanth.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
