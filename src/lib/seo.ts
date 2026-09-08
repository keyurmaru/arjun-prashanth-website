import type { Metadata } from "next";

// Hosting-panel env var UIs don't always preserve exact casing (this one is
// stored as "TRUE" in hPanel), so compare case-insensitively rather than
// requiring an exact "true" match.
export const isStaging = (process.env.NEXT_PUBLIC_IS_STAGING || "").toLowerCase() === "true";

// On production this must be arjunprashanth.com; on staging it points at the
// staging origin so canonicals/OG urls never leak the wrong domain.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://arjunprashanth.com").replace(/\/$/, "");

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): Metadata {
  const url = `${siteUrl}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: url },
    robots: isStaging
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Arjun Prashanth Rao",
      images: opts.image ? [{ url: opts.image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.image ? [opts.image] : undefined,
    },
  } satisfies Metadata;
}
