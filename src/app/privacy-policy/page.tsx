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
              <strong>Cloudflare Turnstile</strong> — used on our contact form to distinguish real visitors from
              automated bots/spam. Turnstile may process your IP address and browser signals as part of this check.
            </li>
            <li><strong>WooCommerce</strong> — the store platform that manages carts, orders and checkout on this Site.</li>
            <li>
              <strong>Google Fonts</strong> — typefaces used on this Site are loaded from Google&rsquo;s font
              servers, which may receive your IP address as part of that request.
            </li>
            <li>
              <strong>Shipping/courier partner</strong> — once your order ships, your name, address and phone number
              are shared with our shipping/courier partner solely to deliver your order.
            </li>
          </ul>
          <p className="apr-body">
            We may add analytics tools such as Google Analytics or Google Search Console in the future to understand
            how visitors use the Site; if enabled, this section will be updated to reflect that.
          </p>

          <h2 className="apr-h2">4. Cookies</h2>
          <p className="apr-body">
            This Site uses a limited number of cookies required for the store, security and performance to function:
            WooCommerce cart/session cookies, a spam-protection cookie set by Cloudflare Turnstile on the contact
            form, and caching cookies used only to speed up page delivery for logged-in/administrative use. We do not
            use third-party advertising or cross-site tracking cookies.
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
