import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for arjunprashanth.com.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="apr-page apr-legal bg-ivory-100 min-h-screen">
      <section className="apr-ivory apr-section">
        <div className="apr-container max-w-[760px] mx-auto px-6 lg:px-0 pt-40 pb-24">
          <p className="apr-eyebrow">Legal</p>
          <h1 className="apr-h1" style={{ fontSize: "clamp(2rem,4vw,2.6rem)" }}>
            Privacy Policy
          </h1>
          <p className="apr-legal-meta">Last updated: 31 August 2026 · arjunprashanth.com is operated by Arjun Prashanth, India.</p>

          <p className="apr-body">
            This Privacy Policy explains what information arjunprashanth.com (&ldquo;the Site&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) collects
            when you visit, get in touch, or purchase a book, and how that information is used, stored and protected.
          </p>

          <h2 className="apr-h2">1. Information we collect</h2>
          <p className="apr-body">We collect information you provide directly to us, and limited technical information collected automatically.</p>
          <h3 className="apr-h3">Contact and enquiry form</h3>
          <p className="apr-body">
            When you submit the enquiry form on our Contact page, we collect your name, email address, mobile number,
            company/organisation, professional role, enquiry type, subject, message, and any portfolio/IMDb/LinkedIn
            URL you choose to provide. This information is sent to us by email and is used only to respond to your
            enquiry.
          </p>
          <h3 className="apr-h3">Book orders</h3>
          <p className="apr-body">
            If you purchase a book, we collect the information needed to process and deliver your order: your name,
            email, phone number, delivery address, and order details. Payment is processed by Razorpay (see Section
            3) — we do not receive or store your full card, UPI or banking details.
          </p>
          <h3 className="apr-h3">Notify Me</h3>
          <p className="apr-body">
            If a book is not yet available and you use the &ldquo;Notify Me&rdquo; option, we store your email address
            solely to email you when that book becomes available. To be removed from this list before that email is
            sent, contact us at the address in Section 9.
          </p>
          <h3 className="apr-h3">Automatically collected information</h3>
          <p className="apr-body">
            Like most websites, our server and security/performance services automatically log standard technical
            information such as IP address, browser type, device type, pages visited and referring pages. This is
            used for security, performance and troubleshooting, not to identify you personally.
          </p>

          <h2 className="apr-h2">2. How we use your information</h2>
          <ul className="apr-legal-list">
            <li>To respond to enquiries submitted through the Contact page</li>
            <li>To process, fulfil, ship and provide support for book orders</li>
            <li>To send order-related communications (confirmation, shipping/tracking, delivery updates)</li>
            <li>To detect and prevent spam, fraud and abuse</li>
            <li>To maintain and improve the security and performance of the Site</li>
          </ul>
          <p className="apr-body">We do not sell, rent or trade your personal information to third parties for their marketing purposes.</p>

          <h2 className="apr-h2">3. Third-party services we use</h2>
          <p className="apr-body">Certain functions on this Site are provided by third-party services, each governed by its own privacy policy:</p>
          <ul className="apr-legal-list">
            <li>
              <strong>Razorpay</strong> — processes book payments (cards, UPI, net banking, wallets). Razorpay handles
              and stores your payment details directly; we never see or store your full card/UPI credentials.
            </li>
            <li>
              <strong>Shiprocket</strong> — once your order ships, your name, address and phone number are shared
              with Shiprocket and the courier it assigns solely to deliver your order and provide tracking updates.
            </li>
            <li>
              <strong>Google Analytics</strong> — we use Google Analytics to understand how visitors use the Site
              (pages viewed, general location, device type). This involves cookies and processing of your IP address
              by Google; see Google&rsquo;s own privacy policy for how it handles this data.
            </li>
            <li>
              <strong>Spam/bot protection</strong> — our forms are protected by server-side checks (a hidden field
              and submission-timing check) and rate-limiting. We may additionally enable Cloudflare Turnstile, a
              bot-detection challenge that can process your IP address and browser signals, on some forms.
            </li>
          </ul>
          <p className="apr-body">
            Website fonts are served directly from our own server (not fetched from Google at page-load time), so no
            font-related request reaches Google when you browse this Site.
          </p>

          <h2 className="apr-h2">4. Cookies and local storage</h2>
          <p className="apr-body">
            Your shopping cart is stored in your browser&rsquo;s local storage, not a cookie, and never leaves your
            device until you check out. This Site sets a small number of cookies: a security cookie for our admin
            login (relevant only to site staff, not visitors), and — where enabled — cookies set by Google Analytics
            and/or Cloudflare Turnstile as described above. We do not use third-party advertising or cross-site
            tracking cookies.
          </p>

          <h2 className="apr-h2">5. Data retention</h2>
          <p className="apr-body">
            Enquiry form submissions are retained only as long as needed to respond to and resolve your enquiry.
            Order information is retained for as long as required to fulfil your order and to meet our accounting and
            legal obligations.
          </p>

          <h2 className="apr-h2">6. Your rights</h2>
          <p className="apr-body">
            You may ask us to access, correct or delete the personal information we hold about you by writing to us
            at the email address below. We will respond within a reasonable time.
          </p>

          <h2 className="apr-h2">7. Children&rsquo;s privacy</h2>
          <p className="apr-body">This Site is not directed at children, and we do not knowingly collect personal information from children.</p>

          <h2 className="apr-h2">8. Changes to this policy</h2>
          <p className="apr-body">
            We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of
            this page will reflect the most recent revision.
          </p>

          <h2 className="apr-h2">9. Contact us</h2>
          <p className="apr-body">
            For any privacy-related question or request, contact us at{" "}
            <a href="mailto:filmmaker@arjunprashanth.com">filmmaker@arjunprashanth.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
