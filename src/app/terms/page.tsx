import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Terms & Conditions for arjunprashanth.com.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="apr-page apr-legal bg-ivory-100 min-h-screen">
      <section className="apr-ivory apr-section">
        <div className="apr-container max-w-[760px] mx-auto px-6 lg:px-0 pt-40 pb-24">
          <p className="apr-eyebrow">Legal</p>
          <h1 className="apr-h1" style={{ fontSize: "clamp(2rem,4vw,2.6rem)" }}>
            Terms &amp; Conditions
          </h1>
          <p className="apr-legal-meta">Last updated: 31 August 2026 · arjunprashanth.com is operated by Arjun Prashanth, India.</p>

          <p className="apr-body">
            These Terms &amp; Conditions govern your use of arjunprashanth.com (the &ldquo;Site&rdquo;), including
            browsing the portfolio and purchasing books. By using the Site, you agree to these terms.
          </p>

          <h2 className="apr-h2">1. About this Site</h2>
          <p className="apr-body">
            This Site is the official portfolio and literary platform of Arjun Prashanth, Film Director, Screenwriter
            and Author, and includes a store for the direct purchase of published books.
          </p>

          <h2 className="apr-h2">2. Intellectual property</h2>
          <p className="apr-body">
            All film stills, posters, photographs, written content, book excerpts, logos and creative material on
            this Site are the intellectual property of Arjun Prashanth (or used with permission) and are protected by
            copyright. You may not reproduce, distribute or use this material commercially without prior written
            permission.
          </p>

          <h2 className="apr-h2">3. Contacting us / submitting material</h2>
          <p className="apr-body">
            The enquiry form on this Site is intended for professional enquiries (film, publishing, media, events and
            general contact). Please do not submit unsolicited full screenplays, pitch decks or confidential
            manuscripts through the public form — sensitive material should only be shared after an appropriate
            professional discussion has been arranged separately.
          </p>

          <h2 className="apr-h2">4. Book purchases</h2>
          <ul className="apr-legal-list">
            <li>Prices shown at checkout are in Indian Rupees (INR) unless stated otherwise, and are subject to change without prior notice.</li>
            <li>Payments are processed securely via Razorpay. We do not store your full payment details.</li>
            <li>An order is confirmed once payment is successfully processed and you receive an order confirmation email.</li>
            <li>
              Returns, cancellations and refunds are governed by our{" "}
              <a href="/refund-cancellation">Refund &amp; Cancellation Policy</a>.
            </li>
            <li>
              Shipping timelines and coverage are governed by our{" "}
              <a href="/shipping-delivery">Shipping &amp; Delivery Policy</a>.
            </li>
          </ul>

          <h2 className="apr-h2">5. Acceptable use</h2>
          <p className="apr-body">
            You agree not to misuse the Site, including attempting unauthorised access, scraping or bulk-copying
            content, submitting false information at checkout, or using the Site for any unlawful purpose.
          </p>

          <h2 className="apr-h2">6. Third-party links</h2>
          <p className="apr-body">
            This Site may link to third-party platforms such as Instagram, IMDb, YouTube or other social profiles. We
            are not responsible for the content or privacy practices of those external sites.
          </p>

          <h2 className="apr-h2">7. Limitation of liability</h2>
          <p className="apr-body">
            The Site and its content are provided &ldquo;as is&rdquo;. To the fullest extent permitted by law, Arjun
            Prashanth shall not be liable for any indirect, incidental or consequential loss arising from use of the
            Site.
          </p>

          <h2 className="apr-h2">8. Governing law</h2>
          <p className="apr-body">
            These Terms are governed by the laws of India, and any disputes shall be subject to the jurisdiction of
            the courts of India.
          </p>

          <h2 className="apr-h2">9. Changes to these terms</h2>
          <p className="apr-body">
            We may revise these Terms from time to time. The &ldquo;Last updated&rdquo; date above reflects the most
            recent revision. Continued use of the Site after changes constitutes acceptance of the revised Terms.
          </p>

          <h2 className="apr-h2">10. Contact us</h2>
          <p className="apr-body">
            Questions about these Terms can be sent to{" "}
            <a href="mailto:filmmaker@arjunprashanth.com">filmmaker@arjunprashanth.com</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
