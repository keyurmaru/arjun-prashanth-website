"use client";

import { useEffect, useRef } from "react";

type RevealVariant = "up" | "left" | "fade";

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}

/** Scroll-triggered reveal, matching the approved Figma motion system. Honors
 * prefers-reduced-motion via the CSS in globals.css (transitions disabled
 * there), so no JS branching is needed here. */
export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => el.classList.add("is-visible"), delay);
          observer.unobserve(el);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={`reveal-${variant} ${className}`}>
      {children}
    </div>
  );
}
