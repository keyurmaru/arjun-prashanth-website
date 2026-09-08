interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "ivory";
  as?: "h1" | "h2";
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  as = "h2",
}: SectionHeadingProps) {
  const Heading = as;
  const isCenter = align === "center";
  const titleColor = tone === "dark" ? "text-ivory-100" : "text-near-black";
  const descColor = tone === "dark" ? "text-muted" : "text-near-black/70";

  return (
    <div className={isCenter ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {eyebrow && (
        <p className="font-inter text-[11px] tracking-[0.2em] uppercase text-bronze mb-3">{eyebrow}</p>
      )}
      <Heading
        className={`font-cormorant font-medium ${titleColor}`}
        style={{ fontSize: as === "h1" ? "clamp(2.5rem, 6vw, 4.25rem)" : "clamp(1.9rem, 4vw, 2.75rem)" }}
      >
        {title}
      </Heading>
      {description && <p className={`font-inter text-[15px] leading-relaxed mt-4 ${descColor}`}>{description}</p>}
    </div>
  );
}
