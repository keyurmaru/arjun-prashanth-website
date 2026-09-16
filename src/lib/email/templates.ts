import { renderEmail, emailRow, emailRowsTable, emailButton, textToHtml } from "./layout";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/seo";
import type { OrderRecord } from "@/lib/orders";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

function fmtRupees(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

function addressLines(order: OrderRecord): string[] {
  return [
    order.address.line1,
    order.address.line2 || "",
    `${order.address.city}, ${order.address.state} ${order.address.pincode}`,
    order.address.country,
  ].filter(Boolean);
}

function itemRowsHtml(order: OrderRecord): string {
  return order.items
    .map((i) => {
      const extras = [i.signed && "Signed", i.personalisationMessage && `Personalised: "${i.personalisationMessage}"`]
        .filter(Boolean)
        .join(" · ");
      return `
        <tr>
          <td style="padding:10px 0; border-bottom:1px solid #eee; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#2a2a2a;">
            ${i.quantity} × ${i.bookTitle} (${i.variantFormat})${extras ? `<div style="font-size:11px; color:#6b6b6b; margin-top:2px;">${extras}</div>` : ""}
          </td>
          <td style="padding:10px 0; border-bottom:1px solid #eee; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#2a2a2a; text-align:right; white-space:nowrap;">
            ${fmtRupees(i.unitPricePaise * i.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

function itemLinesText(order: OrderRecord): string[] {
  return order.items.map((i) => {
    const extras = [i.signed && "Signed", i.personalisationMessage && `Personalised: "${i.personalisationMessage}"`]
      .filter(Boolean)
      .join(", ");
    return `${i.quantity} x ${i.bookTitle} (${i.variantFormat})${extras ? ` [${extras}]` : ""} — ${fmtRupees(i.unitPricePaise)} each`;
  });
}

// ---- Contact & screenwriting enquiries (to admin) ----

export interface ContactEnquiryData {
  name: string;
  email: string;
  phone?: string;
  enquiryType: string;
  subject: string;
  message: string;
}

export function contactEnquiryEmail(data: ContactEnquiryData): EmailContent {
  const rows = emailRowsTable(
    [
      emailRow("Name", data.name),
      emailRow("Email", data.email),
      emailRow("Phone", data.phone || "—"),
      emailRow("Enquiry type", data.enquiryType),
      emailRow("Subject", data.subject),
    ].join(""),
  );
  const bodyHtml = `
    ${rows}
    <div style="margin-top:8px; padding-top:16px; border-top:1px solid #e8e4dc;">
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#6b6b6b; margin-bottom:8px;">Message</div>
      ${textToHtml(data.message)}
    </div>`;

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

  return {
    subject: `[Contact] ${data.subject}`,
    html: renderEmail({ eyebrow: "New Enquiry", heading: "Contact form submission", bodyHtml }),
    text,
  };
}

export interface ScreenwritingEnquiryData {
  fullName: string;
  companyProductionHouse?: string;
  roleDesignation?: string;
  mobileNumber: string;
  email: string;
  preferredContact: string;
  projectFormat: string;
  genre: string;
  language?: string;
  expectedTimeline?: string;
  logline: string;
}

export function screenwritingEnquiryEmail(data: ScreenwritingEnquiryData): EmailContent {
  const rows = emailRowsTable(
    [
      emailRow("Full name", data.fullName),
      emailRow("Company / Production House", data.companyProductionHouse || "—"),
      emailRow("Role / Designation", data.roleDesignation || "—"),
      emailRow("Mobile", data.mobileNumber),
      emailRow("Email", data.email),
      emailRow("Preferred contact", data.preferredContact),
      emailRow("Project format", data.projectFormat),
      emailRow("Genre", data.genre),
      emailRow("Language", data.language || "—"),
      emailRow("Expected timeline", data.expectedTimeline || "—"),
    ].join(""),
  );
  const bodyHtml = `
    ${rows}
    <div style="margin-top:8px; padding-top:16px; border-top:1px solid #e8e4dc;">
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#6b6b6b; margin-bottom:8px;">Logline</div>
      ${textToHtml(data.logline)}
    </div>`;

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

  return {
    subject: `[Screenwriting Enquiry] ${data.fullName}`,
    html: renderEmail({ eyebrow: "New Enquiry", heading: "Screenwriting enquiry", bodyHtml }),
    text,
  };
}

// ---- Orders ----

export function orderConfirmationEmail(order: OrderRecord): EmailContent {
  const bodyHtml = `
    <p style="margin:0 0 24px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#2a2a2a;">
      Thank you for your order, ${order.address.name}. Here's a summary of what you ordered.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${itemRowsHtml(order)}
      <tr>
        <td style="padding:14px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; font-weight:bold; color:#0d0f10;">Total paid</td>
        <td style="padding:14px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; color:#0d0f10; text-align:right;">${fmtRupees(order.totalPaise)}</td>
      </tr>
    </table>
    <div style="margin-top:28px; padding-top:16px; border-top:1px solid #e8e4dc;">
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#6b6b6b; margin-bottom:8px;">Shipping to</div>
      <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; color:#2a2a2a;">${addressLines(order).join("<br>")}</p>
    </div>
    <p style="margin:24px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:1.6; color:#6b6b6b;">
      You'll receive a separate update once your order is dispatched.
    </p>`;

  const text = [
    `Thank you for your order, ${order.address.name}!`,
    ``,
    `Here's what you ordered:`,
    ...itemLinesText(order),
    ``,
    `Total paid: ${fmtRupees(order.totalPaise)}`,
    ``,
    `We'll ship to:`,
    ...addressLines(order),
    ``,
    `You'll receive a separate update once your order is dispatched.`,
    ``,
    `— ${site.name}`,
  ].join("\n");

  return {
    subject: `Your order #${order.id} is confirmed`,
    html: renderEmail({ eyebrow: "Order Confirmed", heading: `Order #${order.id}`, bodyHtml }),
    text,
  };
}

export function newOrderAdminEmail(
  order: OrderRecord,
  paymentId: string,
  warnings: { oversold: string[]; shipmentFailed: boolean },
): EmailContent {
  const warningBlocks: string[] = [];
  if (warnings.oversold.length > 0) {
    warningBlocks.push(
      `<p style="margin:0 0 16px; padding:12px 16px; background:#fff4f0; border-left:3px solid #c0392b; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#8a2f20;">⚠ OVERSOLD — payment captured but insufficient stock for: ${warnings.oversold.join(", ")}. Resolve manually (refund or restock).</p>`,
    );
  }
  if (warnings.shipmentFailed) {
    warningBlocks.push(
      `<p style="margin:0 0 16px; padding:12px 16px; background:#fff4f0; border-left:3px solid #c0392b; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#8a2f20;">⚠ SHIPMENT CREATION FAILED — payment is fine, but the Shiprocket order didn't get created. Retry from the order's admin page.</p>`,
    );
  }

  const rows = emailRowsTable(
    [
      emailRow("Customer", order.address.name),
      emailRow("Email", order.address.email),
      emailRow("Phone", order.address.phone),
      emailRow("Address", addressLines(order).join(", ")),
      emailRow("Payment ID", paymentId),
    ].join(""),
  );

  const bodyHtml = `
    ${warningBlocks.join("")}
    ${rows}
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:16px;">
      ${itemRowsHtml(order)}
      <tr>
        <td style="padding:14px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#6b6b6b;">Subtotal</td>
        <td style="padding:14px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#2a2a2a; text-align:right;">${fmtRupees(order.subtotalPaise)}</td>
      </tr>
      <tr>
        <td style="padding:4px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#6b6b6b;">Shipping</td>
        <td style="padding:4px 0; font-family:Arial,Helvetica,sans-serif; font-size:13px; color:#2a2a2a; text-align:right;">${fmtRupees(order.shippingPaise)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; color:#0d0f10;">Total</td>
        <td style="padding:8px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:14px; font-weight:bold; color:#0d0f10; text-align:right;">${fmtRupees(order.totalPaise)}</td>
      </tr>
    </table>
    ${emailButton("View order in admin", `${siteUrl}/admin/orders/${order.id}`)}`;

  const text = [
    `Order #${order.id} — payment ${paymentId}`,
    ...(warnings.oversold.length > 0
      ? ["", `⚠ OVERSOLD — payment captured but insufficient stock for: ${warnings.oversold.join(", ")}. Resolve manually (refund or restock).`]
      : []),
    ...(warnings.shipmentFailed
      ? ["", `⚠ SHIPMENT CREATION FAILED — payment is fine, but the Shiprocket order didn't get created. Retry from the order's admin page.`]
      : []),
    ``,
    `Customer: ${order.address.name}`,
    `Email: ${order.address.email}`,
    `Phone: ${order.address.phone}`,
    `Address: ${addressLines(order).join(", ")}`,
    ``,
    `Items:`,
    ...itemLinesText(order),
    ``,
    `Subtotal: ${fmtRupees(order.subtotalPaise)}`,
    `Shipping: ${fmtRupees(order.shippingPaise)}`,
    `Total: ${fmtRupees(order.totalPaise)}`,
  ].join("\n");

  return {
    subject: `[Order #${order.id}] New paid order`,
    html: renderEmail({ eyebrow: "New Order", heading: `Order #${order.id} — ${fmtRupees(order.totalPaise)}`, bodyHtml }),
    text,
  };
}

export function shipmentStatusEmail(order: OrderRecord, event: "shipped" | "delivered"): EmailContent {
  const trackingLine = order.trackingUrl ? `Track your order: ${order.trackingUrl}` : "";
  const awbLine = order.awbCode ? `AWB: ${order.awbCode}${order.courierName ? ` (${order.courierName})` : ""}` : "";

  if (event === "shipped") {
    const bodyHtml = `
      <p style="margin:0 0 20px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#2a2a2a;">
        Good news, ${order.address.name} — your order #${order.id} has shipped!
      </p>
      ${awbLine ? emailRowsTable(emailRow("AWB", order.awbCode! + (order.courierName ? ` (${order.courierName})` : ""))) : ""}
      ${order.trackingUrl ? emailButton("Track your order", order.trackingUrl) : ""}`;

    const text = [`Good news, ${order.address.name} — your order #${order.id} has shipped!`, ``, awbLine, trackingLine, ``, `— ${site.name}`]
      .filter(Boolean)
      .join("\n");

    return {
      subject: `Your order #${order.id} has shipped`,
      html: renderEmail({ eyebrow: "Order Shipped", heading: `Order #${order.id} is on its way`, bodyHtml }),
      text,
    };
  }

  const bodyHtml = `
    <p style="margin:0; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#2a2a2a;">
      Your order #${order.id} has been delivered. We hope you enjoy it!
    </p>`;
  const text = [`Your order #${order.id} has been delivered. We hope you enjoy it!`, ``, `— ${site.name}`].join("\n");

  return {
    subject: `Your order #${order.id} was delivered`,
    html: renderEmail({ eyebrow: "Order Delivered", heading: `Order #${order.id} has arrived`, bodyHtml }),
    text,
  };
}

// ---- Customer account ----

/** Sent once, the moment an order-triggered customer account is first
 * created (fulfillOrder.ts) — never re-sent for a repeat order from an
 * existing customer, and the password is never shown anywhere else. */
export function accountCreatedEmail(email: string, password: string): EmailContent {
  const loginUrl = `${siteUrl}/account/login`;
  const bodyHtml = `
    <p style="margin:0 0 20px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#2a2a2a;">
      We've created an account for you so you can check your order status and see your order history any time.
    </p>
    ${emailRowsTable([emailRow("Email", email), emailRow("Password", password)].join(""))}
    <p style="margin:16px 0 0; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:1.6; color:#6b6b6b;">
      For your security, consider changing this password after you log in.
    </p>
    ${emailButton("Log in to your account", loginUrl)}`;

  const text = [
    `We've created an account for you so you can check your order status and see your order history any time.`,
    ``,
    `Email: ${email}`,
    `Password: ${password}`,
    ``,
    `For your security, consider changing this password after you log in.`,
    ``,
    loginUrl,
    ``,
    `— ${site.name}`,
  ].join("\n");

  return {
    subject: "Your account has been created",
    html: renderEmail({ eyebrow: "Account Created", heading: "Welcome", bodyHtml }),
    text,
  };
}

// ---- Notify Me ----

export function bookAvailableEmail(bookTitle: string, bookUrl: string): EmailContent {
  const bodyHtml = `
    <p style="margin:0 0 8px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:1.6; color:#2a2a2a;">
      Good news — <strong>${bookTitle}</strong> is now available to order.
    </p>
    ${emailButton("View the book", bookUrl)}`;
  const text = [`Good news — "${bookTitle}" is now available to order.`, ``, bookUrl, ``, `— ${site.name}`].join("\n");

  return {
    subject: `${bookTitle} is now available`,
    html: renderEmail({ eyebrow: "Now Available", heading: bookTitle, bodyHtml }),
    text,
  };
}
