import Link from "next/link";

interface CTASectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "dark" | "ivory";
}

export default function CTASection({ eyebrow, title, description, ctaLabel, ctaHref, tone = "dark" }: CTASectionProps) {
  const isIvory = tone === "ivory";
  return (
    <section className={isIvory ? "bg-ivory-100" : "bg-dark-900"}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28 text-center">
        {eyebrow && (
          <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-bronze mb-4">{eyebrow}</p>
        )}
        <h2
          className={`font-cormorant font-medium mx-auto max-w-2xl ${isIvory ? "text-near-black" : "text-ivory-100"}`}
          style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          {title}
        </h2>
        {description && (
          <p className={`font-inter text-[15px] leading-relaxed mt-5 max-w-xl mx-auto ${isIvory ? "text-near-black/70" : "text-muted"}`}>
            {description}
          </p>
        )}
        <Link
          href={ctaHref}
          className="inline-block mt-9 font-inter text-[11px] tracking-[0.16em] uppercase px-8 py-3.5 border border-bronze text-bronze hover:bg-bronze hover:text-dark-950 transition-all duration-300"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
